/**
 * MICE ESG Platform - Scenario Presets Engine
 */
(function() {
  'use strict';

  // --- App-Internal Saved Presets Slot Manager ---
  const PRESETS_SLOTS_KEY = 'mice_esg_saved_presets_slots_v1';

  function getSavedPresetSlots() {
    try {
      const raw = localStorage.getItem(PRESETS_SLOTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function openEsgPresetsModal() {
    const modal = document.getElementById('esgPresetsModal');
    if (!modal) return;
    renderPresetsListUI();
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      const content = modal.querySelector('> div');
      if (content) content.classList.remove('scale-95');
    }, 10);
  }

  function closeEsgPresetsModal() {
    const modal = document.getElementById('esgPresetsModal');
    if (!modal) return;
    modal.style.pointerEvents = 'none';
    modal.classList.add('opacity-0');
    const content = modal.querySelector('> div');
    if (content) content.classList.add('scale-95');
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.add('hidden');
    }, 300);
  }

  function saveCurrentPresetInApp() {
    const titleInput = document.getElementById('preset-title-input');
    let title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      title = `ESG 실천 데이터 (${new Date().toLocaleDateString('ko-KR')})`;
    }

    if (typeof recalculateSessionTotalCarbon === 'function') {
      recalculateSessionTotalCarbon();
    }
    const slots = getSavedPresetSlots();
    const newSlot = {
      id: 'slot_' + Date.now(),
      title: title,
      savedAt: new Date().toLocaleString('ko-KR'),
      totalCarbonKg: ((window.sessionStats?.totalReducedCarbonGrams || 0) / 1000).toFixed(2),
      actionsCount: window.sessionStats?.totalActions || 0,
      fullState: {
        sessionStats: JSON.parse(JSON.stringify(window.sessionStats || {})),
        localFoodState: JSON.parse(JSON.stringify(window.localFoodState || {})),
        iso20121State: JSON.parse(JSON.stringify(window.iso20121State || {})),
        barrierFreeState: JSON.parse(JSON.stringify(window.barrierFreeState || {})),
        safetyLaborState: JSON.parse(JSON.stringify(window.safetyLaborState || {})),
        venueEcologyState: JSON.parse(JSON.stringify(window.venueEcologyState || {})),
        pledgesState: JSON.parse(JSON.stringify(window.pledgesState || [])),
        knowledgeState: JSON.parse(JSON.stringify(window.knowledgeState || {})),
        localEconomyState: JSON.parse(JSON.stringify(window.localEconomyState || {})),
        advisoryMinutesState: JSON.parse(JSON.stringify(window.advisoryMinutesState || {})),
        esgDisclosureState: JSON.parse(JSON.stringify(window.esgDisclosureState || {})),
        esgReportState: JSON.parse(JSON.stringify(window.esgReportState || {})),
        wasteRecyclingState: JSON.parse(JSON.stringify(window.wasteRecyclingState || {})),
        supportersState: JSON.parse(JSON.stringify(window.supportersState || {})),
        currentFreightState: JSON.parse(JSON.stringify(window.currentFreightState || {})),
        currentFnbState: JSON.parse(JSON.stringify(window.currentFnbState || {})),
        currentTravelState: JSON.parse(JSON.stringify(window.currentTravelState || {}))
      }
    };

    slots.unshift(newSlot);
    localStorage.setItem(PRESETS_SLOTS_KEY, JSON.stringify(slots));
    if (titleInput) titleInput.value = '';
    renderPresetsListUI();
    if (typeof showToast === 'function') {
      showToast(`"${title}" 슬롯이 프로그램 내에 저장되었습니다! 💾`);
    }
  }

  function loadPresetSlotInApp(id) {
    const slots = getSavedPresetSlots();
    const target = slots.find(s => s.id === id);
    if (!target || !target.fullState) {
      if (typeof showToast === 'function') showToast('저장된 데이터 슬롯을 찾을 수 없습니다.', true);
      return;
    }

    if (typeof window.isRestoringState !== 'undefined') window.isRestoringState = true;
    const fullState = target.fullState;

    if (fullState.sessionStats && window.sessionStats) window.sessionStats = Object.assign(window.sessionStats, fullState.sessionStats);
    if (fullState.localFoodState) { window.localFoodState = Object.assign(window.localFoodState || {}, fullState.localFoodState); }
    if (fullState.iso20121State) { window.iso20121State = Object.assign(window.iso20121State || {}, fullState.iso20121State); }
    if (fullState.barrierFreeState) { window.barrierFreeState = Object.assign(window.barrierFreeState || {}, fullState.barrierFreeState); }
    if (fullState.safetyLaborState) { window.safetyLaborState = Object.assign(window.safetyLaborState || {}, fullState.safetyLaborState); }
    if (fullState.venueEcologyState) { window.venueEcologyState = Object.assign(window.venueEcologyState || {}, fullState.venueEcologyState); }
    if (fullState.pledgesState) { window.pledgesState = fullState.pledgesState; }
    if (fullState.knowledgeState) { window.knowledgeState = Object.assign(window.knowledgeState || {}, fullState.knowledgeState); }
    if (fullState.localEconomyState) { window.localEconomyState = Object.assign(window.localEconomyState || {}, fullState.localEconomyState); }
    if (fullState.advisoryMinutesState) { window.advisoryMinutesState = Object.assign(window.advisoryMinutesState || {}, fullState.advisoryMinutesState); }
    if (fullState.esgDisclosureState) { window.esgDisclosureState = fullState.esgDisclosureState; }
    if (fullState.esgReportState) { window.esgReportState = Object.assign(window.esgReportState || {}, fullState.esgReportState); }
    if (fullState.wasteRecyclingState) { window.wasteRecyclingState = fullState.wasteRecyclingState; }
    if (fullState.supportersState) { window.supportersState = Object.assign(window.supportersState || {}, fullState.supportersState); }
    if (fullState.currentFreightState && window.currentFreightState) { window.currentFreightState = Object.assign(window.currentFreightState, fullState.currentFreightState); }
    if (fullState.currentFnbState && window.currentFnbState) { window.currentFnbState = Object.assign(window.currentFnbState, fullState.currentFnbState); }
    if (fullState.currentTravelState && window.currentTravelState) { window.currentTravelState = Object.assign(window.currentTravelState, fullState.currentTravelState); }

    if (typeof recalculateSessionTotalCarbon === 'function') recalculateSessionTotalCarbon();
    if (typeof updateDashboardUI === 'function') updateDashboardUI(window.sessionStats);
    if (typeof window.isRestoringState !== 'undefined') window.isRestoringState = false;

    if (typeof saveAllStateToLocalStorage === 'function') saveAllStateToLocalStorage();
    closeEsgPresetsModal();
    if (typeof showToast === 'function') showToast(`"${target.title}" 데이터를 성공적으로 불러왔습니다! 📥`);
  }

  function deletePresetSlotInApp(id) {
    if (!confirm('이 저장 데이터 슬롯을 삭제하시겠습니까?')) return;
    let slots = getSavedPresetSlots();
    slots = slots.filter(s => s.id !== id);
    localStorage.setItem(PRESETS_SLOTS_KEY, JSON.stringify(slots));
    renderPresetsListUI();
    if (typeof showToast === 'function') showToast('저장 데이터 슬롯이 삭제되었습니다.');
  }

  function renderPresetsListUI() {
    const container = document.getElementById('presets-list-container');
    const badge = document.getElementById('presets-count-badge');
    if (!container) return;

    const slots = getSavedPresetSlots();
    if (badge) badge.textContent = `${slots.length}개 저장됨`;

    if (slots.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div class="w-10 h-10 rounded-full bg-slate-200/60 text-slate-400 flex items-center justify-center mx-auto">
            <i data-lucide="inbox" class="w-5 h-5"></i>
          </div>
          <p class="text-xs font-bold text-slate-500">저장된 ESG 데이터 슬롯이 없습니다.</p>
          <p class="text-[11px] text-slate-400">위에서 데이터 이름을 입력하고 [현재 설정 저장]을 눌러보세요!</p>
        </div>`;
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
      return;
    }

    container.innerHTML = slots.map(slot => `
      <div class="bg-slate-50 hover:bg-slate-100/80 transition-all p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
        <div class="space-y-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="font-extrabold text-xs text-slate-900 truncate">${slot.title}</span>
            <span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">${slot.totalCarbonKg} kgCO2eq</span>
          </div>
          <div class="flex items-center space-x-3 text-[10px] text-slate-500 font-medium">
            <span>📅 ${slot.savedAt}</span>
            <span>⚡ ${slot.actionsCount || 0}개 실천 항목</span>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button onclick="loadPresetSlotInApp('${slot.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            불러오기
          </button>
          <button onclick="deletePresetSlotInApp('${slot.id}')" class="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  window.openEsgPresetsModal = openEsgPresetsModal;
  window.closeEsgPresetsModal = closeEsgPresetsModal;
  window.saveCurrentPresetInApp = saveCurrentPresetInApp;
  window.loadPresetSlotInApp = loadPresetSlotInApp;
  window.deletePresetSlotInApp = deletePresetSlotInApp;
  window.renderPresetsListUI = renderPresetsListUI;
  window.getSavedPresetSlots = getSavedPresetSlots;
})();
