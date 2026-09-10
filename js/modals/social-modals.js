/**
 * MICE ESG Platform - Social (S) Domain Modals
 * Covers: Local Food, Barrier-Free, Safety & Labor, Local Economy, Inclusion, Education, Supporters, Donation, Knowledge
 */
(function() {
  'use strict';

    // ==========================================
    // LOCAL FOOD CALCULATOR JS (로컬푸드 구매 탄소감축 계산기)
    // ==========================================
    let localFoodState = {
      submitted: false,
      username: '',
      store: '',
      amount: 0, // in Won
      reductionGrams: 0
    };

    function openLocalFoodModal() {
      try {
        const modal = document.getElementById('localFoodModal');
        if (!modal) {
          console.error('localFoodModal element not found');
          return;
        }

        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        setTimeout(() => {
          modal.classList.remove('opacity-0');
          const innerDiv = modal.querySelector('div');
          if (innerDiv) innerDiv.classList.remove('scale-95');
        }, 10);

        const cancelBtn = document.getElementById('btn-cancel-submit-local-food');
        if (cancelBtn) {
          if (localFoodState.submitted) {
            cancelBtn.classList.remove('hidden');
          } else {
            cancelBtn.classList.add('hidden');
          }
        }

        try {
          const userEl = document.getElementById('local-food-username');
          const storeEl = document.getElementById('local-food-store');
          const amountEl = document.getElementById('local-food-amount');

          if (userEl) userEl.value = localFoodState.username || (typeof sessionStats !== 'undefined' ? sessionStats.username : '') || '';
          if (storeEl) storeEl.value = localFoodState.store || '';
          if (amountEl) amountEl.value = localFoodState.amount > 0 ? localFoodState.amount : '';
          
          calculateLocalFood();
        } catch (e) {
          console.warn('Local food modal populating warning:', e);
        }
      } catch (err) {
        console.error('Error opening Local Food modal:', err);
      }
    }

    function closeLocalFoodModal() {
      const modal = document.getElementById('localFoodModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const innerDiv = modal.querySelector('div');
      if (innerDiv) innerDiv.classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    function calculateLocalFood() {
      const storeVal = (document.getElementById('local-food-store')?.value || '').trim();
      const amountVal = parseFloat(document.getElementById('local-food-amount')?.value) || 0;
      const btn = document.getElementById('btn-submit-local-food');

      const amountManWon = amountVal / 10000;
      const basicEmissionKg = amountManWon * 0.6889;
      const reductionKg = amountManWon * 0.34445;

      const basicEl = document.getElementById('local-food-basic-emission');
      const reductionEl = document.getElementById('local-food-reduction');

      if (basicEl) basicEl.textContent = `${basicEmissionKg.toFixed(3)} kgCO2eq`;
      if (reductionEl) reductionEl.textContent = `${reductionKg.toFixed(3)} kgCO2eq`;

      if (btn) {
        if (storeVal && amountVal > 0) {
          btn.disabled = false;
          btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
          btn.classList.add('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
        } else {
          btn.disabled = true;
          btn.classList.remove('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
          btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
        }
      }
    }

    function submitLocalFood() {
      const storeVal = document.getElementById('local-food-store').value.trim();
      const amountVal = parseFloat(document.getElementById('local-food-amount').value) || 0;
      const username = document.getElementById('local-food-username').value.trim();

      if (!storeVal || amountVal <= 0) {
        showToast('구매 매장과 구매 금액을 정확하게 입력해 주세요.', true);
        return;
      }

      const amountManWon = amountVal / 10000;
      // Formula 2: reduction tCO2eq = 만원 * 0.00034445.
      // 0.00034445 tCO2eq = 0.34445 kgCO2eq = 344.45 gCO2eq.
      // So reductionGrams = amountManWon * 344.45 gCO2eq.
      const reductionGrams = amountManWon * 344.45;

      // Deduct previous amount first if editing/re-submitting
      if (localFoodState.submitted && typeof sessionStats !== 'undefined') {
        sessionStats.totalReducedCarbonGrams = Math.max(0, sessionStats.totalReducedCarbonGrams - localFoodState.reductionGrams);
      } else if (typeof sessionStats !== 'undefined') {
        sessionStats.totalActions += 1;
      }

      localFoodState.submitted = true;
      localFoodState.username = username;
      localFoodState.store = storeVal;
      localFoodState.amount = amountVal;
      localFoodState.reductionGrams = reductionGrams;
      
      if (username && typeof sessionStats !== 'undefined') sessionStats.username = username;

      // Update Card 01 Badge
      const label = document.getElementById('badge-local-food-label');
      const val = document.getElementById('badge-local-food-value');
      const iconContainer = document.getElementById('badge-local-food-icon-container');
      const icon = document.getElementById('badge-local-food-icon');

      if (label && val) {
        label.textContent = '로컬푸드 구매';
        val.textContent = `${storeVal} (${(localFoodState.reductionGrams / 1000).toFixed(2)}kg 감축)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-emerald-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-655');
        iconContainer.classList.add('bg-emerald-600', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
      }

      // Add to session statistics to update the cumulative dashboard
      if (typeof sessionStats !== 'undefined') {
        sessionStats.totalReducedCarbonGrams += localFoodState.reductionGrams;
      }

      closeLocalFoodModal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('로컬푸드 구매에 따른 탄소감축 실천이 등록되었습니다.');
    }

    function cancelLocalFoodSubmit() {
      // Deduct from session statistics if it was already submitted
      if (localFoodState.submitted && typeof sessionStats !== 'undefined') {
        sessionStats.totalReducedCarbonGrams = Math.max(0, sessionStats.totalReducedCarbonGrams - localFoodState.reductionGrams);
        sessionStats.totalActions = Math.max(0, sessionStats.totalActions - 1);
      }

      localFoodState.submitted = false;
      localFoodState.username = '';
      localFoodState.store = '';
      localFoodState.amount = 0;
      localFoodState.reductionGrams = 0;

      const userEl = document.getElementById('local-food-username');
      const storeEl = document.getElementById('local-food-store');
      const amountEl = document.getElementById('local-food-amount');
      if (userEl) userEl.value = '';
      if (storeEl) storeEl.value = '';
      if (amountEl) amountEl.value = '';

      const label = document.getElementById('badge-local-food-label');
      const val = document.getElementById('badge-local-food-value');
      const iconContainer = document.getElementById('badge-local-food-icon-container');
      const icon = document.getElementById('badge-local-food-icon');

      if (label && val) {
        label.textContent = '협력 모델';
        val.textContent = '소상공인 연계';
        val.classList.remove('text-emerald-600');
        val.classList.add('text-slate-800');
      }
      if (iconContainer && icon) {
        iconContainer.classList.add('bg-blue-50', 'text-blue-655');
        iconContainer.classList.remove('bg-emerald-600', 'text-white');
        icon.setAttribute('data-lucide', 'store');
        try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
      }

      calculateLocalFood();
      closeLocalFoodModal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('로컬푸드 실천 등록이 취소되었습니다.');
    }

    window.openLocalFoodModal = openLocalFoodModal;
    window.closeLocalFoodModal = closeLocalFoodModal;
    window.calculateLocalFood = calculateLocalFood;
    window.submitLocalFood = submitLocalFood;
    window.cancelLocalFoodSubmit = cancelLocalFoodSubmit;



    // 배리어프리 행사 가이드라인 실천 상태 변수 및 모달 처리
    let barrierFreeState = {
      submitted: false,
      checkedItems: []
    };

    function openBarrierFreeModal() {
      const modal = document.getElementById('barrierFreeModal');
      if (!modal) return;
      
      const items = ['ramp', 'desk', 'facility', 'sign', 'easy', 'braille', 'helper'];
      items.forEach(item => {
        const el = document.getElementById(`bf-${item}`);
        if (el) el.checked = (barrierFreeState.checkedItems || []).includes(item);
      });
      
      if (document.getElementById('bf-sign-hours')) document.getElementById('bf-sign-hours').value = barrierFreeState.signHours || 0;
      if (document.getElementById('bf-participants-count')) document.getElementById('bf-participants-count').value = barrierFreeState.participantsCount || 0;
      if (document.getElementById('barrier-free-username')) document.getElementById('barrier-free-username').value = sessionStats.username || '';
      
      updateBarrierFreeUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.querySelector('div')) modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeBarrierFreeModal() {
      const modal = document.getElementById('barrierFreeModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      if (modal.querySelector('div')) modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function updateBarrierFreeUI() {
      const items = ['ramp', 'desk', 'facility', 'sign', 'easy', 'braille', 'helper'];
      let checkedCount = 0;
      items.forEach(item => {
        const el = document.getElementById(`bf-${item}`);
        if (el && el.checked) checkedCount++;
      });

      const signHours = parseInt(document.getElementById('bf-sign-hours')?.value || 0);
      const participantsCount = parseInt(document.getElementById('bf-participants-count')?.value || 0);

      const scoreRate = ((checkedCount / 7) * 100).toFixed(1);
      
      const rateEl = document.getElementById('bf-score-rate');
      if (rateEl) rateEl.textContent = `${scoreRate}%`;

      const barEl = document.getElementById('bf-score-bar');
      if (barEl) barEl.style.width = `${scoreRate}%`;

      const countEl = document.getElementById('bf-checked-count');
      if (countEl) countEl.textContent = checkedCount;

      const badgeEl = document.getElementById('bf-certified-badge');
      if (badgeEl) {
        if (parseFloat(scoreRate) >= 100.0) {
          badgeEl.textContent = 'ISO 20121 CERTIFIED';
          badgeEl.className = 'text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm';
        } else if (parseFloat(scoreRate) >= 50.0) {
          badgeEl.textContent = '우수 달성';
          badgeEl.className = 'text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/80 text-white shadow-sm';
        } else {
          badgeEl.textContent = '미달성';
          badgeEl.className = 'text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400';
        }
      }

      const summaryEl = document.getElementById('bf-social-summary');
      if (summaryEl) {
        summaryEl.textContent = `수어 ${signHours}시간 | 배려참가자 ${participantsCount}명`;
      }

      const btn = document.getElementById('btn-submit-barrier-free');
      if (btn) {
        if (checkedCount > 0 || signHours > 0 || participantsCount > 0) {
          btn.disabled = false;
          btn.className = "bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98";
        } else {
          btn.disabled = true;
          btn.className = "bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98";
        }
      }
    }

    function submitBarrierFree() {
      const usernameInput = document.getElementById('barrier-free-username')?.value.trim();
      const username = usernameInput || sessionStats.username || '익명 참여자';
      if (usernameInput) {
        sessionStats.username = usernameInput;
      }
      
      const items = ['ramp', 'desk', 'facility', 'sign', 'easy', 'braille', 'helper'];
      const checkedItems = items.filter(item => document.getElementById(`bf-${item}`)?.checked);
      const signHours = parseInt(document.getElementById('bf-sign-hours')?.value || 0);
      const participantsCount = parseInt(document.getElementById('bf-participants-count')?.value || 0);
      
      barrierFreeState.checkedItems = checkedItems;
      barrierFreeState.signHours = signHours;
      barrierFreeState.participantsCount = participantsCount;
      barrierFreeState.submitted = true;

      const scoreRate = ((checkedItems.length / 7) * 100).toFixed(1);

      // Update badge on Card 02
      const label = document.getElementById('badge-barrier-free-label');
      const val = document.getElementById('badge-barrier-free-value');
      const iconContainer = document.getElementById('badge-barrier-free-icon-container');
      const icon = document.getElementById('badge-barrier-free-icon');

      if (label && val) {
        label.textContent = '포용 지수 수치화';
        val.textContent = `달성률 ${scoreRate}% (${checkedItems.length}건)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-650');
        iconContainer.classList.add('bg-blue-600', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      sendParticipation(username, (data) => {
        showToast('참여 완료! 무장애 & 포용적 행사 지수가 성공적으로 측정·반영되었습니다.');
      }, closeBarrierFreeModal);
    }

    window.openBarrierFreeModal = openBarrierFreeModal;
    window.closeBarrierFreeModal = closeBarrierFreeModal;
    window.updateBarrierFreeUI = updateBarrierFreeUI;
    window.submitBarrierFree = submitBarrierFree;



    // Safety & Fair Labor Protocol Functions (GRI 403 / GRI 401)
    let safetyLaborState = {
      checkedItems: [],
      guardsCount: 0,
      staffCount: 0,
      submitted: false
    };

    function openSafetyLaborModal() {
      const modal = document.getElementById('safetyLaborModal');
      if (!modal) return;
      
      const items = ['crowd', 'medical', 'plan', 'contract', 'rest', 'training'];
      items.forEach(item => {
        const el = document.getElementById(`sl-${item}`);
        if (el) el.checked = (safetyLaborState.checkedItems || []).includes(item);
      });
      
      if (document.getElementById('sl-guards-count')) document.getElementById('sl-guards-count').value = safetyLaborState.guardsCount || 0;
      if (document.getElementById('sl-staff-count')) document.getElementById('sl-staff-count').value = safetyLaborState.staffCount || 0;
      if (document.getElementById('safety-labor-username')) document.getElementById('safety-labor-username').value = sessionStats.username || '';
      
      updateSafetyLaborUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.querySelector('div')) modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeSafetyLaborModal() {
      const modal = document.getElementById('safetyLaborModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      if (modal.querySelector('div')) modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function updateSafetyLaborUI() {
      const items = ['crowd', 'medical', 'plan', 'contract', 'rest', 'training'];
      let checkedCount = 0;
      items.forEach(item => {
        const el = document.getElementById(`sl-${item}`);
        if (el && el.checked) checkedCount++;
      });

      const guardsCount = parseInt(document.getElementById('sl-guards-count')?.value || 0);
      const staffCount = parseInt(document.getElementById('sl-staff-count')?.value || 0);

      const scoreRate = ((checkedCount / 6) * 100).toFixed(1);
      
      const rateEl = document.getElementById('sl-score-rate');
      if (rateEl) rateEl.textContent = `${scoreRate}%`;

      const barEl = document.getElementById('sl-score-bar');
      if (barEl) barEl.style.width = `${scoreRate}%`;

      const countEl = document.getElementById('sl-checked-count');
      if (countEl) countEl.textContent = checkedCount;

      const badgeEl = document.getElementById('sl-certified-badge');
      if (badgeEl) {
        if (parseFloat(scoreRate) >= 100.0) {
          badgeEl.textContent = 'SAFETY & FAIR LABOR CERTIFIED';
          badgeEl.className = 'text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm';
        } else if (parseFloat(scoreRate) >= 50.0) {
          badgeEl.textContent = '우수 준수';
          badgeEl.className = 'text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/80 text-white shadow-sm';
        } else {
          badgeEl.textContent = '미달성';
          badgeEl.className = 'text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400';
        }
      }

      const summaryEl = document.getElementById('sl-summary');
      if (summaryEl) {
        summaryEl.textContent = `안전 요원 ${guardsCount}명 | 스태프 ${staffCount}명`;
      }

      const btn = document.getElementById('btn-submit-safety-labor');
      if (btn) {
        if (checkedCount > 0 || guardsCount > 0 || staffCount > 0) {
          btn.disabled = false;
          btn.className = "bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98";
        } else {
          btn.disabled = true;
          btn.className = "bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98";
        }
      }
    }

    function submitSafetyLabor() {
      const usernameInput = document.getElementById('safety-labor-username')?.value.trim();
      const username = usernameInput || sessionStats.username || '익명 참여자';
      if (usernameInput) {
        sessionStats.username = usernameInput;
      }
      
      const items = ['crowd', 'medical', 'plan', 'contract', 'rest', 'training'];
      const checkedItems = items.filter(item => document.getElementById(`sl-${item}`)?.checked);
      const guardsCount = parseInt(document.getElementById('sl-guards-count')?.value || 0);
      const staffCount = parseInt(document.getElementById('sl-staff-count')?.value || 0);
      
      safetyLaborState.checkedItems = checkedItems;
      safetyLaborState.guardsCount = guardsCount;
      safetyLaborState.staffCount = staffCount;
      safetyLaborState.submitted = true;

      const scoreRate = ((checkedItems.length / 6) * 100).toFixed(1);

      // Update badge on Card 06
      const label = document.getElementById('badge-safety-labor-label');
      const val = document.getElementById('badge-safety-labor-value');
      const iconContainer = document.getElementById('badge-safety-labor-icon-container');
      const icon = document.getElementById('badge-safety-labor-icon');

      if (label && val) {
        label.textContent = '안전·노동 표준';
        val.textContent = `준수율 ${scoreRate}% (${checkedItems.length}건)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-600');
        iconContainer.classList.add('bg-blue-600', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      sendParticipation(username, (data) => {
        showToast('참여 완료! 행사 안전 & 공정노동 준수 내역이 성공적으로 반영되었습니다.');
      }, closeSafetyLaborModal);
    }

    window.openSafetyLaborModal = openSafetyLaborModal;
    window.closeSafetyLaborModal = closeSafetyLaborModal;
    window.updateSafetyLaborUI = updateSafetyLaborUI;
    window.submitSafetyLabor = submitSafetyLabor;



    // ==========================================
    // 1. LOCAL ECONOMY MODAL JS
    // ==========================================
    let localEconomyState = {
      submitted: false,
      amount: '',
      details: '',
      username: ''
    };

    function openLocalEconomyModal() {
      const modal = document.getElementById('localEconomyModal');
      document.getElementById('local-economy-username').value = localEconomyState.username || sessionStats.username || '';
      document.getElementById('local-economy-amount').value = localEconomyState.submitted ? localEconomyState.amount : '';
      document.getElementById('local-economy-details').value = localEconomyState.details || '';

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeLocalEconomyModal() {
      const modal = document.getElementById('localEconomyModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function submitLocalEconomy() {
      const username = document.getElementById('local-economy-username').value.trim();
      const amountVal = parseFloat(document.getElementById('local-economy-amount').value || '0');
      const detailsVal = document.getElementById('local-economy-details').value.trim();

      if (isNaN(amountVal) || amountVal < 0) {
        showToast('올바른 경제적 가치 금액을 입력해 주세요.', true);
        return;
      }

      localEconomyState = {
        submitted: true,
        amount: amountVal,
        details: detailsVal,
        username: username
      };
      if (username) sessionStats.username = username;

      // Update badge on Card 03
      const label = document.getElementById('badge-local-economy-label');
      const val = document.getElementById('badge-local-economy-value');
      const iconContainer = document.getElementById('badge-local-economy-icon-container');
      const icon = document.getElementById('badge-local-economy-icon');

      if (label && val) {
        label.textContent = '경제 효과 기입';
        val.textContent = `${amountVal.toLocaleString()}만 원+ (실천 등록)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-650');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeLocalEconomyModal();
      updateDashboardUI(sessionStats);
      showToast(`지역경제 기여 실적(${amountVal.toLocaleString()}만 원)이 정상적으로 등록되었습니다.`);
    }

    // ==========================================
    // 2. INCLUSION PROGRAM MODAL JS
    // ==========================================
    let inclusionState = {
      submitted: false,
      username: '',
      programs: [
        { name: '', participants: '' }
      ]
    };

    function openInclusionModal() {
      const modal = document.getElementById('inclusionModal');
      document.getElementById('inclusion-username').value = inclusionState.username || sessionStats.username || '';
      
      if (!inclusionState.submitted && (inclusionState.programs.length === 0 || (inclusionState.programs.length === 1 && !inclusionState.programs[0].name))) {
        inclusionState.programs = [{ name: '', participants: '' }];
      }

      renderInclusionProgramRows();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeInclusionModal() {
      const modal = document.getElementById('inclusionModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function renderInclusionProgramRows() {
      const container = document.getElementById('inclusion-program-list');
      container.innerHTML = '';

      if (inclusionState.programs.length === 0) {
        inclusionState.programs.push({ name: '', participants: '' });
      }

      inclusionState.programs.forEach((prog, index) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80';
        const pVal = (prog.participants !== '' && prog.participants !== undefined && prog.participants !== null) ? prog.participants : '';
        row.innerHTML = `
          <div class="flex-grow space-y-1">
            <input type="text" value="${prog.name || ''}" placeholder="프로그램명 (예: 지역 아동 환경 보존 아카데미)" 
                   oninput="inclusionState.programs[${index}].name = this.value"
                   class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium">
          </div>
          <div class="w-28 space-y-1">
            <div class="relative">
              <input type="number" value="${pVal}" min="0" placeholder="참가자수" 
                     oninput="inclusionState.programs[${index}].participants = this.value ? parseInt(this.value) : ''"
                     class="w-full text-xs font-bold text-slate-800 px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 pr-6">
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">명</span>
            </div>
          </div>
          <button type="button" onclick="removeInclusionProgramRow(${index})" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        `;
        container.appendChild(row);
      });
      lucide.createIcons();
    }

    function addInclusionProgramRow() {
      inclusionState.programs.push({ name: '', participants: '' });
      renderInclusionProgramRows();
    }

    function removeInclusionProgramRow(index) {
      if (inclusionState.programs.length > 1) {
        inclusionState.programs.splice(index, 1);
        renderInclusionProgramRows();
      } else {
        showToast('최소 1개 이상의 포용 프로그램이 필요합니다.', true);
      }
    }

    function submitInclusionPrograms() {
      const username = document.getElementById('inclusion-username').value.trim();
      if (username) sessionStats.username = username;

      let totalParticipants = 0;
      let validPrograms = 0;

      inclusionState.programs.forEach(p => {
        if (p.name.trim() !== '') {
          validPrograms++;
          totalParticipants += (parseInt(p.participants) || 0);
        }
      });

      if (validPrograms === 0) {
        showToast('최소 하나의 프로그램 이름을 입력해 주세요.', true);
        return;
      }

      inclusionState.submitted = true;

      // Update Card 04 Badge
      const label = document.getElementById('badge-inclusion-label');
      const val = document.getElementById('badge-inclusion-value');
      const iconContainer = document.getElementById('badge-inclusion-icon-container');
      const icon = document.getElementById('badge-inclusion-icon');

      if (label && val) {
        label.textContent = `참여자 (${validPrograms}개 활동)`;
        val.textContent = `${totalParticipants.toLocaleString()}명+ (실천 등록)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-650');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeInclusionModal();
      updateDashboardUI(sessionStats);
      showToast(`포용 프로그램 ${validPrograms}건 (총 ${totalParticipants.toLocaleString()}명) 등록이 완료되었습니다.`);
    }

    // ==========================================
    // 3. ESG EDUCATION MODAL JS
    // ==========================================
    let esgEduState = {
      submitted: false,
      username: '',
      programs: [
        { name: '', participants: '' }
      ]
    };

    function openEsgEducationModal() {
      const modal = document.getElementById('esgEducationModal');
      document.getElementById('esg-edu-username').value = esgEduState.username || sessionStats.username || '';
      
      if (!esgEduState.submitted && (esgEduState.programs.length === 0 || (esgEduState.programs.length === 1 && !esgEduState.programs[0].name))) {
        esgEduState.programs = [{ name: '', participants: '' }];
      }

      renderEsgEduProgramRows();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeEsgEducationModal() {
      const modal = document.getElementById('esgEducationModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function renderEsgEduProgramRows() {
      const container = document.getElementById('esg-edu-program-list');
      container.innerHTML = '';

      if (esgEduState.programs.length === 0) {
        esgEduState.programs.push({ name: '', participants: '' });
      }

      esgEduState.programs.forEach((prog, index) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80';
        const pVal = (prog.participants !== '' && prog.participants !== undefined && prog.participants !== null) ? prog.participants : '';
        row.innerHTML = `
          <div class="flex-grow space-y-1">
            <input type="text" value="${prog.name || ''}" placeholder="교육 프로그램명 (예: 글로벌 비즈니스 멘토링)" 
                   oninput="esgEduState.programs[${index}].name = this.value"
                   class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium">
          </div>
          <div class="w-28 space-y-1">
            <div class="relative">
              <input type="number" value="${pVal}" min="0" placeholder="참가자수" 
                     oninput="esgEduState.programs[${index}].participants = this.value ? parseInt(this.value) : ''"
                     class="w-full text-xs font-bold text-slate-800 px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 pr-6">
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">명</span>
            </div>
          </div>
          <button type="button" onclick="removeEsgEduProgramRow(${index})" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        `;
        container.appendChild(row);
      });
      lucide.createIcons();
    }

    function addEsgEduProgramRow() {
      esgEduState.programs.push({ name: '', participants: '' });
      renderEsgEduProgramRows();
    }

    function removeEsgEduProgramRow(index) {
      if (esgEduState.programs.length > 1) {
        esgEduState.programs.splice(index, 1);
        renderEsgEduProgramRows();
      } else {
        showToast('최소 1개 이상의 ESG 교육 프로그램이 필요합니다.', true);
      }
    }

    function submitEsgEducation() {
      const username = document.getElementById('esg-edu-username').value.trim();
      if (username) sessionStats.username = username;

      let totalParticipants = 0;
      let validPrograms = 0;

      esgEduState.programs.forEach(p => {
        if (p.name.trim() !== '') {
          validPrograms++;
          totalParticipants += (parseInt(p.participants) || 0);
        }
      });

      if (validPrograms === 0) {
        showToast('최소 하나의 교육 프로그램 이름을 입력해 주세요.', true);
        return;
      }

      esgEduState.submitted = true;

      // Update Card 05 Badge
      const label = document.getElementById('badge-esg-edu-label');
      const val = document.getElementById('badge-esg-edu-value');
      const iconContainer = document.getElementById('badge-esg-edu-icon-container');
      const icon = document.getElementById('badge-esg-edu-icon');

      if (label && val) {
        label.textContent = `교육 프로그램`;
        val.textContent = `${validPrograms}회 세션 (${totalParticipants.toLocaleString()}명)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-655');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeEsgEducationModal();
      updateDashboardUI(sessionStats);
      showToast(`ESG 교육·체험 프로그램 ${validPrograms}회 (${totalParticipants.toLocaleString()}명 참가) 등록이 완료되었습니다.`);
    }

    // ==========================================
    // 4. SUPPORTERS FILE UPLOAD MODAL JS
    // ==========================================
    let supportersState = {
      submitted: false,
      username: '',
      role: '',
      fileName: '',
      fileType: '', // 'image' or 'pdf'
      previewUrl: null
    };

    function openSupportersModal() {
      const modal = document.getElementById('supportersModal');
      document.getElementById('supporters-username').value = supportersState.username || sessionStats.username || '';
      document.getElementById('supporters-role').value = supportersState.role || '';
      
      updateSupportersFileUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeSupportersModal() {
      const modal = document.getElementById('supportersModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function handleSupportersFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
          showToast('이미지(JPG, PNG, WEBP) 또는 PDF 파일만 업로드 가능합니다.', true);
          event.target.value = '';
          return;
        }

        supportersState.fileName = file.name;
        supportersState.fileType = isImage ? 'image' : 'pdf';
        
        if (isImage) {
          const reader = new FileReader();
          reader.onload = function(e) {
            supportersState.previewUrl = e.target.result;
            updateSupportersFileUI();
          };
          reader.readAsDataURL(file);
        } else {
          supportersState.previewUrl = null;
          updateSupportersFileUI();
        }
      }
    }

    function updateSupportersFileUI() {
      const btn = document.getElementById('btn-submit-supporters');
      const container = document.getElementById('supporters-preview-container');

      if (supportersState.fileName) {
        btn.disabled = false;
        btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
        btn.classList.add('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');

        if (supportersState.fileType === 'image' && supportersState.previewUrl) {
          container.innerHTML = `
            <img src="${supportersState.previewUrl}" class="w-16 h-16 object-cover rounded-xl border border-slate-200 mb-1">
            <p class="text-[11px] text-blue-600 font-bold mb-0.5">${supportersState.fileName}</p>
            <p class="text-[9px] text-slate-400">클릭하여 변경</p>
          `;
        } else {
          container.innerHTML = `
            <i data-lucide="file-check-2" class="w-7 h-7 text-blue-600 mb-1"></i>
            <p class="text-[11px] text-blue-600 font-bold mb-0.5">${supportersState.fileName}</p>
            <p class="text-[9px] text-slate-400">PDF 첨부 완료 (클릭하여 변경)</p>
          `;
        }
      } else {
        btn.disabled = true;
        btn.classList.remove('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
        btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
        container.innerHTML = `
          <i data-lucide="upload-cloud" id="supporters-upload-icon" class="w-7 h-7 text-slate-400 mb-1"></i>
          <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="supporters-filename">클릭하여 사진 또는 PDF 첨부</p>
          <p class="text-[9px] text-slate-400">이미지(JPG, PNG, WEBP) 및 PDF 가능 (최대 15MB)</p>
        `;
      }
      lucide.createIcons();
    }

    function submitSupporters() {
      const username = document.getElementById('supporters-username').value.trim();
      const roleVal = document.getElementById('supporters-role').value.trim();

      if (!supportersState.fileName) {
        showToast('첨부할 사진 또는 PDF 파일을 선택해 주세요.', true);
        return;
      }

      supportersState.submitted = true;
      supportersState.username = username;
      supportersState.role = roleVal;
      if (username) sessionStats.username = username;

      // Update Card 06 Badge
      const label = document.getElementById('badge-supporters-label');
      const val = document.getElementById('badge-supporters-value');
      const iconContainer = document.getElementById('badge-supporters-icon-container');
      const icon = document.getElementById('badge-supporters-icon');

      if (label && val) {
        label.textContent = '서포터즈 제출';
        val.textContent = `제출 완료 (${supportersState.fileType.toUpperCase()})`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-655');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeSupportersModal();
      updateDashboardUI(sessionStats);
      showToast('서포터즈 활동 첨부파일이 성공적으로 제출되었습니다.');
    }

    // ==========================================
    // 5. DONATION MODAL JS (기부 챌린지 · 판매 기부)
    // ==========================================
    let donationState = {
      submitted: false,
      amount: '',
      target: '',
      details: '',
      username: ''
    };

    function openDonationModal() {
      const modal = document.getElementById('donationModal');
      document.getElementById('donation-username').value = donationState.username || sessionStats.username || '';
      document.getElementById('donation-amount').value = donationState.submitted ? donationState.amount : '';
      document.getElementById('donation-target').value = donationState.target || '';
      document.getElementById('donation-details').value = donationState.details || '';

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeDonationModal() {
      const modal = document.getElementById('donationModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function submitDonation() {
      const username = document.getElementById('donation-username').value.trim();
      const amountVal = parseFloat(document.getElementById('donation-amount').value || '0');
      const targetVal = document.getElementById('donation-target').value.trim();
      const detailsVal = document.getElementById('donation-details').value.trim();

      if (isNaN(amountVal) || amountVal < 0) {
        showToast('올바른 기부 및 판매 금액을 입력해 주세요.', true);
        return;
      }

      donationState = {
        submitted: true,
        amount: amountVal,
        target: targetVal,
        details: detailsVal,
        username: username
      };
      if (username) sessionStats.username = username;

      // Update Card 07 Badge
      const label = document.getElementById('badge-donation-label');
      const val = document.getElementById('badge-donation-value');
      const iconContainer = document.getElementById('badge-donation-icon-container');
      const icon = document.getElementById('badge-donation-icon');

      if (label && val) {
        label.textContent = '기부·판매 실적';
        val.textContent = `${amountVal.toLocaleString()}만 원+ (실천 등록)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-655');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeDonationModal();
      updateDashboardUI(sessionStats);
      showToast(`기부 챌린지 실적(${amountVal.toLocaleString()}만 원)이 성공적으로 등록되었습니다.`);
    }

    // ==========================================
    // 6. KNOWLEDGE SHARING MODAL JS (지식 나눔 강연)
    // ==========================================
    let knowledgeState = {
      submitted: false,
      username: '',
      programs: [
        { name: '', speaker: '', participants: '' }
      ]
    };

    function openKnowledgeSharingModal() {
      const modal = document.getElementById('knowledgeSharingModal');
      document.getElementById('knowledge-username').value = knowledgeState.username || sessionStats.username || '';
      
      if (!knowledgeState.submitted && (knowledgeState.programs.length === 0 || (knowledgeState.programs.length === 1 && !knowledgeState.programs[0].name))) {
        knowledgeState.programs = [{ name: '', speaker: '', participants: '' }];
      }

      renderKnowledgeProgramRows();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeKnowledgeSharingModal() {
      const modal = document.getElementById('knowledgeSharingModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function renderKnowledgeProgramRows() {
      const container = document.getElementById('knowledge-program-list');
      container.innerHTML = '';

      if (knowledgeState.programs.length === 0) {
        knowledgeState.programs.push({ name: '', speaker: '', participants: '' });
      }

      knowledgeState.programs.forEach((prog, index) => {
        const row = document.createElement('div');
        row.className = 'flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80';
        const pVal = (prog.participants !== '' && prog.participants !== undefined && prog.participants !== null) ? prog.participants : '';
        row.innerHTML = `
          <div class="flex-grow space-y-1 w-full sm:w-auto">
            <input type="text" value="${prog.name || ''}" placeholder="강연 제목 (예: 청년 스타트업 ESG 특강)" 
                   oninput="knowledgeState.programs[${index}].name = this.value"
                   class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium">
          </div>
          <div class="w-full sm:w-32 space-y-1">
            <input type="text" value="${prog.speaker || ''}" placeholder="연사명 (예: 김OO 대표)" 
                   oninput="knowledgeState.programs[${index}].speaker = this.value"
                   class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium">
          </div>
          <div class="w-full sm:w-24 space-y-1 flex items-center gap-1">
            <div class="relative w-full">
              <input type="number" value="${pVal}" min="0" placeholder="수강인원" 
                     oninput="knowledgeState.programs[${index}].participants = this.value ? parseInt(this.value) : ''"
                     class="w-full text-xs font-bold text-slate-800 px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 pr-5">
              <span class="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">명</span>
            </div>
            <button type="button" onclick="removeKnowledgeRow(${index})" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
        container.appendChild(row);
      });
      lucide.createIcons();
    }


  // Export states to window
  window.localFoodState = localFoodState;
  window.barrierFreeState = barrierFreeState;
  window.safetyLaborState = safetyLaborState;
  window.localEconomyState = localEconomyState;
  window.inclusionState = inclusionState;
  window.esgEduState = esgEduState;
  window.supportersState = supportersState;
  window.donationState = donationState;
  window.knowledgeState = knowledgeState;

  // Auto-exported modal functions to window
  window.openLocalEconomyModal = openLocalEconomyModal;
  window.closeLocalEconomyModal = closeLocalEconomyModal;
  window.submitLocalEconomy = submitLocalEconomy;
  window.openInclusionModal = openInclusionModal;
  window.closeInclusionModal = closeInclusionModal;
  window.renderInclusionProgramRows = renderInclusionProgramRows;
  window.addInclusionProgramRow = addInclusionProgramRow;
  window.removeInclusionProgramRow = removeInclusionProgramRow;
  window.submitInclusionPrograms = submitInclusionPrograms;
  window.openEsgEducationModal = openEsgEducationModal;
  window.closeEsgEducationModal = closeEsgEducationModal;
  window.renderEsgEduProgramRows = renderEsgEduProgramRows;
  window.addEsgEduProgramRow = addEsgEduProgramRow;
  window.removeEsgEduProgramRow = removeEsgEduProgramRow;
  window.submitEsgEducation = submitEsgEducation;
  window.openSupportersModal = openSupportersModal;
  window.closeSupportersModal = closeSupportersModal;
  window.handleSupportersFileChange = handleSupportersFileChange;
  window.updateSupportersFileUI = updateSupportersFileUI;
  window.submitSupporters = submitSupporters;
  window.openDonationModal = openDonationModal;
  window.closeDonationModal = closeDonationModal;
  window.submitDonation = submitDonation;
  window.openKnowledgeSharingModal = openKnowledgeSharingModal;
  window.closeKnowledgeSharingModal = closeKnowledgeSharingModal;
  window.renderKnowledgeProgramRows = renderKnowledgeProgramRows;
})();
