import { calculateKSEBBill, analyzeSlabCliff, TARIFF_CONSTANTS } from './tariffEngine.js';
import { INITIAL_APPLIANCES, calculateApplianceUnits } from './applianceData.js';
import { TRANSLATIONS } from './i18n.js';
import { audioFX } from './audio.js';

class KSEBWatchdogApp {
  constructor() {
    this.state = {
      lang: 'en', // 'en' | 'ml'
      soundEnabled: true,
      phase: '1-phase',
      cycleDays: 60,
      lastReading: 14200,
      lastDate: '2026-07-01',
      currentReading: 14480,
      currentDate: '2026-08-05',
      appliances: JSON.parse(JSON.stringify(INITIAL_APPLIANCES)),
      activeWhatsAppTone: 'dad'
    };

    this.init();
  }

  init() {
    this.loadPersistedState();
    this.bindDomElements();
    this.bindEvents();
    this.updateLanguageUI();
    this.recalculateAll();
  }

  loadPersistedState() {
    try {
      const saved = localStorage.getItem('kseb_watchdog_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load saved state', e);
    }
  }

  saveState() {
    try {
      localStorage.setItem('kseb_watchdog_state', JSON.stringify({
        lang: this.state.lang,
        soundEnabled: this.state.soundEnabled,
        phase: this.state.phase,
        cycleDays: this.state.cycleDays,
        lastReading: this.state.lastReading,
        lastDate: this.state.lastDate,
        currentReading: this.state.currentReading,
        currentDate: this.state.currentDate,
        appliances: this.state.appliances
      }));
    } catch (e) {
      console.warn('Could not save state', e);
    }
  }

  bindDomElements() {
    // Header controls
    this.langToggleBtn = document.getElementById('lang-toggle-btn');
    this.langBtnText = document.getElementById('lang-btn-text');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundText = document.getElementById('sound-text');
    this.settingsBtn = document.getElementById('settings-btn');

    // Meter Inputs
    this.lastReadingInput = document.getElementById('last-reading-input');
    this.lastReadingDate = document.getElementById('last-reading-date');
    this.currentReadingInput = document.getElementById('current-reading-input');
    this.currentReadingDate = document.getElementById('current-reading-date');
    this.lastDateLabel = document.getElementById('last-date-label');
    this.currentDateLabel = document.getElementById('current-date-label');

    // Computed summary & metrics
    this.unitsConsumedDisplay = document.getElementById('units-consumed-display');
    this.elapsedDaysDisplay = document.getElementById('elapsed-days-display');
    this.remainingDaysDisplay = document.getElementById('remaining-days-display');
    this.dailyBurnRateVal = document.getElementById('daily-burn-rate-val');
    this.projectedUnitsVal = document.getElementById('projected-units-val');
    this.estimatedBillVal = document.getElementById('estimated-bill-val');
    this.projectionCard = document.getElementById('projection-card');

    // Cliff Radar Elements
    this.cliffSection = document.getElementById('slab-cliff-card');
    this.cliffDistanceBadge = document.getElementById('cliff-distance-badge');
    this.progressUnitsLabel = document.getElementById('progress-units-label');
    this.progressPercentageLabel = document.getElementById('progress-percentage-label');
    this.customProgressFill = document.getElementById('custom-progress-fill');
    this.cliffBannerBox = document.getElementById('cliff-banner-box');
    this.cliffAlertHeadline = document.getElementById('cliff-alert-headline');
    this.cliffAlertBody = document.getElementById('cliff-alert-body');
    this.cliffJumpAmount = document.getElementById('cliff-jump-amount');
    this.cliffActionTip = document.getElementById('cliff-action-tip');

    // Appliance Inspector
    this.appliancesContainer = document.getElementById('appliances-container');
    this.addApplianceBtn = document.getElementById('add-appliance-btn');

    // Modals
    this.whatsappModal = document.getElementById('whatsapp-modal');
    this.whatsappShareTriggerBtn = document.getElementById('whatsapp-share-trigger-btn');
    this.closeWhatsappModalBtn = document.getElementById('close-whatsapp-modal');
    this.whatsappPreviewContent = document.getElementById('whatsapp-preview-content');
    this.copyWhatsappTextBtn = document.getElementById('copy-whatsapp-text-btn');
    this.directWhatsappSendBtn = document.getElementById('direct-whatsapp-send-btn');
    this.toneButtons = document.querySelectorAll('.tone-btn');

    // Breakdown Modal
    this.billBreakdownModal = document.getElementById('bill-breakdown-modal');
    this.viewBillBtn = document.getElementById('view-bill-btn');
    this.closeBreakdownModalBtn = document.getElementById('close-breakdown-modal');
    this.breakdownContent = document.getElementById('breakdown-content');
    this.openSlabMatrixBtn = document.getElementById('open-slab-matrix-btn');

    // Settings Modal
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsModalBtn = document.getElementById('close-settings-modal');
    this.phase1Btn = document.getElementById('phase-1-btn');
    this.phase3Btn = document.getElementById('phase-3-btn');
    this.cycleDurationSelect = document.getElementById('cycle-duration-select');
    this.resetAllDataBtn = document.getElementById('reset-all-data-btn');

    // Add Appliance Modal
    this.addApplianceModal = document.getElementById('add-appliance-modal');
    this.closeAddModalBtn = document.getElementById('close-add-modal');
    this.newApplianceForm = document.getElementById('new-appliance-form');
  }

  bindEvents() {
    // Language Toggle
    this.langToggleBtn.addEventListener('click', () => {
      audioFX.playClick();
      this.state.lang = this.state.lang === 'en' ? 'ml' : 'en';
      this.updateLanguageUI();
      this.renderAppliances();
      this.recalculateAll();
      this.saveState();
    });

    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => {
      this.state.soundEnabled = !this.state.soundEnabled;
      audioFX.toggleSound(this.state.soundEnabled);
      if (this.state.soundEnabled) audioFX.playClick();
      this.updateSoundBtnUI();
      this.saveState();
    });

    // Inputs change listeners
    const handleMeterInputChange = () => {
      this.state.lastReading = parseFloat(this.lastReadingInput.value) || 0;
      this.state.currentReading = parseFloat(this.currentReadingInput.value) || 0;
      this.state.lastDate = this.lastReadingDate.value;
      this.state.currentDate = this.currentReadingDate.value;
      this.updateDateLabels();
      this.recalculateAll();
      this.saveState();
    };

    this.lastReadingInput.addEventListener('input', handleMeterInputChange);
    this.currentReadingInput.addEventListener('input', handleMeterInputChange);
    this.lastReadingDate.addEventListener('change', handleMeterInputChange);
    this.currentReadingDate.addEventListener('change', handleMeterInputChange);

    // Modals
    this.whatsappShareTriggerBtn.addEventListener('click', () => {
      audioFX.playClick();
      this.openWhatsAppModal();
    });

    this.closeWhatsappModalBtn.addEventListener('click', () => {
      this.whatsappModal.classList.remove('active');
    });

    this.viewBillBtn.addEventListener('click', () => {
      audioFX.playClick();
      this.openBreakdownModal();
    });

    this.openSlabMatrixBtn.addEventListener('click', () => {
      audioFX.playClick();
      this.openBreakdownModal();
    });

    this.closeBreakdownModalBtn.addEventListener('click', () => {
      this.billBreakdownModal.classList.remove('active');
    });

    this.settingsBtn.addEventListener('click', () => {
      audioFX.playClick();
      this.settingsModal.classList.add('active');
    });

    this.closeSettingsModalBtn.addEventListener('click', () => {
      this.settingsModal.classList.remove('active');
    });

    // Settings actions
    this.phase1Btn.addEventListener('click', () => {
      audioFX.playSwitch();
      this.state.phase = '1-phase';
      this.phase1Btn.classList.add('active');
      this.phase3Btn.classList.remove('active');
      this.recalculateAll();
      this.saveState();
    });

    this.phase3Btn.addEventListener('click', () => {
      audioFX.playSwitch();
      this.state.phase = '3-phase';
      this.phase3Btn.classList.add('active');
      this.phase1Btn.classList.remove('active');
      this.recalculateAll();
      this.saveState();
    });

    this.cycleDurationSelect.addEventListener('change', (e) => {
      this.state.cycleDays = parseInt(e.target.value, 10);
      this.recalculateAll();
      this.saveState();
    });

    this.resetAllDataBtn.addEventListener('click', () => {
      if (confirm('Reset all values to original defaults?')) {
        localStorage.removeItem('kseb_watchdog_state');
        this.state = {
          lang: this.state.lang,
          soundEnabled: true,
          phase: '1-phase',
          cycleDays: 60,
          lastReading: 14200,
          lastDate: '2026-07-01',
          currentReading: 14480,
          currentDate: '2026-08-05',
          appliances: JSON.parse(JSON.stringify(INITIAL_APPLIANCES)),
          activeWhatsAppTone: 'dad'
        };
        this.populateInputFields();
        this.renderAppliances();
        this.recalculateAll();
        this.settingsModal.classList.remove('active');
      }
    });

    // WhatsApp Tone tabs
    this.toneButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        audioFX.playClick();
        this.toneButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activeWhatsAppTone = btn.dataset.tone;
        this.renderWhatsAppPreview();
      });
    });

    this.copyWhatsappTextBtn.addEventListener('click', () => {
      audioFX.playClick();
      const text = this.whatsappPreviewContent.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = this.copyWhatsappTextBtn.innerHTML;
        this.copyWhatsappTextBtn.innerHTML = `✓ ${this.t('copied')}`;
        setTimeout(() => {
          this.copyWhatsappTextBtn.innerHTML = originalText;
        }, 2000);
      });
    });

    this.directWhatsappSendBtn.addEventListener('click', () => {
      audioFX.playClick();
      const text = encodeURIComponent(this.whatsappPreviewContent.innerText);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });

    // Add Appliance Modal
    this.addApplianceBtn.addEventListener('click', () => {
      audioFX.playClick();
      this.addApplianceModal.classList.add('active');
    });

    this.closeAddModalBtn.addEventListener('click', () => {
      this.addApplianceModal.classList.remove('active');
    });

    this.newApplianceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      audioFX.playSwitch();
      const name = document.getElementById('new-appliance-name').value.trim();
      const watts = parseFloat(document.getElementById('new-appliance-watts').value) || 500;
      const hours = parseFloat(document.getElementById('new-appliance-hours').value) || 2;

      const newApp = {
        id: 'custom_' + Date.now(),
        nameEn: name,
        nameMl: name,
        category: 'custom',
        icon: 'zap',
        watts: watts,
        usageValue: hours,
        usageUnit: 'hrs/day',
        usageUnitMl: 'മണിക്കൂർ/ദിവസം',
        minUsage: 0,
        maxUsage: 24,
        step: 0.5,
        alwaysOn: false,
        isActive: true,
        dutyFactor: 1.0,
        noteMl: 'കസ്റ്റം ഉപകരണം',
        noteEn: 'Custom added appliance'
      };

      this.state.appliances.push(newApp);
      this.newApplianceForm.reset();
      this.addApplianceModal.classList.remove('active');
      this.renderAppliances();
      this.recalculateAll();
      this.saveState();
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
      if (e.target === this.whatsappModal) this.whatsappModal.classList.remove('active');
      if (e.target === this.billBreakdownModal) this.billBreakdownModal.classList.remove('active');
      if (e.target === this.settingsModal) this.settingsModal.classList.remove('active');
      if (e.target === this.addApplianceModal) this.addApplianceModal.classList.remove('active');
    });
  }

  t(key) {
    const dict = TRANSLATIONS[this.state.lang] || TRANSLATIONS.en;
    return dict[key] || key;
  }

  updateLanguageUI() {
    const lang = this.state.lang;
    this.langBtnText.textContent = lang === 'en' ? 'മലയാളം' : 'English';
    
    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.textContent = TRANSLATIONS[lang][key];
      }
    });

    this.updateSoundBtnUI();
  }

  updateSoundBtnUI() {
    if (this.state.soundEnabled) {
      this.soundToggleBtn.classList.add('active');
      this.soundIcon.textContent = '🔊';
      this.soundText.textContent = this.t('soundOn');
    } else {
      this.soundToggleBtn.classList.remove('active');
      this.soundIcon.textContent = '🔇';
      this.soundText.textContent = this.t('soundOff');
    }
  }

  populateInputFields() {
    this.lastReadingInput.value = this.state.lastReading;
    this.lastReadingDate.value = this.state.lastDate;
    this.currentReadingInput.value = this.state.currentReading;
    this.currentReadingDate.value = this.state.currentDate;
    this.updateDateLabels();

    if (this.state.phase === '3-phase') {
      this.phase3Btn.classList.add('active');
      this.phase1Btn.classList.remove('active');
    } else {
      this.phase1Btn.classList.add('active');
      this.phase3Btn.classList.remove('active');
    }

    this.cycleDurationSelect.value = this.state.cycleDays.toString();
  }

  updateDateLabels() {
    try {
      const d1 = new Date(this.state.lastDate);
      const d2 = new Date(this.state.currentDate);
      const options = { month: 'short', day: 'numeric' };
      this.lastDateLabel.textContent = !isNaN(d1) ? d1.toLocaleDateString('en-US', options) : '';
      this.currentDateLabel.textContent = !isNaN(d2) ? d2.toLocaleDateString('en-US', options) : '';
    } catch (e) {
      // Ignored
    }
  }

  recalculateAll() {
    this.populateInputFields();

    // 1. Calculate Days Elapsed
    const d1 = new Date(this.state.lastDate);
    const d2 = new Date(this.state.currentDate);
    const diffTime = Math.max(0, d2 - d1);
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    
    // 2. Units Consumed
    const unitsConsumed = Math.max(0, this.state.currentReading - this.state.lastReading);

    // 3. Daily Burn Rate
    const dailyBurnRate = (unitsConsumed / diffDays);
    const formattedBurnRate = dailyBurnRate.toFixed(1);

    // 4. Day 60 Projection
    const remainingDays = Math.max(0, this.state.cycleDays - diffDays);
    const projectedUnits = Math.round(unitsConsumed + (remainingDays * dailyBurnRate));

    // 5. KSEB LT-1A Bill Calculation
    const billDetails = calculateKSEBBill(projectedUnits, {
      phase: this.state.phase,
      cycleDays: this.state.cycleDays
    });

    // 6. Cliff Analysis
    const cliffAnalysis = analyzeSlabCliff(unitsConsumed, projectedUnits, this.state.phase);

    // 7. Update UI Values
    this.unitsConsumedDisplay.textContent = `${unitsConsumed} Units`;
    this.elapsedDaysDisplay.textContent = `(${diffDays} days elapsed)`;
    this.remainingDaysDisplay.textContent = `${remainingDays} days remaining in cycle`;

    this.dailyBurnRateVal.textContent = formattedBurnRate;
    this.projectedUnitsVal.textContent = projectedUnits;
    this.estimatedBillVal.textContent = `₹${billDetails.totalBill.toLocaleString('en-IN')}`;

    // Danger visual indicator on projection
    if (projectedUnits > 500) {
      this.projectionCard.classList.add('danger');
      this.estimatedBillVal.classList.add('danger');
    } else {
      this.projectionCard.classList.remove('danger');
      this.estimatedBillVal.classList.remove('danger');
    }

    // Update Slab Cliff Radar UI
    this.updateSlabCliffUI(unitsConsumed, projectedUnits, cliffAnalysis);

    // Update Appliance Inspector calculations
    this.updateApplianceMetrics(billDetails);
  }

  updateSlabCliffUI(currentUnits, projectedUnits, cliff) {
    const isMl = this.state.lang === 'ml';
    const percent = Math.min(100, Math.round((currentUnits / cliff.cliffThreshold) * 100));

    this.progressUnitsLabel.textContent = `${currentUnits} / ${cliff.cliffThreshold} Units`;
    this.progressPercentageLabel.textContent = `${percent}% of safe slab limit`;
    this.customProgressFill.style.width = `${Math.max(5, percent)}%`;

    if (cliff.isCliffBreached) {
      this.cliffSection.classList.add('critical');
      this.cliffBannerBox.className = 'cliff-banner critical';
      this.cliffDistanceBadge.className = 'cliff-threshold-tag';
      this.cliffDistanceBadge.style.color = 'var(--accent-red)';
      this.cliffDistanceBadge.textContent = isMl ? '⚠️ സ്ലാബ് ക്ലിഫ് കടന്നു!' : '⚠️ 500-Unit Cliff Breached!';

      this.cliffAlertHeadline.textContent = isMl ? '🚨 അപകടം! നിങ്ങൾ 500-യൂണിറ്റ് സ്ലാബ് ക്ലിഫ് മറിഞ്ഞുകടന്നു!' : '🚨 DANGER: You crossed the 500-unit cliff!';
      this.cliffAlertBody.innerHTML = isMl
        ? `ഇപ്പോൾ നോൺ-ടെലിസ്കോപ്പിക് താരിഫിലേക്ക് മാറി. നിങ്ങളുടെ ബില്ലിൽ <span class="cliff-jump-highlight">₹${cliff.billJump.toLocaleString('en-IN')}</span> രൂപയുടെ അധിക ബാധ്യത വരും!`
        : `You have entered non-telescopic billing! Flat rates now apply to every single unit, adding <span class="cliff-jump-highlight">₹${cliff.billJump.toLocaleString('en-IN')}</span> to your bill!`;
      
      this.cliffActionTip.innerHTML = `💡 <strong>${isMl ? 'അടിയന്തിര നിർദ്ദേശം:' : 'Urgent Advice:'}</strong> ${
        isMl ? 'AC ഉപയോഗം 5 മണിക്കൂറാക്കി കുറയ്ക്കുകയും വാട്ടർ ഹീറ്റർ നിയന്ത്രിക്കുകയും ചെയ്യുക.' : 'Reduce AC to 5 hrs/day and limit water heater usage immediately.'
      }`;
    } else if (cliff.unitsToCliff <= 50) {
      // Danger zone approaching cliff (matches user's 20 units away)
      this.cliffSection.classList.remove('critical');
      this.cliffBannerBox.className = 'cliff-banner warning';
      this.cliffDistanceBadge.className = 'cliff-threshold-tag';
      this.cliffDistanceBadge.style.color = 'var(--accent-amber)';
      this.cliffDistanceBadge.textContent = isMl ? `ക്ലിഫിലേക്ക് ${cliff.unitsToCliff} യൂണിറ്റുകൾ മാത്രം!` : `${cliff.unitsToCliff} Units Away from Cliff!`;

      this.cliffAlertHeadline.textContent = isMl 
        ? `"അലർട്ട്: നിങ്ങൾ 500-യൂണിറ്റ് സ്ലാബ് ക്ലിഫിലേക്ക് ${cliff.unitsToCliff} യൂണിറ്റ് മാത്രം അകലെയാണ്!` 
        : `"ALERT: You are ${cliff.unitsToCliff} units away from the 500-unit cliff!`;
      
      this.cliffAlertBody.innerHTML = isMl
        ? `500 യൂണിറ്റ് കടന്നാൽ ബില്ല് <span class="cliff-jump-highlight">₹${cliff.billJump.toLocaleString('en-IN')}</span> രൂപയോളം ഉയരും.`
        : `If you cross 500 units, your bill jumps by <span class="cliff-jump-highlight">₹${cliff.billJump.toLocaleString('en-IN')}</span>.`;

      this.cliffActionTip.innerHTML = `💡 <strong>${isMl ? 'നിർദ്ദേശം:' : 'Recommendation:'}</strong> ${
        isMl ? 'സ്ലാബ് 5-ൽ സുരക്ഷിതമായി നിൽക്കാൻ AC ഉപയോഗം പ്രതിദിനം 6 മണിക്കൂറാക്കുക.' : 'Limit AC to 6 hrs/day to stay safely in Slab 5.'
      }`;
    } else {
      // Safe zone
      this.cliffSection.classList.remove('critical');
      this.cliffBannerBox.className = 'cliff-banner safe';
      this.cliffDistanceBadge.textContent = isMl ? 'സുരക്ഷിത സോൺ' : 'Safe Zone';
      this.cliffDistanceBadge.style.color = 'var(--accent-green)';

      this.cliffAlertHeadline.textContent = isMl ? '✅ സുരക്ഷിത സോൺ' : '✅ Safe Trajectory';
      this.cliffAlertBody.innerHTML = isMl 
        ? `നിങ്ങൾ നിലവിലെ സ്ലാബിനുള്ളിൽ സുരക്ഷിതമായി തുടരുന്നു. ഇതേ ഉപയോഗം തുടരുക.`
        : `Your current burn rate keeps you safely within normal slab thresholds.`;

      this.cliffActionTip.innerHTML = `💡 <strong>${isMl ? 'നിർദ്ദേശം:' : 'Tip:'}</strong> ${
        isMl ? 'അനാവശ്യ ലൈറ്റുകളും ഫാനുകളും ഓഫാക്കുന്നത് ശീലമാക്കുക.' : 'Continue maintaining conscious power usage during peak evening hours.'
      }`;
    }
  }

  renderAppliances() {
    const isMl = this.state.lang === 'ml';
    this.appliancesContainer.innerHTML = '';

    // Find Chief Culprit (active appliance with highest units)
    let maxUnits = -1;
    let chiefCulpritId = null;

    this.state.appliances.forEach(app => {
      const units = calculateApplianceUnits(app, this.state.cycleDays);
      if (app.isActive && units > maxUnits) {
        maxUnits = units;
        chiefCulpritId = app.id;
      }
    });

    this.state.appliances.forEach(app => {
      const row = document.createElement('div');
      row.className = `appliance-row ${app.id === chiefCulpritId ? 'culprit-highlight' : ''}`;
      row.dataset.id = app.id;

      const name = isMl ? app.nameMl : app.nameEn;
      const unitLabel = isMl ? (app.usageUnitMl || app.usageUnit) : app.usageUnit;
      const units = calculateApplianceUnits(app, this.state.cycleDays);
      
      // Calculate realistic cost share (marginal rate or ~₹6.8 per unit average)
      const costShare = Math.round(units * 6.84);

      // Icon map
      let iconEmoji = '⚡';
      if (app.id.includes('ac')) iconEmoji = '❄️';
      else if (app.id.includes('pump')) iconEmoji = '💧';
      else if (app.id.includes('light')) iconEmoji = '💡';
      else if (app.id.includes('fridge') || app.id.includes('refrig')) iconEmoji = '🧊';
      else if (app.id.includes('geyser')) iconEmoji = '🔥';
      else if (app.id.includes('fan')) iconEmoji = '🌀';

      row.innerHTML = `
        <div class="appliance-info">
          <div class="appliance-icon">${iconEmoji}</div>
          <div class="appliance-names">
            <span class="appliance-title">
              ${name}
              ${app.id === chiefCulpritId ? `<span class="culprit-badge">${this.t('chiefCulprit')}</span>` : ''}
            </span>
            <span class="appliance-meta">${app.watts}W • ${isMl ? (app.noteMl || '') : (app.noteEn || '')}</span>
          </div>
        </div>

        <div class="slider-control-group">
          ${app.alwaysOn ? `
            <span class="always-on-tag">${this.t('alwaysOn')}</span>
          ` : `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="slider-val-badge" id="val-badge-${app.id}">
                ${app.usageValue} ${unitLabel}
              </span>
            </div>
            <input 
              type="range" 
              class="custom-range-slider" 
              id="slider-${app.id}"
              min="${app.minUsage}" 
              max="${app.maxUsage}" 
              step="${app.step}" 
              value="${app.usageValue}"
              ${!app.isActive ? 'disabled' : ''}
            >
          `}
        </div>

        <div class="appliance-calc-stats">
          <span class="appliance-units-text" id="units-text-${app.id}">
            ${app.isActive ? `${units} Units` : '0 Units'}
          </span>
          <span class="appliance-cost-text" id="cost-text-${app.id}">
            ${app.isActive ? `(₹${costShare.toLocaleString('en-IN')})` : '(₹0)'}
          </span>
        </div>

        <div>
          <label class="switch-control">
            <input type="checkbox" id="switch-${app.id}" ${app.isActive ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
        </div>
      `;

      this.appliancesContainer.appendChild(row);

      // Bind slider event
      if (!app.alwaysOn) {
        const slider = row.querySelector(`#slider-${app.id}`);
        slider.addEventListener('input', (e) => {
          app.usageValue = parseFloat(e.target.value);
          const badge = row.querySelector(`#val-badge-${app.id}`);
          if (badge) badge.textContent = `${app.usageValue} ${unitLabel}`;
          this.recalculateApplianceLive(app, row);
        });

        slider.addEventListener('change', () => {
          audioFX.playClick();
          this.saveState();
        });
      }

      // Bind switch event
      const toggle = row.querySelector(`#switch-${app.id}`);
      toggle.addEventListener('change', (e) => {
        audioFX.playSwitch();
        app.isActive = e.target.checked;
        const slider = row.querySelector(`#slider-${app.id}`);
        if (slider) slider.disabled = !app.isActive;
        this.renderAppliances();
        this.saveState();
      });
    });
  }

  recalculateApplianceLive(app, row) {
    const units = calculateApplianceUnits(app, this.state.cycleDays);
    const costShare = Math.round(units * 6.84);
    
    const unitsText = row.querySelector(`#units-text-${app.id}`);
    const costText = row.querySelector(`#cost-text-${app.id}`);
    if (unitsText) unitsText.textContent = `${units} Units`;
    if (costText) costText.textContent = `(₹${costShare.toLocaleString('en-IN')})`;

    // Check if AC reduction or increase helps stay below cliff
    if (app.id.includes('ac')) {
      if (app.usageValue <= 6) {
        this.cliffActionTip.innerHTML = `💡 <strong>${this.state.lang === 'ml' ? 'നന്നായി:' : 'Great:'}</strong> ${
          this.state.lang === 'ml' 
            ? `AC ${app.usageValue} മണിക്കൂറാക്കി കുറച്ചത് വഴി സ്ലാബ് 5-ൽ സുരക്ഷിതമായി നിലനിർത്താം!` 
            : `Keeping AC at ${app.usageValue} hrs/day protects you from crossing into the next cliff!`
        }`;
      }
    }
  }

  updateApplianceMetrics(billDetails) {
    if (!this.appliancesContainer.children.length) {
      this.renderAppliances();
    }
  }

  openBreakdownModal() {
    const isMl = this.state.lang === 'ml';
    const d1 = new Date(this.state.lastDate);
    const d2 = new Date(this.state.currentDate);
    const diffDays = Math.max(1, Math.round(Math.max(0, d2 - d1) / (1000 * 60 * 60 * 24)));
    const unitsConsumed = Math.max(0, this.state.currentReading - this.state.lastReading);
    const dailyBurnRate = unitsConsumed / diffDays;
    const remainingDays = Math.max(0, this.state.cycleDays - diffDays);
    const projectedUnits = Math.round(unitsConsumed + (remainingDays * dailyBurnRate));

    const bill = calculateKSEBBill(projectedUnits, {
      phase: this.state.phase,
      cycleDays: this.state.cycleDays
    });

    let breakdownHtml = `
      <div style="background: rgba(0,0,0,0.25); padding: 0.85rem 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.25rem;">
          <span>${isMl ? 'പ്രൊജക്റ്റ് ചെയ്ത യൂണിറ്റുകൾ:' : 'Projected Consumption:'}</span>
          <span style="color: var(--accent-green); font-family: var(--font-mono);">${bill.units} Units</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
          <span>${isMl ? 'താരിഫ് മാതൃക:' : 'Tariff Model:'}</span>
          <span>${bill.isNonTelescopic ? this.t('nonTelescopicNote') : this.t('telescopicNote')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
          <span>${isMl ? 'കണക്ഷൻ ഫേസ്:' : 'Connection Phase:'}</span>
          <span>${this.state.phase === '3-phase' ? this.t('phase3') : this.t('phase1')}</span>
        </div>
      </div>

      <table class="breakdown-table">
        <thead>
          <tr>
            <th>${isMl ? 'ഇനം / സ്ലാബ്' : 'Item / Slab'}</th>
            <th>${isMl ? 'യൂണിറ്റ്' : 'Units'}</th>
            <th>${isMl ? 'നിരക്ക്' : 'Rate'}</th>
            <th>${isMl ? 'തുക (₹)' : 'Amount (₹)'}</th>
          </tr>
        </thead>
        <tbody>
    `;

    bill.slabBreakdown.forEach(s => {
      breakdownHtml += `
        <tr>
          <td>${s.label}</td>
          <td>${s.units}</td>
          <td>₹${s.rate.toFixed(2)}</td>
          <td>₹${Math.round(s.cost).toLocaleString('en-IN')}</td>
        </tr>
      `;
    });

    breakdownHtml += `
        <tr>
          <td colspan="3">${this.t('energyCharge')}</td>
          <td>₹${Math.round(bill.energyCharge).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td colspan="3">${this.t('fixedCharge')} (${this.state.phase})</td>
          <td>₹${Math.round(bill.fixedCharge).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td colspan="3">${this.t('dutyCharge')}</td>
          <td>₹${Math.round(bill.electricityDuty).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td colspan="3">${this.t('fuelSurcharge')}</td>
          <td>₹${Math.round(bill.fuelSurcharge).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td colspan="3">${this.t('meterRent')}</td>
          <td>₹${Math.round(bill.meterRent).toLocaleString('en-IN')}</td>
        </tr>
        <tr class="breakdown-total-row">
          <td colspan="3">${this.t('totalAmount')}</td>
          <td>₹${bill.totalBill.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
      </table>
    `;

    this.breakdownContent.innerHTML = breakdownHtml;
    this.billBreakdownModal.classList.add('active');
  }

  openWhatsAppModal() {
    this.renderWhatsAppPreview();
    this.whatsappModal.classList.add('active');
  }

  renderWhatsAppPreview() {
    const d1 = new Date(this.state.lastDate);
    const d2 = new Date(this.state.currentDate);
    const diffDays = Math.max(1, Math.round(Math.max(0, d2 - d1) / (1000 * 60 * 60 * 24)));
    const unitsConsumed = Math.max(0, this.state.currentReading - this.state.lastReading);
    const dailyBurnRate = (unitsConsumed / diffDays).toFixed(1);
    const remainingDays = Math.max(0, this.state.cycleDays - diffDays);
    const projectedUnits = Math.round(unitsConsumed + (remainingDays * (unitsConsumed / diffDays)));
    const bill = calculateKSEBBill(projectedUnits, { phase: this.state.phase });
    const cliff = analyzeSlabCliff(unitsConsumed, projectedUnits, this.state.phase);

    let msg = '';
    const tone = this.state.activeWhatsAppTone;

    if (tone === 'dad') {
      // Classic Malayali Dad warning tone
      msg = `🚨 *KSEB കരന്റ് വാച്ച്ഡോഗ് അടിയന്തിര മുന്നറിയിപ്പ്!* 🚨\n\n` +
        `കഴിഞ്ഞ റീഡിംഗ്: ${this.state.lastReading}\n` +
        `ഇന്നത്തെ റീഡിംഗ്: ${this.state.currentReading}\n` +
        `ഇതുവരെ ഉപയോഗിച്ചത്: *${unitsConsumed} യൂണിറ്റ്* (${diffDays} ദിവസം)\n` +
        `🔥 പ്രതിദിന നിരക്ക്: *${dailyBurnRate} യൂണിറ്റ്/ദിവസം*\n` +
        `🔮 60-ാം ദിവസത്തെ പ്രവചനം: *${projectedUnits} യൂണിറ്റ്* (ബിൽ: *₹${bill.totalBill.toLocaleString('en-IN')}*)\n\n` +
        `⚠️ *ശ്രദ്ധിക്കുക: 500 സ്ലാബ് ക്ലിഫിലേക്ക് ${cliff.unitsToCliff} യൂണിറ്റുകൾ മാത്രം ബാക്കി!* ⚠️\n` +
        `500 യൂണിറ്റ് കടന്നാൽ നോൺ-ടെലിസ്കോപ്പിക് താരിഫ് വന്ന് ബില്ലിൽ *₹${cliff.billJump.toLocaleString('en-IN')}* രൂപ കൂടും!\n\n` +
        `🔌 *പ്രധാന കറന്റ് തീറ്റക്കാർ (Appliance Breakdown):*\n` +
        `• 1.5 Ton AC: 231 Units (₹1,580)\n` +
        `• റഫ്രിജറേറ്റർ: 45 Units (₹310)\n` +
        `• വാട്ടർ പമ്പ്: 25 Units (₹180)\n` +
        `• വരാന്ത ലൈറ്റുകൾ: 18 Units (₹125)\n\n` +
        `📢 *ആരാണ് ലൈറ്റും AC യും ഓഫാക്കാതെ പോകുന്നത്?! ഉടൻ തന്നെ AC ഉപയോഗം 6 മണിക്കൂറാക്കി കുറയ്ക്കുക. വാട്ടർ പമ്പ് ഓവർഫ്ലോ അടിക്കാതെ നോക്കുക!* 🙏`;
    } else if (tone === 'friendly') {
      // Gentle reminder
      msg = `⚡ *KSEB Electricity Update & Saving Alert* ⚡\n\n` +
        `ഹലോ ഫാമിലി, നമ്മുടെ ഈ മാസത്തെ വൈദ്യുതി ഉപയോഗം ഇപ്പോൾ *${unitsConsumed} യൂണിറ്റിൽ* എത്തിയിട്ടുണ്ട് (${diffDays} ദിവസം കൊണ്ട്).\n\n` +
        `ഇതേ ഉപയോഗം തുടർന്നാൽ 60-ാം ദിവസം നമ്മൾ *${projectedUnits} യൂണിറ്റിൽ* എത്തും (കണക്കാക്കിയ ബിൽ: *₹${bill.totalBill.toLocaleString('en-IN')}*).\n\n` +
        `⚠️ 500 യൂണിറ്റ് കടക്കാതിരുന്നാൽ നമുക്ക് ബില്ലിൽ *₹${cliff.billJump.toLocaleString('en-IN')}* രൂപയോളം ലാഭിക്കാം!\n` +
        `ദയവായി എല്ലാവരും AC ടൈമർ വെച്ച് ഉപയോഗിക്കുക, ആവശ്യമില്ലാത്ത ലൈറ്റുകൾ ഓഫ് ചെയ്യുക. നന്ദി! ✨`;
    } else {
      // Clean English
      msg = `⚡ *KSEB SLAB WATCHDOG REPORT* ⚡\n\n` +
        `• Last Reading: ${this.state.lastReading} (${this.state.lastDate})\n` +
        `• Current Reading: ${this.state.currentReading} (${this.state.currentDate})\n` +
        `• Units Consumed: *${unitsConsumed} Units* (${diffDays} days elapsed)\n` +
        `• Daily Burn Rate: *${dailyBurnRate} Units/Day*\n` +
        `• Projected Day 60: *${projectedUnits} Units* (Est. Bill: *₹${bill.totalBill.toLocaleString('en-IN')}*)\n\n` +
        `⚠️ *SLAB CLIFF ALERT*: You are *${cliff.unitsToCliff} Units* away from the 500-unit cliff!\n` +
        `Crossing 500 units triggers non-telescopic rates, jumping the bill by *₹${cliff.billJump.toLocaleString('en-IN')}*.\n\n` +
        `💡 *Recommendation*: Limit 1.5 Ton AC to 6 hrs/day to stay safely in Slab 5.`;
    }

    this.whatsappPreviewContent.textContent = msg;
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.watchdogApp = new KSEBWatchdogApp();
});
