import { calculateKSEBBill, analyzeSlabCliff } from '../js/tariffEngine.js';
import { INITIAL_APPLIANCES, calculateApplianceUnits } from '../js/applianceData.js';
import { TRANSLATIONS } from '../js/i18n.js';

console.log("=== RUNNING KSEB SLAB WATCHDOG TEST SUITE ===");

// 1. Test Meter Reading & Predictor Math
const lastReading = 14200;
const currentReading = 14480;
const d1 = new Date("2026-07-01");
const d2 = new Date("2026-08-05");
const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
const unitsConsumed = currentReading - lastReading;
const dailyBurnRate = unitsConsumed / diffDays;
const remainingDays = 60 - diffDays;
const projectedUnits = Math.round(unitsConsumed + (remainingDays * dailyBurnRate));

console.log(`Units Consumed: ${unitsConsumed} (Expected: 280) -> ${unitsConsumed === 280 ? 'PASS' : 'FAIL'}`);
console.log(`Days Elapsed: ${diffDays} (Expected: 35) -> ${diffDays === 35 ? 'PASS' : 'FAIL'}`);
console.log(`Daily Burn Rate: ${dailyBurnRate.toFixed(1)} (Expected: 8.0) -> ${dailyBurnRate.toFixed(1) === '8.0' ? 'PASS' : 'FAIL'}`);
console.log(`Projected Day 60: ${projectedUnits} (Expected: 480) -> ${projectedUnits === 480 ? 'PASS' : 'FAIL'}`);

// 2. Test Estimated Bill
const bill = calculateKSEBBill(projectedUnits, { phase: '1-phase' });
console.log(`Estimated Bill at 480 Units: ₹${bill.totalBill} (Expected ~₹3,140) -> ${Math.abs(bill.totalBill - 3140) < 5 ? 'PASS' : 'FAIL'}`);

// 3. Test Cliff Analysis
const cliff = analyzeSlabCliff(unitsConsumed, projectedUnits, '1-phase');
console.log(`Distance to Cliff: ${cliff.unitsToCliff} Units (Expected: 20) -> ${cliff.unitsToCliff === 20 ? 'PASS' : 'FAIL'}`);
console.log(`Bill Jump Shock: ₹${cliff.billJump} (Expected: ₹1,420) -> ${cliff.billJump === 1420 ? 'PASS' : 'FAIL'}`);

// 4. Test Appliances
const ac = INITIAL_APPLIANCES.find(a => a.id.includes('ac'));
const pump = INITIAL_APPLIANCES.find(a => a.id.includes('pump'));
const lights = INITIAL_APPLIANCES.find(a => a.id.includes('light'));
const fridge = INITIAL_APPLIANCES.find(a => a.id.includes('refrig'));

console.log(`AC Units: ${calculateApplianceUnits(ac)} (Expected: 231) -> ${calculateApplianceUnits(ac) === 231 ? 'PASS' : 'FAIL'}`);
console.log(`Pump Units: ${calculateApplianceUnits(pump)} (Expected: 25) -> ${calculateApplianceUnits(pump) === 25 ? 'PASS' : 'FAIL'}`);
console.log(`Lights Units: ${calculateApplianceUnits(lights)} (Expected: 18) -> ${calculateApplianceUnits(lights) === 18 ? 'PASS' : 'FAIL'}`);
console.log(`Fridge Units: ${calculateApplianceUnits(fridge)} (Expected: 45) -> ${calculateApplianceUnits(fridge) === 45 ? 'PASS' : 'FAIL'}`);

// 5. Test i18n Dictionary
const mlKeys = Object.keys(TRANSLATIONS.ml);
const enKeys = Object.keys(TRANSLATIONS.en);
const missingInMl = enKeys.filter(k => !mlKeys.includes(k));
const missingInEn = mlKeys.filter(k => !enKeys.includes(k));
console.log(`Translations Parity: ML (${mlKeys.length}) / EN (${enKeys.length}) -> Missing: ${missingInMl.length + missingInEn.length === 0 ? 'ALL KEYS MATCH PASS' : 'FAIL'}`);

console.log("=== ALL TEST SUITE CHECKS COMPLETED ===");
