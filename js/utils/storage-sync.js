/**
 * MICE ESG Platform - Local Storage Synchronization & Data Persistence
 */
(function() {
  'use strict';

  // --- MICE ESG Persistence Manager (Auto-Save, Load, Reset, 30-Min Expiration TTL) ---
  const STORAGE_KEY = 'mice_esg_persistent_state_v1';
  const EXPIRY_TIME_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
  let isRestoringState = false;
  window.isRestoringState = false;

    function saveAllStateToLocalStorage() {
      if (isRestoringState) return;
      try {
        const fullState = {
          sessionStats: sessionStats,
          localFoodState: window.localFoodState || (typeof localFoodState !== 'undefined' ? localFoodState : {}),
          iso20121State: window.iso20121State || (typeof iso20121State !== 'undefined' ? iso20121State : {}),
          barrierFreeState: window.barrierFreeState || (typeof barrierFreeState !== 'undefined' ? barrierFreeState : {}),
          safetyLaborState: window.safetyLaborState || (typeof safetyLaborState !== 'undefined' ? safetyLaborState : {}),
          venueEcologyState: window.venueEcologyState || (typeof venueEcologyState !== 'undefined' ? venueEcologyState : {}),
          pledgesState: window.pledgesState || (typeof pledgesState !== 'undefined' ? pledgesState : []),
          knowledgeState: window.knowledgeState || (typeof knowledgeState !== 'undefined' ? knowledgeState : {}),
          localEconomyState: window.localEconomyState || (typeof localEconomyState !== 'undefined' ? localEconomyState : {}),
          advisoryMinutesState: window.advisoryMinutesState || (typeof advisoryMinutesState !== 'undefined' ? advisoryMinutesState : {}),
          esgDisclosureState: window.esgDisclosureState,
          esgReportState: window.esgReportState || (typeof esgReportState !== 'undefined' ? esgReportState : {}),
          wasteRecyclingState: window.wasteRecyclingState,
          supportersState: window.supportersState || (typeof supportersState !== 'undefined' ? supportersState : {}),
          currentFreightState: currentFreightState,
          currentTravelState: window.currentTravelState || (typeof currentTravelState !== 'undefined' ? currentTravelState : {}),
          currentFnbState: window.currentFnbState || (typeof currentFnbState !== 'undefined' ? currentFnbState : {}),
          currentAccomState: window.currentAccomState || (typeof currentAccomState !== 'undefined' ? currentAccomState : {}),
          updatedTimestamp: Date.now(),
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
      } catch (err) {
        console.warn('Failed to save state to localStorage:', err);
      }
    }

    function loadAllStateFromLocalStorage() {
      try {
        const savedRaw = localStorage.getItem(STORAGE_KEY);
        if (!savedRaw) return false;

        const fullState = JSON.parse(savedRaw);
        if (!fullState) return false;

        // Check if 30 minutes have passed since last update
        const now = Date.now();
        const lastUpdated = fullState.updatedTimestamp || (fullState.savedAt ? new Date(fullState.savedAt).getTime() : 0);
        if (lastUpdated > 0 && (now - lastUpdated > EXPIRY_TIME_MS)) {
          console.log('[MICE ESG] Saved session expired (> 30 mins). Auto resetting active workspace.');
          localStorage.removeItem(STORAGE_KEY);
          setTimeout(() => {
            showToast('마지막 작성 후 30분이 경과하여 임시 ESG 카드 데이터가 자동 초기화되었습니다. ⏰');
          }, 600);
          return false;
        }

        isRestoringState = true;

        if (fullState.currentFreightState) {
          if (fullState.currentFreightState.distance === 120) fullState.currentFreightState.distance = 0;
          if (fullState.currentFreightState.weight === 2 || fullState.currentFreightState.weight === 2.0) fullState.currentFreightState.weight = 0;
          if (typeof currentFreightState !== 'undefined') currentFreightState = Object.assign(currentFreightState, fullState.currentFreightState);
          if (window.currentFreightState) Object.assign(window.currentFreightState, fullState.currentFreightState);
          if (typeof currentFreightMode !== 'undefined') currentFreightMode = fullState.currentFreightState.mode || 'van_1t_electric';
        }
        if (fullState.currentFnbState) {
          if (typeof currentFnbState !== 'undefined') {
            currentFnbState = Object.assign(currentFnbState, fullState.currentFnbState);
            window.currentFnbState = currentFnbState;
          } else {
            window.currentFnbState = fullState.currentFnbState;
          }
        }
        if (fullState.currentAccomState) {
          if (typeof currentAccomState !== 'undefined') {
            currentAccomState = Object.assign(currentAccomState, fullState.currentAccomState);
            window.currentAccomState = currentAccomState;
          } else {
            window.currentAccomState = fullState.currentAccomState;
          }
        }
        if (fullState.currentTravelState) {
          if (typeof currentTravelState !== 'undefined') {
            currentTravelState = Object.assign(currentTravelState, fullState.currentTravelState);
            window.currentTravelState = currentTravelState;
          } else {
            window.currentTravelState = fullState.currentTravelState;
          }
        }
        if (fullState.sessionStats) {
          sessionStats = Object.assign(sessionStats, fullState.sessionStats);
        }
        if (fullState.localFoodState) {
          localFoodState = Object.assign(typeof localFoodState !== 'undefined' ? localFoodState : {}, fullState.localFoodState);
          window.localFoodState = localFoodState;
        }
        if (fullState.iso20121State) {
          iso20121State = Object.assign(typeof iso20121State !== 'undefined' ? iso20121State : {}, fullState.iso20121State);
          window.iso20121State = iso20121State;
        }
        if (fullState.barrierFreeState) {
          barrierFreeState = Object.assign(typeof barrierFreeState !== 'undefined' ? barrierFreeState : {}, fullState.barrierFreeState);
          window.barrierFreeState = barrierFreeState;
        }
        if (fullState.safetyLaborState) {
          safetyLaborState = Object.assign(typeof safetyLaborState !== 'undefined' ? safetyLaborState : {}, fullState.safetyLaborState);
          window.safetyLaborState = safetyLaborState;
        }
        if (fullState.venueEcologyState) {
          venueEcologyState = Object.assign(typeof venueEcologyState !== 'undefined' ? venueEcologyState : {}, fullState.venueEcologyState);
          window.venueEcologyState = venueEcologyState;
        }
        if (fullState.pledgesState) {
          pledgesState = fullState.pledgesState;
          window.pledgesState = pledgesState;
        }
        if (fullState.knowledgeState) {
          knowledgeState = Object.assign(typeof knowledgeState !== 'undefined' ? knowledgeState : {}, fullState.knowledgeState);
          window.knowledgeState = knowledgeState;
        }
        if (fullState.localEconomyState) {
          localEconomyState = Object.assign(typeof localEconomyState !== 'undefined' ? localEconomyState : {}, fullState.localEconomyState);
          window.localEconomyState = localEconomyState;
        }
        if (fullState.advisoryMinutesState) {
          advisoryMinutesState = Object.assign(typeof advisoryMinutesState !== 'undefined' ? advisoryMinutesState : {}, fullState.advisoryMinutesState);
          window.advisoryMinutesState = advisoryMinutesState;
        }
        if (fullState.esgDisclosureState) {
          window.esgDisclosureState = fullState.esgDisclosureState;
        }
        if (fullState.esgReportState) {
          esgReportState = Object.assign(typeof esgReportState !== 'undefined' ? esgReportState : {}, fullState.esgReportState);
          window.esgReportState = esgReportState;
        }
        if (fullState.wasteRecyclingState) {
          window.wasteRecyclingState = fullState.wasteRecyclingState;
        }
        if (fullState.supportersState) {
          supportersState = Object.assign(typeof supportersState !== 'undefined' ? supportersState : {}, fullState.supportersState);
          window.supportersState = supportersState;
        }

        recalculateSessionTotalCarbon();
        updateDashboardUI(sessionStats);

        isRestoringState = false;
        return true;
      } catch (err) {
        console.warn('Failed to load state from localStorage:', err);
        isRestoringState = false;
        return false;
      }
    }

    function resetAllMiceData() {
      if (!confirm('정말로 입력한 모든 ESG 카드 데이터를 초기화하시겠습니까?\n(초기화 후에는 작성된 실천 내역이 모두 리셋됩니다)')) {
        return;
      }

      localStorage.removeItem(STORAGE_KEY);

      sessionStats = {
        username: '',
        totalReducedCarbonGrams: 0,
        totalParticipants: 0,
        totalActions: 0,
        items: {
          reusable_cup: 0,
          reusable_plate: 0,
          reusable_bowl: 0,
          reusable_fork: 0,
          public_transport: 0,
          travel_reduction: 0,
          renewable_energy: 0,
          upcycled_keyring: 0,
          upcycled_banner: 0,
          paper_booth: 0,
          digital_signage: 0,
          freight_reduction: 0,
          freight_forklift: 0,
          fnb_reduction: 0
        },
        keyringReducedCarbonGrams: 0,
        keyringParticipants: 0,
        paperBoothParticipants: 0
      };

      if (window.localFoodState) window.localFoodState.submitted = false;
      if (window.iso20121State) window.iso20121State.submitted = false;
      if (window.barrierFreeState) { window.barrierFreeState.submitted = false; window.barrierFreeState.checkedItems = []; }
      if (window.safetyLaborState) { window.safetyLaborState.submitted = false; window.safetyLaborState.checkedItems = []; }
      if (window.venueEcologyState) { window.venueEcologyState.submitted = false; window.venueEcologyState.checkedCerts = []; }
      if (window.pledgesState) window.pledgesState = [];
      pledgesState = [];
      if (window.stakeholderState) window.stakeholderState.submitted = false;
      stakeholderState.submitted = false;
      if (window.knowledgeState) window.knowledgeState.submitted = false;
      if (window.localEconomyState) window.localEconomyState.submitted = false;
      if (window.advisoryMinutesState) window.advisoryMinutesState.submitted = false;
      if (window.esgDisclosureState) window.esgDisclosureState.submitted = false;
      if (window.esgReportState) window.esgReportState.submitted = false;
      if (window.wasteRecyclingState) window.wasteRecyclingState.submitted = false;
      if (window.supportersState) window.supportersState.submitted = false;
      if (window.currentFnbState) {
        window.currentFnbState.submitted = false;
        window.currentFnbState.tier = 'tier2';
        window.currentFnbState.savedCarbonGrams = 0;
      }
      if (window.currentTravelState) {
        window.currentTravelState.tier = 2;
        window.currentTravelState.mode = 'ktx';
        window.currentTravelState.cityKey = '';
        window.currentTravelState.oneWayDistanceKm = 0;
        window.currentTravelState.isRoundTrip = true;
        window.currentTravelState.passengers = 0;
        window.currentTravelState.seatClass = 'weighted_80_20';
        window.currentTravelState.rf = true;
        window.currentTravelState.wtt = true;
        window.currentTravelState.proxyTotalAttendees = 0;
        window.currentTravelState.baselineKg = 0;
        window.currentTravelState.actualKg = 0;
        window.currentTravelState.reductionKg = 0;
        window.currentTravelState.totalPkm = 0;
      }

      recalculateSessionTotalCarbon();
      updateDashboardUI(sessionStats);
      showToast('모든 ESG 카드 데이터가 성공적으로 초기화되었습니다. 🧹');
    }

    function exportMiceDataJson() {
      const fullState = {
        sessionStats: sessionStats,
        localFoodState: window.localFoodState || (typeof localFoodState !== 'undefined' ? localFoodState : {}),
        iso20121State: window.iso20121State || (typeof iso20121State !== 'undefined' ? iso20121State : {}),
        barrierFreeState: window.barrierFreeState || (typeof barrierFreeState !== 'undefined' ? barrierFreeState : {}),
        safetyLaborState: window.safetyLaborState || (typeof safetyLaborState !== 'undefined' ? safetyLaborState : {}),
        venueEcologyState: window.venueEcologyState || (typeof venueEcologyState !== 'undefined' ? venueEcologyState : {}),
        pledgesState: window.pledgesState || (typeof pledgesState !== 'undefined' ? pledgesState : []),
        knowledgeState: window.knowledgeState || (typeof knowledgeState !== 'undefined' ? knowledgeState : {}),
        localEconomyState: window.localEconomyState || (typeof localEconomyState !== 'undefined' ? localEconomyState : {}),
        advisoryMinutesState: window.advisoryMinutesState || (typeof advisoryMinutesState !== 'undefined' ? advisoryMinutesState : {}),
        esgDisclosureState: window.esgDisclosureState,
        esgReportState: window.esgReportState || (typeof esgReportState !== 'undefined' ? esgReportState : {}),
        wasteRecyclingState: window.wasteRecyclingState,
        supportersState: window.supportersState || (typeof supportersState !== 'undefined' ? supportersState : {}),
        currentFreightState: typeof currentFreightState !== 'undefined' ? currentFreightState : window.currentFreightState,
        currentFnbState: typeof currentFnbState !== 'undefined' ? currentFnbState : window.currentFnbState,
        currentTravelState: typeof currentTravelState !== 'undefined' ? currentTravelState : window.currentTravelState,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MUREPA_MICE_ESG_Data_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('현재 ESG 카드 설정 데이터가 JSON 파일로 백업되었습니다. 💾');
    }

    function importMiceDataJson(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedState = JSON.parse(e.target.result);
          if (!importedState) throw new Error('올바르지 않은 파일 형식입니다.');

          if (importedState.sessionStats) sessionStats = Object.assign(sessionStats, importedState.sessionStats);
          if (importedState.localFoodState) window.localFoodState = Object.assign(window.localFoodState || {}, importedState.localFoodState);
          if (importedState.iso20121State) window.iso20121State = Object.assign(window.iso20121State || {}, importedState.iso20121State);
          if (importedState.barrierFreeState) window.barrierFreeState = Object.assign(window.barrierFreeState || {}, importedState.barrierFreeState);
          if (importedState.safetyLaborState) window.safetyLaborState = Object.assign(window.safetyLaborState || {}, importedState.safetyLaborState);
          if (importedState.venueEcologyState) window.venueEcologyState = Object.assign(window.venueEcologyState || {}, importedState.venueEcologyState);
          if (importedState.pledgesState) window.pledgesState = importedState.pledgesState;
          if (importedState.knowledgeState) window.knowledgeState = Object.assign(window.knowledgeState || {}, importedState.knowledgeState);
          if (importedState.localEconomyState) window.localEconomyState = Object.assign(window.localEconomyState || {}, importedState.localEconomyState);
          if (importedState.advisoryMinutesState) window.advisoryMinutesState = Object.assign(window.advisoryMinutesState || {}, importedState.advisoryMinutesState);
          if (importedState.esgDisclosureState) window.esgDisclosureState = importedState.esgDisclosureState;
          if (importedState.esgReportState) window.esgReportState = Object.assign(window.esgReportState || {}, importedState.esgReportState);
          if (importedState.wasteRecyclingState) window.wasteRecyclingState = importedState.wasteRecyclingState;
          if (importedState.supportersState) window.supportersState = Object.assign(window.supportersState || {}, importedState.supportersState);
          if (importedState.currentFreightState) window.currentFreightState = Object.assign(window.currentFreightState || {}, importedState.currentFreightState);
          if (importedState.currentFnbState) window.currentFnbState = Object.assign(window.currentFnbState || {}, importedState.currentFnbState);
          if (importedState.currentTravelState) window.currentTravelState = Object.assign(window.currentTravelState || {}, importedState.currentTravelState);

          recalculateSessionTotalCarbon();
          updateDashboardUI(sessionStats);
          saveAllStateToLocalStorage();
          showToast('저장된 ESG 카드 데이터가 정상적으로 적용되었습니다! 📥');
        } catch (err) {
          showToast('JSON 파일을 읽는 중 오류가 발생했습니다: ' + err.message, true);
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }

    window.saveAllStateToLocalStorage = saveAllStateToLocalStorage;
    window.loadAllStateFromLocalStorage = loadAllStateFromLocalStorage;
    window.resetAllMiceData = resetAllMiceData;
    window.exportMiceDataJson = exportMiceDataJson;
    window.importMiceDataJson = importMiceDataJson;
})();
