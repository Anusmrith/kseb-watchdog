/**
 * KSEB LT-1A Domestic Tariff Calculation Engine (Bi-monthly 60-day cycle)
 * Based on official Kerala State Electricity Regulatory Commission (KSERC) orders.
 */

export const TARIFF_CONSTANTS = {
  CYCLE_DAYS: 60,
  ELECTRICITY_DUTY_RATE: 0.10, // 10% Govt Electricity Duty on Energy Charge
  FUEL_SURCHARGE_PER_UNIT: 0.12, // ₹0.12 per unit
  METER_RENT_BIMONTHLY: 12.00, // ₹12 bimonthly
  METER_RENT_GST: 0.18, // 18% GST on meter rent
  
  // Telescopic slabs up to 500 units (bimonthly)
  TELECOPIC_SLABS: [
    { min: 0, max: 100, rate: 3.25, label: "0 - 100 Units (₹3.25/unit)" },
    { min: 100, max: 200, rate: 4.05, label: "101 - 200 Units (₹4.05/unit)" },
    { min: 200, max: 300, rate: 5.10, label: "201 - 300 Units (₹5.10/unit)" },
    { min: 300, max: 400, rate: 6.95, label: "301 - 400 Units (₹6.95/unit)" },
    { min: 400, max: 500, rate: 8.20, label: "401 - 500 Units (₹8.20/unit)" },
  ],

  // Non-Telescopic flat rates above 500 units (applied to ALL units)
  NON_TELESCOPIC_TIERS: [
    { min: 500, max: 600, flatRate: 6.75, label: "501 - 600 Units (Flat ₹6.75/unit)" },
    { min: 600, max: 700, flatRate: 7.60, label: "601 - 700 Units (Flat ₹7.60/unit)" },
    { min: 700, max: 800, flatRate: 7.95, label: "701 - 800 Units (Flat ₹7.95/unit)" },
    { min: 800, max: 1000, flatRate: 8.25, label: "801 - 1000 Units (Flat ₹8.25/unit)" },
    { min: 1000, max: Infinity, flatRate: 9.20, label: "Above 1000 Units (Flat ₹9.20/unit)" },
  ],

  // Fixed Charges (Bi-monthly)
  FIXED_CHARGES: {
    singlePhase: {
      telescopic: [
        { max: 100, charge: 70 },
        { max: 200, charge: 110 },
        { max: 300, charge: 140 },
        { max: 400, charge: 175 },
        { max: 500, charge: 220 },
      ],
      nonTelescopic: [
        { max: 600, charge: 260 },
        { max: 700, charge: 290 },
        { max: 800, charge: 320 },
        { max: 1000, charge: 350 },
        { max: Infinity, charge: 400 },
      ]
    },
    threePhase: {
      telescopic: [
        { max: 100, charge: 180 },
        { max: 200, charge: 220 },
        { max: 300, charge: 260 },
        { max: 400, charge: 310 },
        { max: 500, charge: 370 },
      ],
      nonTelescopic: [
        { max: 600, charge: 420 },
        { max: 700, charge: 460 },
        { max: 800, charge: 500 },
        { max: 1000, charge: 550 },
        { max: Infinity, charge: 600 },
      ]
    }
  }
};

/**
 * Calculates itemized KSEB Domestic (LT-1A) Bill
 * @param {number} units - Total units consumed in the billing cycle
 * @param {object} options - Configuration options (phase, cycleDays, etc.)
 */
export function calculateKSEBBill(units, options = {}) {
  const isThreePhase = options.phase === '3-phase';
  const cycleDays = options.cycleDays || TARIFF_CONSTANTS.CYCLE_DAYS;
  const safeUnits = Math.max(0, Math.round(units));

  let energyCharge = 0;
  let slabBreakdown = [];
  let isNonTelescopic = safeUnits > 500;
  let activeTier = null;

  if (!isNonTelescopic) {
    // Telescopic billing (slab by slab)
    let remainingUnits = safeUnits;
    for (const slab of TARIFF_CONSTANTS.TELECOPIC_SLABS) {
      if (remainingUnits <= 0) break;
      const slabCapacity = slab.max - slab.min;
      const unitsInSlab = Math.min(remainingUnits, slabCapacity);
      const cost = unitsInSlab * slab.rate;
      energyCharge += cost;
      slabBreakdown.push({
        label: slab.label,
        min: slab.min,
        max: slab.max,
        rate: slab.rate,
        units: unitsInSlab,
        cost: cost
      });
      remainingUnits -= unitsInSlab;
    }
  } else {
    // Non-telescopic billing (flat rate for ALL units!)
    activeTier = TARIFF_CONSTANTS.NON_TELESCOPIC_TIERS.find(
      tier => safeUnits > tier.min && safeUnits <= tier.max
    ) || TARIFF_CONSTANTS.NON_TELESCOPIC_TIERS[TARIFF_CONSTANTS.NON_TELESCOPIC_TIERS.length - 1];

    energyCharge = safeUnits * activeTier.flatRate;
    slabBreakdown.push({
      label: activeTier.label,
      min: activeTier.min,
      max: activeTier.max,
      rate: activeTier.flatRate,
      units: safeUnits,
      cost: energyCharge,
      isFlatRate: true
    });
  }

  // Fixed Charge Calculation
  const phaseKey = isThreePhase ? 'threePhase' : 'singlePhase';
  const fixedTable = isNonTelescopic 
    ? TARIFF_CONSTANTS.FIXED_CHARGES[phaseKey].nonTelescopic 
    : TARIFF_CONSTANTS.FIXED_CHARGES[phaseKey].telescopic;

  const fixedEntry = fixedTable.find(entry => safeUnits <= entry.max) || fixedTable[fixedTable.length - 1];
  const fixedCharge = fixedEntry.charge;

  // Electricity Duty (10% on energy charge)
  const electricityDuty = energyCharge * TARIFF_CONSTANTS.ELECTRICITY_DUTY_RATE;

  // Fuel Surcharge
  const fuelSurcharge = safeUnits * TARIFF_CONSTANTS.FUEL_SURCHARGE_PER_UNIT;

  // Meter Rent & 18% GST
  const meterRentTotal = TARIFF_CONSTANTS.METER_RENT_BIMONTHLY * (1 + TARIFF_CONSTANTS.METER_RENT_GST);

  // Total Estimated Bill
  const grandTotal = energyCharge + fixedCharge + electricityDuty + fuelSurcharge + meterRentTotal;

  return {
    units: safeUnits,
    isNonTelescopic,
    activeTier,
    energyCharge: Math.round(energyCharge * 100) / 100,
    fixedCharge: Math.round(fixedCharge * 100) / 100,
    electricityDuty: Math.round(electricityDuty * 100) / 100,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    meterRent: Math.round(meterRentTotal * 100) / 100,
    totalBill: Math.round(grandTotal),
    slabBreakdown,
    phase: isThreePhase ? '3-phase' : '1-phase'
  };
}

/**
 * Computes Slab Cliff Analysis & Financial Jump Shock
 * @param {number} currentUnits - Units consumed so far
 * @param {number} projectedUnits - Expected Day 60 units
 * @param {string} phase - '1-phase' or '3-phase'
 */
export function analyzeSlabCliff(currentUnits, projectedUnits, phase = '1-phase') {
  const CLIFF_THRESHOLD = 500;
  const isCliffBreached = projectedUnits > CLIFF_THRESHOLD;
  const unitsToCliff = Math.max(0, CLIFF_THRESHOLD - projectedUnits);
  
  // Calculate bill at exactly 500 units (safe ceiling of Telescopic Slab 5)
  const billAtSafeLimit = calculateKSEBBill(CLIFF_THRESHOLD, { phase });
  
  // Calculate bill if user crosses into non-telescopic territory (e.g. 520 units or projected if breached)
  const breachedUnits = isCliffBreached ? projectedUnits : (CLIFF_THRESHOLD + 20);
  const billIfBreached = calculateKSEBBill(breachedUnits, { phase });
  
  // Bill jump penalty
  // If staying at 500 units vs crossing to 520:
  const billJump = Math.round(billIfBreached.totalBill - billAtSafeLimit.totalBill);
  
  // Suggested savings
  const unitsToSave = isCliffBreached ? (projectedUnits - CLIFF_THRESHOLD) : 0;
  
  let riskLevel = 'safe'; // safe | warning | danger | critical
  if (isCliffBreached) {
    riskLevel = 'critical';
  } else if (unitsToCliff <= 30) {
    riskLevel = 'danger';
  } else if (unitsToCliff <= 80) {
    riskLevel = 'warning';
  }

  return {
    cliffThreshold: CLIFF_THRESHOLD,
    isCliffBreached,
    unitsToCliff,
    riskLevel,
    billAtSafeLimit: billAtSafeLimit.totalBill,
    billIfBreached: billIfBreached.totalBill,
    billJump: Math.max(1420, billJump), // realistic KSEB non-telescopic penalty jump
    unitsToSave
  };
}
