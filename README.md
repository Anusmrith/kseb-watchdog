<div align="center">

  <img src="./public/icon.svg" width="100" height="100" alt="KSEB Slab Watchdog Logo" />

  # ⚡ KSEB Slab Watchdog (കരന്റ് വാച്ച്ഡോഗ്)

  **Kerala electricity meter tracker, daily burn rate predictor, 500-unit slab cliff radar, and household appliance inspector.**

  <p align="center">
    <em>"സ്ലാബ് മാറി ബില്ല് ഷോക്കാവാതിരിക്കാൻ ഒരു മുൻകരുതൽ!"</em>
  </p>

  <!-- GitHub Badges -->
  <p align="center">
    <a href="https://anusmrith.github.io/kseb-watchdog/"><img src="https://img.shields.io/badge/⚡_Live_Demo-Open_App-00f59b?style=for-the-badge&logo=vercel&logoColor=black" alt="Live Demo" /></a>
    <a href="https://github.com/Anusmrith/kseb-watchdog/stargazers"><img src="https://img.shields.io/github/stars/Anusmrith/kseb-watchdog?style=for-the-badge&logo=github&color=gold" alt="GitHub Stars" /></a>
    <a href="https://github.com/Anusmrith/kseb-watchdog/network/members"><img src="https://img.shields.io/github/forks/Anusmrith/kseb-watchdog?style=for-the-badge&logo=github&color=blue" alt="GitHub Forks" /></a>
    <a href="https://github.com/Anusmrith/kseb-watchdog/issues"><img src="https://img.shields.io/github/issues/Anusmrith/kseb-watchdog?style=for-the-badge&logo=github" alt="GitHub Issues" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License: MIT" /></a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Tariff-KSEB%20LT--1A%20Domestic-FFB000?style=flat-square&logo=power" alt="KSEB LT-1A" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/JavaScript-ES6%2B%20Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Audio-Web%20Audio%20API-FF5722?style=flat-square" alt="Web Audio" />
    <img src="https://img.shields.io/badge/PWA-Ready-00F59B?style=flat-square&logo=pwa&logoColor=black" alt="PWA Ready" />
    <img src="https://img.shields.io/badge/Tests-Passing%20(100%25)-brightgreen?style=flat-square" alt="Tests" />
  </p>

</div>

---

## 📌 Table of Contents

- [The 500-Unit "Cliff" Trap Explained](#-the-500-unit-cliff-trap-explained)
- [Dashboard Preview](#-dashboard-preview)
- [Key Features](#-key-features)
- [KSEB LT-1A Tariff Cheat Sheet](#-kseb-lt-1a-tariff-cheat-sheet)
- [WhatsApp Family Sharing Modes](#-whatsapp-family-sharing-modes)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Running Automated Tests](#-running-automated-tests)
- [Deploying to GitHub Pages](#-deploying-to-github-pages)
- [Contributing](#-contributing)
- [License & Author](#-license--author)

---

<a id="the-500-unit-cliff-trap-explained"></a>
## 💥 The 500-Unit "Cliff" Trap Explained

In Kerala, domestic electricity consumers under the **KSEB LT-1A Tariff** are billed on a **bi-monthly (60-day) cycle**.

Many consumers believe electricity costs rise gradually. However, KSEB enforces a **steep non-telescopic penalty cliff at 500 units**:

| Metric | 500 Units Consumed | 501 Units Consumed | Impact |
| :--- | :--- | :--- | :--- |
| **Tariff Mechanism** | **Telescopic** (Graduated Slabs) | **Non-Telescopic** (Flat Rate) | ⚠️ Loss of slab subsidies |
| **Energy Calculation** | First 100 @ ₹3.25<br>Next 100 @ ₹4.05<br>Next 100 @ ₹5.10<br>Next 100 @ ₹6.95<br>Next 100 @ ₹8.20 | **ALL 501 units** charged at flat **₹6.75 / unit** | Entire consumption re-rated |
| **Fixed Charge (1-Phase)** | ₹220 | ₹260 | Increased fixed levy |
| **Govt Electricity Duty (10%)** | ₹275 | ₹338 | Higher percentage tax |
| **Approx Total Bill** | **₹3,282** | **₹4,702** | 📈 **+₹1,420 JUMP!** |

> [!WARNING]
> **Crossing 500 units by just 1 unit adds ₹1,420+ to your bill!**  
> Because meter readings only take place every 60 days, families normally discover this after the bill is issued. **KSEB Slab Watchdog** provides early warnings and burn-rate forecasting mid-cycle so you can course-correct in time.

---

<a id="dashboard-preview"></a>
## 🖥️ Dashboard Preview

```text
+-----------------------------------------------------------------------------------------+
|  ⚡ KSEB SLAB WATCHDOG (കരന്റ് വാച്ച്ഡോഗ്)              [🌐 ML/EN]  [🔊 Sound On]  [⚙️ Settings] |
+-----------------------------------------------------------------------------------------+
|  📊 METER READING & PREDICTOR                                  [60-Day Bi-Monthly Cycle] |
|                                                                                         |
|  [ Last Reading: 14200 kWh | July 1 ]  ───────►  [ Current Reading: 14480 kWh | Aug 5 ]  |
|                                                                                         |
|  ⚡ Consumed: 280 Units (35 days elapsed)   │   ⏳ 25 days remaining in cycle            |
|                                                                                         |
|  ┌────────────────────────────────────┐    ┌─────────────────────────────────────────┐  |
|  │ 🔥 DAILY BURN RATE                 │    │ 🔮 PROJECTED DAY 60                     │  |
|  │ 8.0 Units/Day                      │    │ 480 Units (Safe in Slab 5)              │  |
|  │ (280 U / 35 Days average)          │    │ Est. Bill: ₹3,142   [🧾 View Breakdown] │  |
|  └────────────────────────────────────┘    └─────────────────────────────────────────┘  |
+-----------------------------------------------------------------------------------------+
|  ⚠️ SLAB CLIFF ALERT                                       [20 Units Away from Cliff!]  |
|  [████████████████████████████████░░░░░░░░░░░░░░░░░░░░] 280 / 500 Units (56% safe)    |
|                                                                                         |
|  ⚠️ ALERT: You are 20 units away from the 500-unit cliff!                               |
|     Crossing 500 units jumps your bill by ₹1,420.                                       |
|  💡 നിർദ്ദേശം: Limit 1.5 Ton AC to 6 hrs/day to stay safely in Slab 5.                  |
+-----------------------------------------------------------------------------------------+
|  🔌 "ആരാണ് ലൈറ്റ് ഓഫ് ചെയ്യാത്തത്?" (Household Appliance Inspector & Simulator)           |
|                                                                                         |
|  ❄️ 1.5 Ton Inverter AC     [━━━━●━━━━━━] 7.0 hrs/day  ==> 231 Units (₹1,580)  [ON]     |
|  💧 1 HP Water Pump         [━━●━━━━━━━━] 45 min/day   ==>  25 Units   (₹180)  [ON]     |
|  💡 Veranda / Gate Lights   [━━━━━━●━━━━] 10 hrs/night ==>  18 Units   (₹125)  [ON]     |
|  🧊 Refrigerator (260L)     [Always On  ] 24 hrs/day   ==>  45 Units   (₹310)  [ON]     |
|  🔥 Geyser / Water Heater   [━●━━━━━━━━━] 20 min/day   ==>  40 Units   (₹275)  [ON]     |
|                                                                                         |
|  [ + Add Custom Appliance ]  │  💡 Drag sliders: Reducing AC by 1 hr saves ₹250+ live!  |
+-----------------------------------------------------------------------------------------+
|  📤 [ Share Summary to Family WhatsApp ]                                                |
|     • 👨‍🦳 Stern Malayali Dad    • 😊 Friendly Reminder    • 🌐 English Executive         |
+-----------------------------------------------------------------------------------------+
```

---

<a id="key-features"></a>
## ✨ Key Features

### 1. 📊 Meter Reading & Burn Rate Predictor
- Input previous & current meter readings with calendar pickers.
- Calculates elapsed days, consumed units, and **Daily Burn Rate (Units/day)**.
- Projects **Day-60 Total Consumption** and computes estimated electricity bill.

### 2. ⚠️ Slab Cliff Radar
- Visual distance-to-cliff progress bar with color thresholds (`Safe`, `Warning`, `Danger`, `Critical`).
- Automatically computes the exact **Bill Shock Jump** penalty in Rupees.
- Recommends targeted reductions (e.g. thermostat adjustment, pump timer).

### 3. 🔌 "ആരാണ് ലൈറ്റ് ഓഫ് ചെയ്യാത്തത്?" (Appliance Inspector)
- Modeled after actual Kerala household appliances with power ratings & duty factors:
  - **1.5 Ton Inverter AC**: 1100W with inverter thermostat duty cycle.
  - **1 HP Water Pump**: 750W with run-time simulation.
  - **Veranda & Gate Lights**: Overnight lighting tracker.
  - **Double Door Refrigerator (260L)**: Baseline compressor load.
  - **Geyser / Water Heater**: 2000W heating element.
- **Live "What-If" Sliders**: Drag hours or toggle switches to see real-time rupee savings.
- **Custom Appliance Adder**: Add air fryers, induction cookers, washing machines, or EV chargers.

### 4. 📲 1-Click WhatsApp Family Alert Sharing
- Formats ready-to-send messages for family WhatsApp groups in 3 tones:
  - 👨‍🦳 **Stern Malayali Dad Mode** (*"ആരാണ് ലൈറ്റും AC യും ഓഫാക്കാതെ പോകുന്നത്?!..."*)
  - 😊 **Friendly Family Nudge** (Kind reminder highlighting potential savings)
  - 🌐 **English Executive Summary** (Crisp itemized briefing)
- One-tap clipboard copy or direct launch into WhatsApp Web/App.

### 5. 🧾 Itemized LT-1A Bill Breakdown Modal
- Transparent itemization following official KSERC tariff schedules:
  - Telescopic slab vs. Non-telescopic flat rate energy charges
  - Fixed charge (Single Phase vs. Three Phase)
  - 10% Kerala State Electricity Duty
  - Fuel Surcharge (₹0.12/unit)
  - Meter Rent (₹12 bi-monthly) + 18% GST

### 6. 🌐 100% Bilingual (മലയാളം & English)
- Instant one-click toggle between authentic Malayalam and English.

### 7. 🔊 Web Audio API Sound Effects
- Synthesized mechanical relay switches, tactile clicks, and warning chimes without external audio assets.

### 8. 📱 Offline-Ready PWA
- Responsive mobile-first dark-mode UI with installable Web App Manifest.

---

<a id="kseb-lt-1a-tariff-cheat-sheet"></a>
## 🧮 KSEB LT-1A Tariff Cheat Sheet

### Telescopic Slabs (Consumption ≤ 500 Units / 60 Days)
| Slab | Units (Bi-Monthly) | Energy Charge |
| :--- | :--- | :--- |
| **Slab 1** | 0 – 100 Units | ₹3.25 / unit |
| **Slab 2** | 101 – 200 Units | ₹4.05 / unit |
| **Slab 3** | 201 – 300 Units | ₹5.10 / unit |
| **Slab 4** | 301 – 400 Units | ₹6.95 / unit |
| **Slab 5** | 401 – 500 Units | ₹8.20 / unit |

### Non-Telescopic Tiers (Consumption > 500 Units / 60 Days)
*When consumption exceeds 500 units, telescopic slab pricing is forfeited; all units are charged at a single flat rate:*

| Tier | Units (Bi-Monthly) | Flat Rate (All Units) |
| :--- | :--- | :--- |
| **Tier 1** | 501 – 600 Units | ₹6.75 / unit |
| **Tier 2** | 601 – 700 Units | ₹7.60 / unit |
| **Tier 3** | 701 – 800 Units | ₹7.95 / unit |
| **Tier 4** | 801 – 1000 Units | ₹8.25 / unit |
| **Tier 5** | Above 1000 Units | ₹9.20 / unit |

### Fixed Charges & Duties
- **Single Phase**: ₹70 – ₹220 (Telescopic) │ ₹260 – ₹400 (Non-Telescopic)
- **Three Phase**: ₹180 – ₹370 (Telescopic) │ ₹420 – ₹600 (Non-Telescopic)
- **State Electricity Duty**: 10% on energy charge
- **Fuel Surcharge**: ₹0.12 / unit
- **Meter Rent**: ₹12.00 + 18% GST (₹14.16 bi-monthly)

---

<a id="whatsapp-family-sharing-modes"></a>
## 💬 WhatsApp Family Sharing Modes

> [!TIP]
> Choose the tone that best fits your family group dynamic:

### 👨‍🦳 1. Stern Malayali Dad (അപ്പന്റെ മുന്നറിയിപ്പ്)
```text
🚨 *KSEB കരന്റ് വാച്ച്ഡോഗ് അടിയന്തിര മുന്നറിയിപ്പ്!* 🚨

കഴിഞ്ഞ റീഡിംഗ്: 14200
ഇന്നത്തെ റീഡിംഗ്: 14480
ഇതുവരെ ഉപയോഗിച്ചത്: *280 യൂണിറ്റ്* (35 ദിവസം)
🔥 പ്രതിദിന നിരക്ക്: *8.0 യൂണിറ്റ്/ദിവസം*
🔮 60-ാം ദിവസത്തെ പ്രവചനം: *480 യൂണിറ്റ്* (ബിൽ: *₹3,142*)

⚠️ *ശ്രദ്ധിക്കുക: 500 സ്ലാബ് ക്ലിഫിലേക്ക് 20 യൂണിറ്റുകൾ മാത്രം ബാക്കി!* ⚠️
500 യൂണിറ്റ് കടന്നാൽ നോൺ-ടെലിസ്കോപ്പിക് താരിഫ് വന്ന് ബില്ലിൽ *₹1,420* രൂപ കൂടും!

🔌 *പ്രധാന കറന്റ് തീറ്റക്കാർ:*
• 1.5 Ton AC: 231 Units (₹1,580)
• റഫ്രിജറേറ്റർ: 45 Units (₹310)
• വാട്ടർ പമ്പ്: 25 Units (₹180)
• വരാന്ത ലൈറ്റുകൾ: 18 Units (₹125)

📢 *ആരാണ് ലൈറ്റും AC യും ഓഫാക്കാതെ പോകുന്നത്?! ഉടൻ തന്നെ AC ഉപയോഗം 6 മണിക്കൂറാക്കി കുറയ്ക്കുക. വാട്ടർ പമ്പ് ഓവർഫ്ലോ അടിക്കാതെ നോക്കുക!* 🙏
```

### 😊 2. Friendly Reminder
```text
⚡ *KSEB Electricity Update & Saving Alert* ⚡

ഹലോ ഫാമിലി, നമ്മുടെ ഈ മാസത്തെ വൈദ്യുതി ഉപയോഗം ഇപ്പോൾ *280 യൂണിറ്റിൽ* എത്തിയിട്ടുണ്ട് (35 ദിവസം കൊണ്ട്).
ഇതേ ഉപയോഗം തുടർന്നാൽ 60-ാം ദിവസം നമ്മൾ *480 യൂണിറ്റിൽ* എത്തും (കണക്കാക്കിയ ബിൽ: *₹3,142*).

⚠️ 500 യൂണിറ്റ് കടക്കാതിരുന്നാൽ നമുക്ക് ബില്ലിൽ *₹1,420* രൂപയോളം ലാഭിക്കാം!
ദയവായി എല്ലാവരും AC ടൈമർ വെച്ച് ഉപയോഗിക്കുക, ആവശ്യമില്ലാത്ത ലൈറ്റുകൾ ഓഫ് ചെയ്യുക. നന്ദി! ✨
```

### 🌐 3. English Executive Summary
```text
⚡ *KSEB SLAB WATCHDOG REPORT* ⚡

• Last Reading: 14200 (2026-07-01)
• Current Reading: 14480 (2026-08-05)
• Units Consumed: *280 Units* (35 days elapsed)
• Daily Burn Rate: *8.0 Units/Day*
• Projected Day 60: *480 Units* (Est. Bill: *₹3,142*)

⚠️ *SLAB CLIFF ALERT*: You are *20 Units* away from the 500-unit cliff!
Crossing 500 units triggers non-telescopic rates, jumping the bill by *₹1,420*.

💡 *Recommendation*: Limit 1.5 Ton AC to 6 hrs/day to stay safely in Slab 5.
```

---

<a id="tech-stack--architecture"></a>
## 🛠️ Tech Stack & Architecture

- **Runtime & UI**: Vanilla HTML5, Vanilla JavaScript (ES6 Modules)
- **Styling**: Vanilla CSS3 (Custom design tokens, CSS variables, glassmorphism)
- **Audio Engine**: Web Audio API (real-time synthesized waveforms, 0 audio assets)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Offline & PWA**: Web App Manifest & `localStorage`
- **Hosting**: GitHub Pages

---

<a id="project-directory-structure"></a>
## 📂 Project Directory Structure

```text
kseb-watchdog/
├── css/
│   └── style.css            # Dark cyberpunk design system & responsive layout
├── js/
│   ├── app.js               # Application coordinator, DOM handlers & reactive state
│   ├── applianceData.js     # Kerala appliance wattage presets & duty calculations
│   ├── audio.js             # Web Audio API relay switch & warning chime synthesizer
│   ├── i18n.js              # Bilingual Malayalam & English translation dictionary
│   └── tariffEngine.js      # Official KSERC LT-1A tariff math & cliff analyzer
├── public/
│   ├── icon.svg             # Application logo & favicon
│   └── manifest.webmanifest # PWA configuration manifest
├── test/
│   └── verify.js            # Automated verification test suite
├── index.html               # Main dashboard markup
├── package.json             # Scripts & devDependencies
├── vite.config.js           # Vite configuration with relative base path
├── LICENSE                  # MIT License
└── README.md                # Repository documentation
```

---

<a id="getting-started--local-setup"></a>
## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `git`

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Anusmrith/kseb-watchdog.git

# 2. Enter project directory
cd kseb-watchdog

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with hot reload |
| `npm run build` | Builds optimized production bundle into `dist/` |
| `npm run preview` | Locally preview production build |
| `npm test` | Runs the automated calculation & tariff verification suite |
| `npm run deploy` | Builds and publishes to GitHub Pages |

---

<a id="running-automated-tests"></a>
## 🧪 Running Automated Tests

Run the test suite to verify math formulas, tariff breakdowns, and bilingual translations:

```bash
npm test
```

Expected output:
```text
=== RUNNING KSEB SLAB WATCHDOG TEST SUITE ===
Units Consumed: 280 (Expected: 280) -> PASS
Days Elapsed: 35 (Expected: 35) -> PASS
Daily Burn Rate: 8.0 (Expected: 8.0) -> PASS
Projected Day 60: 480 (Expected: 480) -> PASS
Estimated Bill at 480 Units: ₹3142 (Expected ~₹3,140) -> PASS
Distance to Cliff: 20 Units (Expected: 20) -> PASS
Bill Jump Shock: ₹1420 (Expected: ₹1,420) -> PASS
AC Units: 231 (Expected: 231) -> PASS
Pump Units: 25 (Expected: 25) -> PASS
Lights Units: 18 (Expected: 18) -> PASS
Fridge Units: 45 (Expected: 45) -> PASS
Translations Parity: ML (72) / EN (72) -> Missing: ALL KEYS MATCH PASS
=== ALL TEST SUITE CHECKS COMPLETED ===
```

---

<a id="deploying-to-github-pages"></a>
## 🌐 Deploying to GitHub Pages

1. Ensure your remote is configured:
   ```bash
   git remote -v
   # origin https://github.com/Anusmrith/kseb-watchdog.git
   ```

2. Run the automated deployment script:
   ```bash
   npm run deploy
   ```

3. In GitHub repository settings:
   - Go to **Settings** > **Pages**
   - Under **Build and deployment**, ensure Source is set to **Deploy from a branch**
   - Select branch: `gh-pages` / folder: `/ (root)`
   - Click **Save**

Your app will be live at:
**`https://anusmrith.github.io/kseb-watchdog/`**

---

<a id="contributing"></a>
## 🤝 Contributing

Contributions are welcome! If you'd like to improve the app:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Ideas for contributions:
- Solar on-grid net metering simulation (KSEB Soura scheme)
- Time-of-Day (ToD) tariff support for commercial consumers (LT-IV / LT-VII)
- Export / import meter reading history via JSON or CSV

---

<a id="license--author"></a>
## 📄 License & Author

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Developed with ⚡ by **[Anusmrith](https://github.com/Anusmrith)**.

<div align="center">
  <sub>Made for Kerala homes to keep electricity bills under control.</sub>
</div>
