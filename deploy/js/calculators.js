// Calculators, Submit & Cancel Event Handlers
    function cancelEsgReportSubmit() {
      esgReportState.submitted = false;
      esgReportState.username = '';
      esgReportState.title = '';
      esgReportState.fileName = '';
      
      const userEl = document.getElementById('esg-report-username');
      const titleEl = document.getElementById('esg-report-title');
      const uploadInput = document.getElementById('esg-report-file-upload');
      if (userEl) userEl.value = '';
      if (titleEl) titleEl.value = '';
      if (uploadInput) uploadInput.value = '';

      const label = document.getElementById('badge-esg-report-label');
      const val = document.getElementById('badge-esg-report-value');
      const iconContainer = document.getElementById('badge-esg-report-icon-container');
      const icon = document.getElementById('badge-esg-report-icon');

      if (label && val) {
        label.textContent = '공시 주기';
        val.textContent = '연 1회 보고서 발간';
        val.classList.remove('text-indigo-600');
        val.classList.add('text-slate-800');
      }
      if (iconContainer && icon) {
        iconContainer.classList.add('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.remove('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'file-text');
        try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
      }

      updateEsgReportFileUI();
      closeEsgReportModal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('성과 보고서 등록이 취소되었습니다.');
    }

    function submitEsgReport() {
      const username = document.getElementById('esg-report-username').value.trim();
      const titleVal = document.getElementById('esg-report-title').value.trim();

      if (!esgReportState.fileName) {
        showToast('첨부할 ESG 성과 보고서(PDF)를 선택해 주세요.', true);
        return;
      }

      esgReportState.submitted = true;
      esgReportState.username = username;
      esgReportState.title = titleVal;
      if (username && typeof sessionStats !== 'undefined') sessionStats.username = username;

      // Update Card 01 Badge
      const label = document.getElementById('badge-esg-report-label');
      const val = document.getElementById('badge-esg-report-value');
      const iconContainer = document.getElementById('badge-esg-report-icon-container');
      const icon = document.getElementById('badge-esg-report-icon');

      if (label && val) {
        label.textContent = '보고서 제출';
        val.textContent = `PDF 등록 완료 (${esgReportState.fileName})`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-indigo-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
      }

      closeEsgReportModal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('ESG 성과 보고서 PDF 파일이 성공적으로 등록되었습니다.');
    }

    window.openEsgReportModal = openEsgReportModal;
    window.closeEsgReportModal = closeEsgReportModal;
    window.handleEsgReportFileChange = handleEsgReportFileChange;
    window.submitEsgReport = submitEsgReport;
    window.cancelEsgReportSubmit = cancelEsgReportSubmit;

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

    // ==========================================
    // ISO 20121 MODAL JS (ISO 20121 인증서 파일 첨부)
    // ==========================================
    let iso20121State = {
      submitted: false,
      username: '',
      certOrg: '',
      fileName: '',
      fileType: '', // 'image' or 'pdf'
      previewUrl: null
    };

    function cancelIso20121Submit() {
      iso20121State.submitted = false;
      iso20121State.username = '';
      iso20121State.certOrg = '';
      iso20121State.fileName = '';
      iso20121State.fileType = '';
      iso20121State.previewUrl = null;

      const userEl = document.getElementById('iso20121-username');
      const certEl = document.getElementById('iso20121-cert-org');
      const uploadInput = document.getElementById('iso20121-file-upload');
      if (userEl) userEl.value = '';
      if (certEl) certEl.value = '';
      if (uploadInput) uploadInput.value = '';

      const label = document.getElementById('badge-iso20121-label');
      const val = document.getElementById('badge-iso20121-value');
      const iconContainer = document.getElementById('badge-iso20121-icon-container');
      const icon = document.getElementById('badge-iso20121-icon');

      if (label && val) {
        label.textContent = '인증 절차';
        val.textContent = 'ISO 20121 진행 중';
        val.classList.remove('text-indigo-600');
        val.classList.add('text-slate-800');
      }
      if (iconContainer && icon) {
        iconContainer.classList.add('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.remove('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'shield-check');
        try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
      }

      updateIso20121FileUI();
      closeIso20121Modal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('ISO 20121 인증서 제출이 취소되었습니다.');
    }

    function submitIso20121() {
      const username = document.getElementById('iso20121-username').value.trim();
      const certOrgVal = document.getElementById('iso20121-cert-org').value.trim();

      if (!iso20121State.fileName) {
        showToast('첨부할 ISO 20121 인증서 파일(PDF 또는 이미지)을 선택해 주세요.', true);
        return;
      }

      iso20121State.submitted = true;
      iso20121State.username = username;
      iso20121State.certOrg = certOrgVal;
      if (username && typeof sessionStats !== 'undefined') sessionStats.username = username;

      // Update Section 03 Card 03 Badge
      const label = document.getElementById('badge-iso20121-label');
      const val = document.getElementById('badge-iso20121-value');
      const iconContainer = document.getElementById('badge-iso20121-icon-container');
      const icon = document.getElementById('badge-iso20121-icon');

      if (label && val) {
        label.textContent = '인증서 제출';
        val.textContent = `ISO 20121 인증 완료 (${iso20121State.fileType.toUpperCase()})`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-indigo-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
      }

      closeIso20121Modal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('ISO 20121 국제 인증서 파일이 성공적으로 제출되었습니다.');
    }

    window.openIso20121Modal = openIso20121Modal;
    window.closeIso20121Modal = closeIso20121Modal;
    window.handleIso20121FileChange = handleIso20121FileChange;
    window.submitIso20121 = submitIso20121;
    window.cancelIso20121Submit = cancelIso20121Submit;

    // ==========================================
    // ESG ADVISORY COMMITTEE MODAL JS (자문위원회 회의 장소, 일시, 사진 첨부)
    // ==========================================
    let advisoryState = {
      submitted: false,
      username: '',
      location: '',
      datetime: '',
      summary: '',
      fileName: '',
      previewUrl: null
    };

    function cancelAdvisorySubmit() {
      advisoryState.submitted = false;
      advisoryState.username = '';
      advisoryState.location = '';
      advisoryState.datetime = '';
      advisoryState.summary = '';
      advisoryState.fileName = '';
      advisoryState.previewUrl = null;

      const userEl = document.getElementById('advisory-username');
      const locEl = document.getElementById('advisory-location');
      const dtEl = document.getElementById('advisory-datetime');
      const sumEl = document.getElementById('advisory-summary');
      const uploadInput = document.getElementById('advisory-file-upload');
      if (userEl) userEl.value = '';
      if (locEl) locEl.value = '';
      if (dtEl) dtEl.value = '';
      if (sumEl) sumEl.value = '';
      if (uploadInput) uploadInput.value = '';

      const label = document.getElementById('badge-advisory-label');
      const val = document.getElementById('badge-advisory-value');
      const iconContainer = document.getElementById('badge-advisory-icon-container');
      const icon = document.getElementById('badge-advisory-icon');

      if (label && val) {
        label.textContent = '전문가 위원';
        val.textContent = '자문단 구성';
        val.classList.remove('text-indigo-600');
        val.classList.add('text-slate-800');
      }
      if (iconContainer && icon) {
        iconContainer.classList.add('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.remove('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'users-2');
        try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
      }

      updateAdvisoryFileUI();
      closeAdvisoryModal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('자문위원회 회의 기록 등록이 취소되었습니다.');
    }

    function submitAdvisory() {
      const locVal = document.getElementById('advisory-location').value.trim();
      const dtVal = document.getElementById('advisory-datetime').value.trim();
      const username = document.getElementById('advisory-username').value.trim();
      const summaryVal = document.getElementById('advisory-summary').value.trim();

      if (!locVal || !dtVal) {
        showToast('자문위원회 회의 장소와 일시를 모두 입력해 주세요.', true);
        return;
      }

      advisoryState.submitted = true;
      advisoryState.username = username;
      advisoryState.location = locVal;
      advisoryState.datetime = dtVal;
      advisoryState.summary = summaryVal;
      if (username && typeof sessionStats !== 'undefined') sessionStats.username = username;

      // Update Advisory Card Badge
      const label = document.getElementById('badge-advisory-label');
      const val = document.getElementById('badge-advisory-value');
      const iconContainer = document.getElementById('badge-advisory-icon-container');
      const icon = document.getElementById('badge-advisory-icon');

      if (label && val) {
        label.textContent = '회의 등록 완료';
        val.textContent = `${locVal} (${dtVal})`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-indigo-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        if (window.lucide) lucide.createIcons();
      }

      closeAdvisoryModal();
      if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
      showToast('ESG 자문위원회 회의 장소, 일시 및 사진이 성공적으로 등록되었습니다.');
    }

    window.openAdvisoryModal = openAdvisoryModal;
    window.closeAdvisoryModal = closeAdvisoryModal;
    window.handleAdvisoryFileChange = handleAdvisoryFileChange;
    window.checkAdvisorySubmitStatus = checkAdvisorySubmitStatus;
    window.submitAdvisory = submitAdvisory;
    window.cancelAdvisorySubmit = cancelAdvisorySubmit;

    // Modal Control Functions
    function submitBarrierFree() {
      const usernameInput = document.getElementById('barrier-free-username').value.trim();
      if (usernameInput) {
        sessionStats.username = usernameInput;
      }
      
      const items = ['ramp', 'desk', 'facility', 'sign', 'easy', 'braille', 'helper'];
      barrierFreeState.checkedItems = items.filter(item => document.getElementById(`bf-${item}`).checked);
      barrierFreeState.submitted = true;

      // Update badge on Card 02
      const label = document.getElementById('badge-barrier-free-label');
      const val = document.getElementById('badge-barrier-free-value');
      const iconContainer = document.getElementById('badge-barrier-free-icon-container');
      const icon = document.getElementById('badge-barrier-free-icon');

      if (label && val) {
        label.textContent = '실천 완료';
        val.textContent = `실천 완료 (${barrierFreeState.checkedItems.length}건)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-650');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeBarrierFreeModal();
      updateDashboardUI(sessionStats);
      showToast('배리어프리 가이드라인 실천 항목이 성공적으로 저장되었습니다.');
    }

    function submitVenueEcology() {
      const certs = ['gseed', 'leed', 'earthcheck', 'iso14001', 'iso20121', 'forest'];
      venueEcologyState.checkedCerts = certs.filter(c => document.getElementById(`cert-${c}`).checked);
      venueEcologyState.submitted = true;

      // Update badge on Card 06
      const label = document.getElementById('badge-venue-ecology-label');
      const val = document.getElementById('badge-venue-ecology-value');
      const iconContainer = document.getElementById('badge-venue-ecology-icon-container');
      const icon = document.getElementById('badge-venue-ecology-icon');

      if (label && val) {
        label.textContent = '인증 제출';
        val.textContent = `제출 완료 (${venueEcologyState.checkedCerts.length}건)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-emerald-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-emerald-50', 'text-emerald-600');
        iconContainer.classList.add('bg-[#0f4c3a]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeVenueEcologyModal();
      updateDashboardUI(sessionStats);
      showToast('인증서 파일 및 선택한 인증이 성공적으로 저장되었습니다.');
    }

    // Eco Simulator Modal Functions
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

