/**
 * Kerala Household Appliance Specifications & Energy Signatures
 * Tuned for authentic KSEB billing cycle (60 days)
 */

export const INITIAL_APPLIANCES = [
  {
    id: "ac_1_5_ton",
    nameEn: "1.5 Ton Inverter AC",
    nameMl: "1.5 ടൺ ഇൻവെർട്ടർ AC",
    category: "cooling",
    icon: "snowflake",
    watts: 1100, // Average inverter wattage under thermostat cycle
    usageValue: 7, // 7 hrs/day
    usageUnit: "hrs/day",
    usageUnitMl: "മണിക്കൂർ/ദിവസം",
    minUsage: 0,
    maxUsage: 24,
    step: 0.5,
    alwaysOn: false,
    isActive: true,
    // Custom calculate function if needed, else wattage * hrs * 60 * duty factor
    dutyFactor: 0.50, // Inverter thermostat duty cycle (~50% effective compressor run)
    presetUnits: 231, // Directly matching user ASCII mock (231 Units)
    noteMl: "ഏറ്റവും വലിയ കറന്റ് തീറ്റക്കാരൻ! 1 മണിക്കൂർ കുറച്ചാൽ വലിയ ലാഭം.",
    noteEn: "Chief electricity guzzler! 1 hour reduction yields massive savings."
  },
  {
    id: "water_pump_1hp",
    nameEn: "Water Pump 1 HP",
    nameMl: "വാട്ടർ പമ്പ് 1 HP",
    category: "motor",
    icon: "droplet",
    watts: 750,
    usageValue: 45, // 45 min/day
    usageUnit: "min/day",
    usageUnitMl: "മിനിറ്റ്/ദിവസം",
    minUsage: 0,
    maxUsage: 180,
    step: 5,
    alwaysOn: false,
    isActive: true,
    dutyFactor: 0.74,
    presetUnits: 25, // 25 Units matching user mock
    noteMl: "ഓവർഫ്ലോ ആകുന്നത് ശ്രദ്ധിക്കുക. ഓട്ടോ-കട്ട് ഓഫ് വെക്കുന്നത് നല്ലതാണ്.",
    noteEn: "Watch out for tank overflow. Auto-cutoff switch recommended."
  },
  {
    id: "veranda_lights",
    nameEn: "Veranda / Gate Lights",
    nameMl: "വരാന്ത & ഗേറ്റ് ലൈറ്റുകൾ",
    category: "lighting",
    icon: "lightbulb",
    watts: 30, // 2 x 15W LED
    usageValue: 10, // 10 hrs/night
    usageUnit: "hrs/night",
    usageUnitMl: "മണിക്കൂർ/രാത്രി",
    minUsage: 0,
    maxUsage: 16,
    step: 1,
    alwaysOn: false,
    isActive: true,
    dutyFactor: 1.0,
    presetUnits: 18, // 18 Units matching user mock
    noteMl: "രാവിലെ ലൈറ്റ് ഓഫ് ചെയ്യാൻ മറക്കാറുണ്ടോ? സെൻസർ വെക്കാം.",
    noteEn: "Forgotten until morning? Solar or motion sensor bulb helps."
  },
  {
    id: "refrigerator",
    nameEn: "Refrigerator (260L Double Door)",
    nameMl: "ഫ്രിഡ്ജ് (ഡബിൾ ഡോർ)",
    category: "kitchen",
    icon: "refrigerator",
    watts: 180,
    usageValue: 24,
    usageUnit: "Always On",
    usageUnitMl: "എപ്പോഴും ഓൺ",
    minUsage: 24,
    maxUsage: 24,
    step: 1,
    alwaysOn: true,
    isActive: true,
    dutyFactor: 0.174,
    presetUnits: 45, // 45 Units matching user mock
    noteMl: "ഡോർ ഇടയ്ക്കിടെ തുറന്നുവെക്കരുത്. ബാക്ക് കോയിൽ പൊടി കളയുക.",
    noteEn: "Avoid frequent door opening. Keep condenser coils clean."
  },
  {
    id: "geyser_water_heater",
    nameEn: "Geyser / Water Heater",
    nameMl: "ഗീസർ (വാട്ടർ ഹീറ്റർ)",
    category: "heating",
    icon: "flame",
    watts: 2000,
    usageValue: 20,
    usageUnit: "min/day",
    usageUnitMl: "മിനിറ്റ്/ദിവസം",
    minUsage: 0,
    maxUsage: 120,
    step: 5,
    alwaysOn: false,
    isActive: true,
    dutyFactor: 1.0,
    presetUnits: 40,
    noteMl: "ഹൈ വാട്ടേജ് അപ്ലയൻസ്. കുളിക്കുന്നതിന് 10 മിനിറ്റ് മുൻപ് മാത്രം ഇടുക.",
    noteEn: "High wattage load. Turn on only 10 mins before bath."
  },
  {
    id: "ceiling_fans",
    nameEn: "Ceiling Fans (3 Nos)",
    nameMl: "സീലിംഗ് ഫാൻ (3 എണ്ണം)",
    category: "cooling",
    icon: "fan",
    watts: 180, // 3 x 60W
    usageValue: 12,
    usageUnit: "hrs/day",
    usageUnitMl: "മണിക്കൂർ/ദിവസം",
    minUsage: 0,
    maxUsage: 24,
    step: 1,
    alwaysOn: false,
    isActive: true,
    dutyFactor: 0.85,
    presetUnits: 65,
    noteMl: "BLDC ഫാനിലേക്ക് മാറിയാൽ 50% കറന്റ് ലാഭിക്കാം.",
    noteEn: "Switching to BLDC fans saves up to 50% power."
  }
];

/**
 * Calculates bimonthly units consumed by an appliance
 * @param {object} appliance
 * @param {number} cycleDays (default 60)
 */
export function calculateApplianceUnits(appliance, cycleDays = 60) {
  if (!appliance.isActive) return 0;
  
  if (appliance.alwaysOn) {
    return appliance.presetUnits || Math.round((appliance.watts * appliance.dutyFactor * 24 * cycleDays) / 1000);
  }

  let hoursPerDay = 0;
  if (appliance.usageUnit.includes('min')) {
    hoursPerDay = appliance.usageValue / 60;
  } else {
    hoursPerDay = appliance.usageValue;
  }

  // Calculate realistic kWh over the cycle
  const effectiveWatts = appliance.watts * (appliance.dutyFactor !== undefined ? appliance.dutyFactor : 1.0);
  const units = (effectiveWatts * hoursPerDay * cycleDays) / 1000;
  return Math.round(units);
}
