    // Global Constants
    const ECO_COEFFICIENTS = {
      cup: 52,
      plate: 37,
      bowl: 60,
      fork: 9
    };
    const TRANSPORT_COEFFICIENT = 120; // 120g CO2eq per passenger-km saved
    const ENERGY_COEFFICIENT = 478.1; // 478.1g CO2eq per 1 kWh saved

    // Session token for updating entries
    let sessionToken = localStorage.getItem('mice_session_token');
    if (!sessionToken) {
      sessionToken = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('mice_session_token', sessionToken);
    }

    // Preserve banner/upcycle input configurations
    let lastUpcycleCategory = 'keyring';
    let lastBannerN = 0;
    let lastBannerY = 0;

    // State Variables
    let currentEcoQuantities = {
      cup: 0,
      plate: 0,
      bowl: 0,
      fork: 0
    };
    let currentTransportQuantities = {
      distance: 0,
      people: 1
    };
    let currentEnergyQuantity = 0;
    let currentUpcycleQuantity = 0;
    let currentSignageQuantities = {
      paper_a4: 0,
      paper_brochure: 0,
      paper_poster: 0,
      views: 0,
      hours: 0,
      is_renewable: false
    };

    // Local Session Statistics State (resets on refresh)
    let sessionStats = {
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
        renewable_energy: 0,
        upcycled_keyring: 0,
        upcycled_banner: 0,
        paper_booth: 0,
        digital_signage: 0
      },
      keyringReducedCarbonGrams: 0,
      keyringParticipants: 0,
      paperBoothParticipants: 0
    };

    function recalculateSessionTotalCarbon() {
      let total = 0;
      const items = sessionStats.items;
      
      // Eco
      total += (items.reusable_cup || 0) * 52;
      total += (items.reusable_plate || 0) * 37;
      total += (items.reusable_bowl || 0) * 60;
      total += (items.reusable_fork || 0) * 9;
      
      // Transport
      total += (items.public_transport || 0) * 120;
      
      // Energy
      total += (items.renewable_energy || 0) * 478.1;
      
      // Upcycle keyring
      const keyrings = items.upcycled_keyring || 0;
      if (keyrings > 0) {
        total += keyrings * 16 - 50;
      }
      
      // Upcycle banner
      total += (items.upcycled_banner || 0) * 6280;
      
      // Paper booth
      total += (items.paper_booth || 0) * 10125;
      
      // Digital signage (stored directly in grams, so multiplier is 1)
      total += (items.digital_signage || 0) * 1;
      
      sessionStats.totalReducedCarbonGrams = Math.round(total);
 
      // Recalculate active actions count
      let actionsCount = 0;
      if ((items.reusable_cup || 0) > 0 || (items.reusable_plate || 0) > 0 || (items.reusable_bowl || 0) > 0 || (items.reusable_fork || 0) > 0) {
        actionsCount += 1;
      }
      if ((items.public_transport || 0) > 0) actionsCount += 1;
      if ((items.renewable_energy || 0) > 0) actionsCount += 1;
      if ((items.upcycled_keyring || 0) > 0) actionsCount += 1;
      if ((items.upcycled_banner || 0) > 0) actionsCount += 1;
      if ((items.paper_booth || 0) > 0) actionsCount += 1;
      if ((items.digital_signage || 0) > 0) actionsCount += 1;
      sessionStats.totalActions = actionsCount;
    }
    let sessionUsernames = new Set();
    let transportParticipantsCount = 0; // local counter for transport actions
 
    function sendParticipation(username, callback, modalCloseFn) {
      const actionsList = [];
      for (const [key, qty] of Object.entries(sessionStats.items)) {
        actionsList.push({
          action_id: key,
          quantity: qty
        });
      }
 
      const payload = {
        username: username,
        session_token: sessionToken,
        actions: actionsList
      };

      const handleSuccess = (data) => {
        sessionStats.username = username;
        sessionUsernames.add(username || '참여자');
        sessionStats.totalParticipants = sessionUsernames.size;
        
        recalculateSessionTotalCarbon();

        // Sync participant estimates
        sessionStats.keyringParticipants = ((sessionStats.items.upcycled_keyring || 0) > 0 || (sessionStats.items.upcycled_banner || 0) > 0) ? sessionUsernames.size : 0;
        sessionStats.paperBoothParticipants = ((sessionStats.items.paper_booth || 0) > 0) ? sessionUsernames.size : 0;
        sessionStats.signageParticipants = ((sessionStats.items.digital_signage || 0) > 0) ? sessionUsernames.size : 0;
        transportParticipantsCount = (sessionStats.items.public_transport || 0) > 0 ? sessionUsernames.size : 0;

        // Update UI
        updateDashboardUI(sessionStats);

        if (callback) {
          callback(data);
        } else {
          showToast(`실천 내역이 성공적으로 반영되었습니다.`);
        }
        if (modalCloseFn) modalCloseFn();
      };
 
      fetch('/api/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error('Static host fallback');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          handleSuccess(data);
        } else {
          showToast(data.error || '이력 저장에 실패했습니다.', true);
        }
      })
      .catch(err => {
        console.warn('Backend API unavailable. Running in static client mode:', err);
        handleSuccess({ success: true, localMode: true });
      });
    }

    // Cache to prevent infinite UI jump animations
    let lastStats = {
      totalReducedCarbonGrams: 0,
      totalParticipants: 0,
      totalActions: 0,
      reusable_cup: 0,
      reusable_plate: 0,
      reusable_bowl: 0,
      reusable_fork: 0,
      public_transport: 0,
      renewable_energy: 0,
      upcycled_keyring: 0,
      upcycled_banner: 0,
      paper_booth: 0,
      digital_signage: 0,
      papersSaved: 0,
      keyringReducedCarbonGrams: 0,
      keyringParticipants: 0,
      paperBoothParticipants: 0,
      signageParticipants: 0
    };
    // Initialize icons
    lucide.createIcons();

    // ==========================================
    // ESG REPORT MODAL JS (ESG 성과 보고서 PDF 첨부)
    // ==========================================
    let esgReportState = {
      submitted: false,
      username: '',
      title: '',
      fileName: ''
    };

    function openEsgReportModal() {
      try {
        const modal = document.getElementById('esgReportModal');
        if (!modal) {
          console.error('esgReportModal element not found');
          return;
        }

        // Unhide modal immediately (style + class)
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        setTimeout(() => {
          modal.classList.remove('opacity-0');
          const innerDiv = modal.querySelector('div');
          if (innerDiv) innerDiv.classList.remove('scale-95');
        }, 10);

        // Toggle visibility of the cancel registration button
        const cancelBtn = document.getElementById('btn-cancel-submit-esg-report');
        if (cancelBtn) {
          if (esgReportState.submitted) {
            cancelBtn.classList.remove('hidden');
          } else {
            cancelBtn.classList.add('hidden');
          }
        }

        try {
          const userEl = document.getElementById('esg-report-username');
          const titleEl = document.getElementById('esg-report-title');
          if (userEl) userEl.value = esgReportState.username || (typeof sessionStats !== 'undefined' ? sessionStats.username : '') || '';
          if (titleEl) titleEl.value = esgReportState.title || '';
          updateEsgReportFileUI();
        } catch (e) {
          console.warn('ESG Report modal populating warning:', e);
        }
      } catch (err) {
        console.error('Error opening ESG Report modal:', err);
      }
    }

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

    function closeEsgReportModal() {
      const modal = document.getElementById('esgReportModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const innerDiv = modal.querySelector('div');
      if (innerDiv) innerDiv.classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    function handleEsgReportFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type !== 'application/pdf') {
          showToast('PDF 파일만 업로드 가능합니다.', true);
          event.target.value = '';
          return;
        }

        esgReportState.fileName = file.name;
        updateEsgReportFileUI();
      }
    }

    function updateEsgReportFileUI() {
      const btn = document.getElementById('btn-submit-esg-report');
      const container = document.getElementById('esg-report-preview-container');

      if (esgReportState.fileName) {
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
          btn.classList.add('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
        }
        if (container) {
          container.innerHTML = `
            <i data-lucide="file-check-2" class="w-7 h-7 text-indigo-600 mb-1"></i>
            <p class="text-[11px] text-indigo-600 font-bold mb-0.5">${esgReportState.fileName}</p>
            <p class="text-[9px] text-slate-400">PDF 성과보고서 첨부 완료 (클릭하여 변경)</p>
          `;
        }
      } else {
        if (btn) {
          btn.disabled = true;
          btn.classList.remove('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
          btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
        }
        if (container) {
          container.innerHTML = `
            <i data-lucide="file-up" id="esg-report-upload-icon" class="w-7 h-7 text-indigo-500 mb-1"></i>
            <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="esg-report-filename">클릭하여 ESG 성과 보고서(PDF) 첨부</p>
            <p class="text-[9px] text-slate-400">PDF 문서 파일 지원 (최대 30MB)</p>
          `;
        }
      }
      try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      } catch (e) {}
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

    function openIso20121Modal() {
      try {
        const modal = document.getElementById('iso20121Modal');
        if (!modal) {
          console.error('iso20121Modal element not found');
          return;
        }

        // Unhide modal immediately (style + class)
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        setTimeout(() => {
          modal.classList.remove('opacity-0');
          const innerDiv = modal.querySelector('div');
          if (innerDiv) innerDiv.classList.remove('scale-95');
        }, 10);

        // Toggle visibility of the cancel registration button
        const cancelBtn = document.getElementById('btn-cancel-submit-iso20121');
        if (cancelBtn) {
          if (iso20121State.submitted) {
            cancelBtn.classList.remove('hidden');
          } else {
            cancelBtn.classList.add('hidden');
          }
        }

        try {
          const userEl = document.getElementById('iso20121-username');
          const certEl = document.getElementById('iso20121-cert-org');
          if (userEl) userEl.value = iso20121State.username || (typeof sessionStats !== 'undefined' ? sessionStats.username : '') || '';
          if (certEl) certEl.value = iso20121State.certOrg || '';
          updateIso20121FileUI();
        } catch (e) {
          console.warn('ISO 20121 modal populating warning:', e);
        }
      } catch (err) {
        console.error('Error opening ISO 20121 modal:', err);
      }
    }

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

    function closeIso20121Modal() {
      const modal = document.getElementById('iso20121Modal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const innerDiv = modal.querySelector('div');
      if (innerDiv) innerDiv.classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    function handleIso20121FileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
          showToast('이미지(JPG, PNG, WEBP) 또는 PDF 파일만 업로드 가능합니다.', true);
          event.target.value = '';
          return;
        }

        iso20121State.fileName = file.name;
        iso20121State.fileType = isImage ? 'image' : 'pdf';
        
        if (isImage) {
          const reader = new FileReader();
          reader.onload = function(e) {
            iso20121State.previewUrl = e.target.result;
            updateIso20121FileUI();
          };
          reader.readAsDataURL(file);
        } else {
          iso20121State.previewUrl = null;
          updateIso20121FileUI();
        }
      }
    }

    function updateIso20121FileUI() {
      const btn = document.getElementById('btn-submit-iso20121');
      const btnDetail = document.getElementById('btn-detail-submit');
      const container = document.getElementById('iso20121-preview-container');

      if (iso20121State.fileName) {
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
          btn.classList.add('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
        }
        if (btnDetail) {
          btnDetail.disabled = false;
          btnDetail.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        if (container) {
          if (iso20121State.fileType === 'image' && iso20121State.previewUrl) {
            container.innerHTML = `
              <img src="${iso20121State.previewUrl}" class="w-16 h-16 object-cover rounded-xl border border-slate-200 mb-1">
              <p class="text-[11px] text-indigo-600 font-bold mb-0.5">${iso20121State.fileName}</p>
              <p class="text-[9px] text-slate-400">클릭하여 인증서 파일 변경</p>
            `;
          } else {
            container.innerHTML = `
              <i data-lucide="file-check-2" class="w-7 h-7 text-indigo-600 mb-1"></i>
              <p class="text-[11px] text-indigo-600 font-bold mb-0.5">${iso20121State.fileName}</p>
              <p class="text-[9px] text-slate-400">PDF 인증서 첨부 완료 (클릭하여 변경)</p>
            `;
          }
        }
      } else {
        if (btn) {
          btn.disabled = true;
          btn.classList.remove('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
          btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
        }
        if (container) {
          container.innerHTML = `
            <i data-lucide="file-check-2" id="iso20121-upload-icon" class="w-7 h-7 text-indigo-500 mb-1"></i>
            <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="iso20121-filename">클릭하여 인증서 파일(PDF, JPG, PNG) 첨부</p>
            <p class="text-[9px] text-slate-400">PDF 문서 및 이미지 파일 지원 (최대 20MB)</p>
          `;
        }
      }
      try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      } catch (e) {}
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

    function openAdvisoryModal() {
      try {
        const modal = document.getElementById('advisoryModal');
        if (!modal) {
          console.error('advisoryModal element not found');
          return;
        }

        // Unhide modal immediately (style + class)
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        setTimeout(() => {
          modal.classList.remove('opacity-0');
          const innerDiv = modal.querySelector('div');
          if (innerDiv) innerDiv.classList.remove('scale-95');
        }, 10);

        // Toggle visibility of the cancel registration button
        const cancelBtn = document.getElementById('btn-cancel-submit-advisory');
        if (cancelBtn) {
          if (advisoryState.submitted) {
            cancelBtn.classList.remove('hidden');
          } else {
            cancelBtn.classList.add('hidden');
          }
        }

        try {
          const userEl = document.getElementById('advisory-username');
          const locEl = document.getElementById('advisory-location');
          const dtEl = document.getElementById('advisory-datetime');
          const sumEl = document.getElementById('advisory-summary');

          if (userEl) userEl.value = advisoryState.username || (typeof sessionStats !== 'undefined' ? sessionStats.username : '') || '';
          if (locEl) locEl.value = advisoryState.location || '';
          if (dtEl) dtEl.value = advisoryState.datetime || '';
          if (sumEl) sumEl.value = advisoryState.summary || '';
          
          updateAdvisoryFileUI();
          checkAdvisorySubmitStatus();
        } catch (e) {
          console.warn('Advisory modal populating warning:', e);
        }
      } catch (err) {
        console.error('Error opening Advisory modal:', err);
      }
    }

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

    function closeAdvisoryModal() {
      const modal = document.getElementById('advisoryModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const innerDiv = modal.querySelector('div');
      if (innerDiv) innerDiv.classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    function handleAdvisoryFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('사진(JPG, PNG, WEBP 등 이미지) 파일만 업로드 가능합니다.', true);
          event.target.value = '';
          return;
        }

        advisoryState.fileName = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
          advisoryState.previewUrl = e.target.result;
          updateAdvisoryFileUI();
          checkAdvisorySubmitStatus();
        };
        reader.readAsDataURL(file);
      }
    }

    function updateAdvisoryFileUI() {
      const container = document.getElementById('advisory-preview-container');
      if (!container) return;

      if (advisoryState.fileName && advisoryState.previewUrl) {
        container.innerHTML = `
          <img src="${advisoryState.previewUrl}" class="w-20 h-20 object-cover rounded-xl border border-slate-200 mb-1">
          <p class="text-[11px] text-indigo-600 font-bold mb-0.5">${advisoryState.fileName}</p>
          <p class="text-[9px] text-slate-400">클릭하여 회의 사진 변경</p>
        `;
      } else {
        container.innerHTML = `
          <i data-lucide="camera" id="advisory-upload-icon" class="w-7 h-7 text-indigo-500 mb-1"></i>
          <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="advisory-filename">클릭하여 회의 사진(JPG, PNG, WEBP) 첨부</p>
          <p class="text-[9px] text-slate-400">이미지 파일 지원 (최대 20MB)</p>
        `;
      }
      if (window.lucide) lucide.createIcons();
    }

    function checkAdvisorySubmitStatus() {
      const locVal = (document.getElementById('advisory-location')?.value || '').trim();
      const dtVal = (document.getElementById('advisory-datetime')?.value || '').trim();
      const btn = document.getElementById('btn-submit-advisory');

      if (btn) {
        if (locVal && dtVal) {
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
    function openDetailModal(title, description, isIso20121 = false) {
      if (title && (title.includes('성과 보고서') || title.includes('ESG 성과'))) {
        openEsgReportModal();
        return;
      }
      if (title && title.includes('자문위원회')) {
        openAdvisoryModal();
        return;
      }
      if ((title && title.includes('ISO 20121')) || isIso20121) {
        openIso20121Modal();
        return;
      }
      if (title && (title.includes('의견 수렴') || title.includes('이해관계자'))) {
        openStakeholderFeedbackModal();
        return;
      }
      if (title && (title.includes('정보공개') || title.includes('통합 정보'))) {
        openEsgDisclosureModal();
        return;
      }

      const modal = document.getElementById('detailModal');
      const mTitle = document.getElementById('modalTitle');
      const mDesc = document.getElementById('modalDescription');
      const fileContainer = document.getElementById('detailModalFileUploadContainer');
      const btnSubmit = document.getElementById('btn-detail-submit');

      if (mTitle) mTitle.textContent = title;
      if (mDesc) mDesc.textContent = description;

      if (fileContainer) fileContainer.classList.add('hidden');
      if (btnSubmit) btnSubmit.classList.add('hidden');

      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const innerDiv = modal.querySelector('div');
        if (innerDiv) innerDiv.classList.remove('scale-95');
      }, 10);
    }
    window.openDetailModal = openDetailModal;

    function closeDetailModal() {
      const modal = document.getElementById('detailModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const innerDiv = modal.querySelector('div');
      if (innerDiv) innerDiv.classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    // 이해관계자 의견 수렴 플랫폼 모달
    function openStakeholderFeedbackModal() {
      const modal = document.getElementById('stakeholderFeedbackModal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const innerDiv = modal.querySelector('div');
        if (innerDiv) innerDiv.classList.remove('scale-95');
      }, 10);
      if (window.lucide) window.lucide.createIcons();
    }

    function closeStakeholderFeedbackModal() {
      const modal = document.getElementById('stakeholderFeedbackModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const innerDiv = modal.querySelector('div');
      if (innerDiv) innerDiv.classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    function handleStakeholderFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        const fileNameEl = document.getElementById('stakeholder-filename');
        if (fileNameEl) fileNameEl.textContent = file.name;
      }
    }

    function submitStakeholderFeedback() {
      const iconContainer = document.getElementById('badge-stakeholder-icon-container');
      const label = document.getElementById('badge-stakeholder-label');
      const value = document.getElementById('badge-stakeholder-value');
      
      if (iconContainer) {
        iconContainer.classList.remove('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.add('bg-emerald-100', 'text-emerald-700');
      }
      if (label) label.textContent = '자문단 회의록';
      if (value) {
        value.textContent = '증명 제출 완료';
        value.classList.add('text-emerald-600');
      }

      closeStakeholderFeedbackModal();
      if (typeof showToast === 'function') {
        showToast('이해관계자 자문단 회의록 및 의견 수렴 보고서 첨부가 성공적으로 증명되었습니다.');
      } else {
        alert('이해관계자 자문단 회의록 및 의견 수렴 보고서 첨부가 성공적으로 증명되었습니다.');
      }
    }

    // 행사 ESG 통합 정보공개 페이지 구축 모달
    function openEsgDisclosureModal() {
      const modal = document.getElementById('esgDisclosureModal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const innerDiv = modal.querySelector('div');
        if (innerDiv) innerDiv.classList.remove('scale-95');
      }, 10);
      if (window.lucide) window.lucide.createIcons();
    }

    function closeEsgDisclosureModal() {
      const modal = document.getElementById('esgDisclosureModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const innerDiv = modal.querySelector('div');
      if (innerDiv) innerDiv.classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    function handleDisclosureFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        const fileNameEl = document.getElementById('disclosure-filename');
        if (fileNameEl) fileNameEl.textContent = file.name;
      }
    }

    function submitEsgDisclosure() {
      const iconContainer = document.getElementById('badge-esg-disclosure-icon-container');
      const label = document.getElementById('badge-esg-disclosure-label');
      const value = document.getElementById('badge-esg-disclosure-value');
      
      if (iconContainer) {
        iconContainer.classList.remove('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.add('bg-emerald-100', 'text-emerald-700');
      }
      if (label) label.textContent = '통합 정보공개';
      if (value) {
        value.textContent = '누리집 구축·공시완료';
        value.classList.add('text-emerald-600');
      }

      closeEsgDisclosureModal();
      if (typeof showToast === 'function') {
        showToast('행사 ESG 통합 정보공개 페이지 URL 및 이행 확인서 증명이 등록되었습니다.');
      } else {
        alert('행사 ESG 통합 정보공개 페이지 URL 및 이행 확인서 증명이 등록되었습니다.');
      }
    }

    window.openStakeholderFeedbackModal = openStakeholderFeedbackModal;
    window.closeStakeholderFeedbackModal = closeStakeholderFeedbackModal;
    window.handleStakeholderFileChange = handleStakeholderFileChange;
    window.submitStakeholderFeedback = submitStakeholderFeedback;

    window.openEsgDisclosureModal = openEsgDisclosureModal;
    window.closeEsgDisclosureModal = closeEsgDisclosureModal;
    window.handleDisclosureFileChange = handleDisclosureFileChange;
    window.submitEsgDisclosure = submitEsgDisclosure;

    // 친환경 행사장 조성 · 관리 인증서 제출 상태 변수 및 모달 처리
    let venueEcologyState = {
      submitted: false,
      checkedCerts: [],
      fileName: ''
    };

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

    function openVenueEcologyModal() {
      const modal = document.getElementById('venueEcologyModal');
      
      // Load current state into checkboxes
      const certs = ['gseed', 'leed', 'earthcheck', 'iso14001', 'iso20121', 'forest'];
      certs.forEach(c => {
        document.getElementById(`cert-${c}`).checked = venueEcologyState.checkedCerts.includes(c);
      });
      
      const fileNameDisplay = document.getElementById('upload-filename');
      const uploadIcon = document.getElementById('upload-icon');
      if (venueEcologyState.fileName) {
        fileNameDisplay.textContent = venueEcologyState.fileName;
        fileNameDisplay.classList.add('text-emerald-600');
        uploadIcon.setAttribute('data-lucide', 'file-check');
        uploadIcon.classList.remove('text-slate-400');
        uploadIcon.classList.add('text-emerald-500');
      } else {
        fileNameDisplay.textContent = '클릭하여 PDF 인증서 업로드';
        fileNameDisplay.classList.remove('text-emerald-600');
        uploadIcon.setAttribute('data-lucide', 'file-up');
        uploadIcon.classList.remove('text-emerald-500');
        uploadIcon.classList.add('text-slate-400');
      }
      lucide.createIcons();

      // Setup event listeners on checkboxes
      certs.forEach(c => {
        document.getElementById(`cert-${c}`).onchange = checkVenueEcologySubmitStatus;
      });

      checkVenueEcologySubmitStatus();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeVenueEcologyModal() {
      const modal = document.getElementById('venueEcologyModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function handleFileChange(event) {
      const file = event.target.files[0];
      const fileNameDisplay = document.getElementById('upload-filename');
      const uploadIcon = document.getElementById('upload-icon');
      
      if (file) {
        if (file.type !== 'application/pdf') {
          showToast('PDF 파일만 업로드할 수 있습니다.', true);
          event.target.value = '';
          return;
        }
        
        venueEcologyState.fileName = file.name;
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.classList.add('text-emerald-600');
        uploadIcon.setAttribute('data-lucide', 'file-check');
        uploadIcon.classList.remove('text-slate-400');
        uploadIcon.classList.add('text-emerald-500');
        lucide.createIcons();
      } else {
        venueEcologyState.fileName = '';
        fileNameDisplay.textContent = '클릭하여 PDF 인증서 업로드';
        fileNameDisplay.classList.remove('text-emerald-600');
        uploadIcon.setAttribute('data-lucide', 'file-up');
        uploadIcon.classList.remove('text-emerald-500');
        uploadIcon.classList.add('text-slate-400');
        lucide.createIcons();
      }
      checkVenueEcologySubmitStatus();
    }

    function checkVenueEcologySubmitStatus() {
      const certs = ['gseed', 'leed', 'earthcheck', 'iso14001', 'iso20121', 'forest'];
      const anyChecked = certs.some(c => document.getElementById(`cert-${c}`).checked);
      const fileUploaded = !!venueEcologyState.fileName;
      const btn = document.getElementById('btn-submit-venue-ecology');

      if (anyChecked && fileUploaded) {
        btn.disabled = false;
        btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
        btn.classList.add('bg-[#0f4c3a]', 'hover:bg-emerald-800', 'text-white');
      } else {
        btn.disabled = true;
        btn.classList.remove('bg-[#0f4c3a]', 'hover:bg-emerald-800', 'text-white');
        btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
      }
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
    function openEcoSimulatorModal() {
      const modal = document.getElementById('ecoSimulatorModal');
      
      // Load existing session quantities
      currentEcoQuantities = {
        cup: sessionStats.items.reusable_cup || 0,
        plate: sessionStats.items.reusable_plate || 0,
        bowl: sessionStats.items.reusable_bowl || 0,
        fork: sessionStats.items.reusable_fork || 0
      };
      document.getElementById('eco-username').value = sessionStats.username || '';
      
      // Update UI elements
      updateModalUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeEcoSimulatorModal() {
      const modal = document.getElementById('ecoSimulatorModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    // Quantity modifiers
    function changeQty(item, delta) {
      const newQty = currentEcoQuantities[item] + delta;
      if (newQty >= 0 && newQty <= 99) {
        currentEcoQuantities[item] = newQty;
        updateModalUI();
      }
    }

    function updateModalUI() {
      // Set Counter values
      for (const [item, qty] of Object.entries(currentEcoQuantities)) {
        document.getElementById(`qty-${item}`).textContent = qty;
      }
      
      // Calculate carbon
      let totalCarbon = 0;
      for (const [item, qty] of Object.entries(currentEcoQuantities)) {
        totalCarbon += qty * ECO_COEFFICIENTS[item];
      }
      
      document.getElementById('eco-carbon-summary').textContent = totalCarbon.toLocaleString() + ' gCO2eq';
    }

    // Transport Simulator Modal Functions
    function openTransportSimulatorModal() {
      const modal = document.getElementById('transportSimulatorModal');
      
      // Keep existing quantities or initialize if empty
      if (!currentTransportQuantities || (sessionStats.items.public_transport || 0) === 0) {
        currentTransportQuantities = { distance: 0, people: 1 };
      }
      document.getElementById('transport-username').value = sessionStats.username || '';
      
      // Update UI
      updateTransportModalUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeTransportSimulatorModal() {
      const modal = document.getElementById('transportSimulatorModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function changeTransportQty(field, delta) {
      const newVal = currentTransportQuantities[field] + delta;
      if (field === 'distance' && newVal >= 0 && newVal <= 500) {
        currentTransportQuantities.distance = newVal;
        updateTransportModalUI();
      } else if (field === 'people' && newVal >= 1 && newVal <= 50) {
        currentTransportQuantities.people = newVal;
        updateTransportModalUI();
      }
    }

    function updateTransportModalUI() {
      document.getElementById('qty-distance').textContent = currentTransportQuantities.distance + ' km';
      document.getElementById('qty-people').textContent = currentTransportQuantities.people;

      const totalCarbon = currentTransportQuantities.distance * currentTransportQuantities.people * TRANSPORT_COEFFICIENT;
      document.getElementById('transport-carbon-summary').textContent = totalCarbon.toLocaleString() + ' gCO2eq';
    }

    // Energy Simulator Modal Functions
    function openEnergySimulatorModal() {
      const modal = document.getElementById('energySimulatorModal');
      
      // Load existing quantities from sessionStats
      document.getElementById('qty-energy').value = sessionStats.items.renewable_energy || 0;
      document.getElementById('energy-username').value = sessionStats.username || '';
      
      // Update UI
      updateEnergyModalUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeEnergySimulatorModal() {
      const modal = document.getElementById('energySimulatorModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function changeEnergyQty(delta) {
      const qtyInput = document.getElementById('qty-energy');
      let newVal = parseInt(qtyInput.value || 0) + delta;
      if (newVal < 0) newVal = 0;
      if (newVal > 100000) newVal = 100000;
      qtyInput.value = newVal;
      updateEnergyModalUI();
    }

    function updateEnergyModalUI() {
      const qtyInput = document.getElementById('qty-energy');
      const val = parseInt(qtyInput.value || 0);
      currentEnergyQuantity = val;

      const cost = val * 11;
      document.getElementById('energy-cost-summary').textContent = cost.toLocaleString() + '원';

      const totalCarbon = val * ENERGY_COEFFICIENT;
      document.getElementById('energy-carbon-summary').textContent = totalCarbon.toLocaleString() + ' gCO2eq';
    }

    function submitEnergySimulation() {
      const username = document.getElementById('energy-username').value.trim() || '익명 참여자';
      const qtyInput = document.getElementById('qty-energy');
      const val = parseInt(qtyInput.value || 0);

      if (val < 0) {
        showToast('사용 전력량은 0 이상 입력해 주세요.', true);
        return;
      }

      sessionStats.items.renewable_energy = val;

      sendParticipation(username, (data) => {
        showToast(`참여 완료! 재생에너지 실천 내역이 성공적으로 반영되었습니다.`);
      }, closeEnergySimulatorModal);
    }

    // Upcycle Simulator Modal Functions
    function openUpcycleSimulatorModal() {
      const modal = document.getElementById('upcycleSimulatorModal');
      
      document.getElementById('upcycle-username').value = sessionStats.username || '';
      document.getElementById('upcycle-category').value = lastUpcycleCategory;
      
      // Load keyrings quantity from session
      document.getElementById('qty-upcycle').value = sessionStats.items.upcycled_keyring || 0;
      
      // Load banners N and Y
      document.getElementById('qty-banner-n').value = lastBannerN;
      document.getElementById('qty-banner-y').value = lastBannerY;
      
      // Update UI
      updateUpcycleModalUI();
 
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }
 
    function closeUpcycleSimulatorModal() {
      const modal = document.getElementById('upcycleSimulatorModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }
 
    function changeUpcycleQty(delta) {
      const qtyInput = document.getElementById('qty-upcycle');
      let newVal = parseInt(qtyInput.value || 0) + delta;
      if (newVal < 0) newVal = 0;
      if (newVal > 1000) newVal = 1000;
      qtyInput.value = newVal;
      updateUpcycleModalUI();
    }

    function changeBannerQty(field, delta) {
      const qtyN = document.getElementById('qty-banner-n');
      const qtyY = document.getElementById('qty-banner-y');
      if (field === 'N') {
        let newVal = parseInt(qtyN.value || 0) + delta;
        if (newVal < 0) newVal = 0;
        if (newVal > 5000) newVal = 5000;
        qtyN.value = newVal;
      } else if (field === 'Y') {
        let newVal = parseInt(qtyY.value || 0) + delta;
        if (newVal < 0) newVal = 0;
        if (newVal > 100) newVal = 100;
        qtyY.value = newVal;
      }
      updateUpcycleModalUI();
    }
 
    function updateUpcycleModalUI() {
      const category = document.getElementById('upcycle-category').value;
      const btnSubmit = document.getElementById('btn-submit-upcycle');
      const resultContainer = document.getElementById('upcycle-result-container');
      const resultLabel = document.getElementById('upcycle-result-label');
      const carbonSummary = document.getElementById('upcycle-carbon-summary');
      
      const keyringGroup = document.getElementById('keyring-input-group');
      const bannerGroup = document.getElementById('banner-input-group');
 
      if (category === 'keyring') {
        if (keyringGroup) keyringGroup.classList.remove('hidden');
        if (bannerGroup) bannerGroup.classList.add('hidden');

        const qtyInput = document.getElementById('qty-upcycle');
        const val = parseInt(qtyInput.value || 0);
        currentUpcycleQuantity = val;
 
        if (val <= 0) {
          btnSubmit.disabled = true;
          btnSubmit.className = "bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98";
          
          resultContainer.className = "bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex justify-between items-center transition-all duration-300";
          resultLabel.className = "text-[10px] text-slate-455 font-medium";
          resultLabel.textContent = "실시간 예상 탄소 감축 결과";
          carbonSummary.className = "text-lg font-black text-slate-500 leading-none";
          carbonSummary.textContent = "0 gCO2eq";
          return;
        }
 
        btnSubmit.disabled = false;
        btnSubmit.className = "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98";
 
        // Formula: E_net = Q * 16 - 50 g CO2eq
        const netReductionGrams = val * 16 - 50;
 
        if (netReductionGrams < 0) {
          resultContainer.className = "bg-red-50 rounded-2xl p-4 border border-red-100/70 flex justify-between items-center transition-all duration-300";
          resultLabel.className = "text-[10px] text-red-700 font-bold";
          resultLabel.textContent = "물류 배출량(50g)이 더 커서 탄소가 늘어남";
          carbonSummary.className = "text-lg font-black text-red-600 leading-none";
          carbonSummary.textContent = netReductionGrams.toLocaleString() + ' gCO2eq';
        } else {
          resultContainer.className = "bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/70 flex justify-between items-center transition-all duration-300";
          resultLabel.className = "text-[10px] text-emerald-700 font-bold";
          resultLabel.textContent = "실시간 예상 탄소 감축 결과";
          carbonSummary.className = "text-lg font-black text-emerald-700 leading-none";
          carbonSummary.textContent = '+' + netReductionGrams.toLocaleString() + ' gCO2eq';
        }
      } else if (category === 'banner') {
        if (keyringGroup) keyringGroup.classList.add('hidden');
        if (bannerGroup) bannerGroup.classList.remove('hidden');
 
        const nVal = parseInt(document.getElementById('qty-banner-n').value || 0);
        const yVal = parseInt(document.getElementById('qty-banner-y').value || 1);
        
        const qVal = yVal > 0 ? parseFloat((nVal / yVal).toFixed(2)) : 0;
        document.getElementById('banner-calc-q').textContent = qVal;
 
        if (nVal <= 0 || yVal <= 0) {
          btnSubmit.disabled = true;
          btnSubmit.className = "bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98";
          
          resultContainer.className = "bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex justify-between items-center transition-all duration-300";
          resultLabel.className = "text-[10px] text-slate-455 font-medium";
          resultLabel.textContent = "실시간 예상 탄소 감축 결과";
          carbonSummary.className = "text-lg font-black text-slate-500 leading-none";
          carbonSummary.textContent = "0 gCO2eq";
          return;
        }
 
        btnSubmit.disabled = false;
        btnSubmit.className = "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98";
 
        // Formula: Q * 6.28 kg CO2eq = Q * 6280 g CO2eq
        const netReductionGrams = Math.round(qVal * 6280);
 
        resultContainer.className = "bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/70 flex justify-between items-center transition-all duration-300";
        resultLabel.className = "text-[10px] text-emerald-700 font-bold";
        resultLabel.textContent = "실시간 예상 탄소 감축 결과";
        carbonSummary.className = "text-lg font-black text-emerald-700 leading-none";
        carbonSummary.textContent = '+' + netReductionGrams.toLocaleString() + ' gCO2eq';
      }
    }
 
    function submitUpcycleSimulation() {
      const username = document.getElementById('upcycle-username').value.trim() || '익명 참여자';
      const category = document.getElementById('upcycle-category').value;
      
      if (category === 'keyring') {
        const qtyInput = document.getElementById('qty-upcycle');
        const val = parseInt(qtyInput.value || 0);
        if (val < 0) {
          showToast('제작 수량은 0개 이상 입력해 주세요.', true);
          return;
        }
        sessionStats.items.upcycled_keyring = val;
      } else if (category === 'banner') {
        const nVal = parseInt(document.getElementById('qty-banner-n').value || 0);
        const yVal = parseInt(document.getElementById('qty-banner-y').value || 1);
        if (nVal < 0 || yVal < 1) {
          showToast('올바른 제작 수량을 입력해 주세요.', true);
          return;
        }
        const val = yVal > 0 ? parseFloat((nVal / yVal).toFixed(2)) : 0;
        sessionStats.items.upcycled_banner = val;
        lastBannerN = nVal;
        lastBannerY = yVal;
      }
      lastUpcycleCategory = category;

      sendParticipation(username, (data) => {
        showToast(`참여 완료! 업사이클링 실천 내역이 성공적으로 반영되었습니다.`);
      }, closeUpcycleSimulatorModal);
    }

    // Paper Booth Simulator Modal Functions
    function openPaperBoothSimulatorModal() {
      const modal = document.getElementById('paperBoothSimulatorModal');
      
      // Load existing state from sessionStats
      document.getElementById('qty-paper-booth').value = sessionStats.items.paper_booth || 0;
      document.getElementById('booth-username').value = sessionStats.username || '';
      
      // Update UI
      updateBoothModalUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closePaperBoothSimulatorModal() {
      const modal = document.getElementById('paperBoothSimulatorModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function changeBoothQty(delta) {
      const qtyInput = document.getElementById('qty-paper-booth');
      let newVal = parseInt(qtyInput.value || 0) + delta;
      if (newVal < 0) newVal = 0;
      if (newVal > 10000) newVal = 10000;
      qtyInput.value = newVal;
      updateBoothModalUI();
    }

    function updateBoothModalUI() {
      const qtyInput = document.getElementById('qty-paper-booth');
      const val = parseInt(qtyInput.value || 0);
      const btnSubmit = document.getElementById('btn-submit-booth');
      const resultContainer = document.getElementById('booth-result-container');
      const resultLabel = document.getElementById('booth-result-label');
      const carbonSummary = document.getElementById('booth-carbon-summary');

      // MDF baseline: val * 11.0 * 0.85 * 1.3
      const baselineKg = parseFloat((val * 11.0 * 0.85 * 1.3).toFixed(2));
      // Honeycomb project: val * 1.45 * 1.4
      const projectKg = parseFloat((val * 1.45 * 1.4).toFixed(2));

      document.getElementById('booth-baseline-calc').textContent = baselineKg.toLocaleString();
      document.getElementById('booth-project-calc').textContent = projectKg.toLocaleString();

      if (val <= 0) {
        btnSubmit.disabled = true;
        btnSubmit.className = "bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98";
        
        resultContainer.className = "bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex justify-between items-center transition-all duration-300";
        resultLabel.className = "text-[10px] text-slate-455 font-medium";
        resultLabel.textContent = "실시간 예상 탄소 감축 결과";
        carbonSummary.className = "text-lg font-black text-slate-500 leading-none";
        carbonSummary.textContent = "0 gCO2eq";
        return;
      }

      btnSubmit.disabled = false;
      btnSubmit.className = "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98";

      // Net reduction in grams: val * 10125
      const netReductionGrams = val * 10125;

      resultContainer.className = "bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/70 flex justify-between items-center transition-all duration-300";
      resultLabel.className = "text-[10px] text-emerald-700 font-bold";
      resultLabel.textContent = "실시간 예상 탄소 감축 결과";
      carbonSummary.className = "text-lg font-black text-emerald-700 leading-none";
      carbonSummary.textContent = '+' + netReductionGrams.toLocaleString() + ' gCO2eq';
    }

    function submitBoothSimulation() {
      const username = document.getElementById('booth-username').value.trim() || '익명 참여자';
      const qtyInput = document.getElementById('qty-paper-booth');
      const val = parseInt(qtyInput.value || 0);

      if (val < 0) {
        showToast('도입 부스 면적은 0㎡ 이상 입력해 주세요.', true);
        return;
      }

      sessionStats.items.paper_booth = val;

      sendParticipation(username, (data) => {
        showToast(`참여 완료! 종이 전시부스 실천 내역이 성공적으로 반영되었습니다.`);
      }, closePaperBoothSimulatorModal);
    }

    // Show Toast helper
    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-message');
      
      toastMsg.textContent = message;
      if (isError) {
        toast.classList.replace('text-white', 'text-red-400');
      } else {
        toast.classList.replace('text-red-400', 'text-white');
      }
      
      toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
      }, 3000);
    }

    // Digital Signage Simulator Modal Functions
    function openSignageSimulatorModal() {
      const modal = document.getElementById('signageSimulatorModal');
      
      // Clear localStorage cache and reset initial quantities to 0
      localStorage.removeItem('mice_signage_quantities');
      currentSignageQuantities = {
        paper_a4: 0,
        paper_brochure: 0,
        paper_poster: 0,
        views: 0,
        hours: 0,
        is_renewable: false
      };
      
      document.getElementById('signage-username').value = sessionStats.username || '';
      document.getElementById('qty-signage-paper-a4').value = 0;
      document.getElementById('qty-signage-paper-brochure').value = 0;
      document.getElementById('qty-signage-paper-poster').value = 0;
      document.getElementById('qty-signage-views').value = 0;
      document.getElementById('qty-signage-hours').value = 0;
      document.getElementById('signage-renewable').checked = false;
      
      updateSignageModalUI();
      
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }
    
    function closeSignageSimulatorModal() {
      const modal = document.getElementById('signageSimulatorModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }
    
    function changeSignagePaperQty(type, delta) {
      let elId = '';
      if (type === 'a4') elId = 'qty-signage-paper-a4';
      else if (type === 'brochure') elId = 'qty-signage-paper-brochure';
      else if (type === 'poster') elId = 'qty-signage-paper-poster';
      
      const el = document.getElementById(elId);
      let val = parseInt(el.value || 0) + delta;
      if (val < 0) val = 0;
      el.value = val;
      updateSignageModalUI();
    }
    
    function changeSignageQty(field, delta) {
      let val = 0;
      if (field === 'views') {
        const el = document.getElementById('qty-signage-views');
        val = parseInt(el.value || 0) + delta;
        if (val < 0) val = 0;
        el.value = val;
      } else if (field === 'hours') {
        const el = document.getElementById('qty-signage-hours');
        val = parseInt(el.value || 0) + delta;
        if (val < 0) val = 0;
        el.value = val;
      }
      updateSignageModalUI();
    }
    
    function updateSignageModalUI() {
      const paper_a4 = parseInt(document.getElementById('qty-signage-paper-a4').value || 0);
      const paper_brochure = parseInt(document.getElementById('qty-signage-paper-brochure').value || 0);
      const paper_poster = parseInt(document.getElementById('qty-signage-paper-poster').value || 0);
      const views = parseInt(document.getElementById('qty-signage-views').value || 0);
      const hours = parseInt(document.getElementById('qty-signage-hours').value || 0);
      const is_renewable = document.getElementById('signage-renewable').checked;
      
      currentSignageQuantities = { paper_a4, paper_brochure, paper_poster, views, hours, is_renewable };
      localStorage.setItem('mice_signage_quantities', JSON.stringify(currentSignageQuantities));
      
      // Formulas
      const e_baseline_paper_g = (paper_a4 * 0.005 + paper_brochure * 0.015 + paper_poster * 0.030) * 1120;
      const e_mobile_view_g = views * 0.1;
      const e_signage_power_g = hours * 0.15 * (is_renewable ? 0 : 478.1);
      const e_project_digital_g = e_mobile_view_g + e_signage_power_g;
      
      const net_reduction_g = Math.round(e_baseline_paper_g - e_project_digital_g);
      
      document.getElementById('signage-breakdown-paper').textContent = (e_baseline_paper_g / 1000).toFixed(2) + ' kgCO2eq';
      document.getElementById('signage-breakdown-digital').textContent = (e_project_digital_g / 1000).toFixed(2) + ' kgCO2eq';
      
      const summaryEl = document.getElementById('signage-carbon-summary');
      if (net_reduction_g < 0) {
        summaryEl.textContent = '0 gCO2eq (감축 불가)';
        summaryEl.classList.add('text-red-500');
        summaryEl.classList.remove('text-emerald-700');
      } else {
        summaryEl.textContent = net_reduction_g.toLocaleString() + ' gCO2eq';
        summaryEl.classList.remove('text-red-500');
        summaryEl.classList.add('text-emerald-700');
      }
    }
    
    function submitSignageSimulation() {
      const username = document.getElementById('signage-username').value.trim() || '익명 참여자';
      const paper_a4 = parseInt(document.getElementById('qty-signage-paper-a4').value || 0);
      const paper_brochure = parseInt(document.getElementById('qty-signage-paper-brochure').value || 0);
      const paper_poster = parseInt(document.getElementById('qty-signage-paper-poster').value || 0);
      const views = parseInt(document.getElementById('qty-signage-views').value || 0);
      const hours = parseInt(document.getElementById('qty-signage-hours').value || 0);
      const is_renewable = document.getElementById('signage-renewable').checked;
      
      // Formulas
      const e_baseline_paper_g = (paper_a4 * 0.005 + paper_brochure * 0.015 + paper_poster * 0.030) * 1120;
      const e_mobile_view_g = views * 0.1;
      const e_signage_power_g = hours * 0.15 * (is_renewable ? 0 : 478.1);
      const e_project_digital_g = e_mobile_view_g + e_signage_power_g;
      
      const net_reduction_g = Math.round(e_baseline_paper_g - e_project_digital_g);
      
      if (net_reduction_g < 0) {
        showToast('탄소 감축량이 0보다 작습니다. 인쇄물을 더 줄이거나 기기 사용을 최소화해 주세요.', true);
        return;
      }
      
      sessionStats.items.digital_signage = net_reduction_g;
      
      sendParticipation(username, (data) => {
        showToast('참여 완료! 페이퍼리스 & 사이니지 실천 내역이 성공적으로 반영되었습니다.');
      }, closeSignageSimulatorModal);
    }

    // Waste Recycling Simulator Modal Functions (GRI 306 & TRUE Zero Waste)
    let currentWasteQuantities = { paper: 0, plastic: 0, food: 0, general: 0 };

    function openWasteRecyclingModal() {
      const modal = document.getElementById('wasteRecyclingModal');
      if (!modal) return;
      
      currentWasteQuantities = { paper: 0, plastic: 0, food: 0, general: 0 };
      
      document.getElementById('waste-username').value = sessionStats.username || '';
      document.getElementById('qty-waste-paper').value = 0;
      document.getElementById('qty-waste-plastic').value = 0;
      document.getElementById('qty-waste-food').value = 0;
      document.getElementById('qty-waste-general').value = 0;
      
      updateWasteModalUI();
      
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.querySelector('div')) modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeWasteRecyclingModal() {
      const modal = document.getElementById('wasteRecyclingModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      if (modal.querySelector('div')) modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function changeWasteQty(field, delta) {
      const el = document.getElementById(`qty-waste-${field}`);
      if (!el) return;
      let val = parseInt(el.value || 0) + delta;
      if (val < 0) val = 0;
      el.value = val;
      updateWasteModalUI();
    }

    function updateWasteModalUI() {
      const paper = parseInt(document.getElementById('qty-waste-paper').value || 0);
      const plastic = parseInt(document.getElementById('qty-waste-plastic').value || 0);
      const food = parseInt(document.getElementById('qty-waste-food').value || 0);
      const general = parseInt(document.getElementById('qty-waste-general').value || 0);
      
      currentWasteQuantities = { paper, plastic, food, general };
      
      const total_waste = paper + plastic + food + general;
      const diverted_waste = paper + plastic + food;
      const rate = total_waste > 0 ? ((diverted_waste / total_waste) * 100).toFixed(1) : "0.0";
      
      document.getElementById('waste-total-kg').textContent = total_waste.toLocaleString() + ' kg';
      document.getElementById('waste-recycling-rate').textContent = rate + ' %';
      
      const badge = document.getElementById('waste-zero-badge');
      if (total_waste > 0 && parseFloat(rate) >= 90.0) {
        badge.textContent = 'CERTIFIED 90%+';
        badge.className = 'text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm';
      } else {
        badge.textContent = '기준 미달';
        badge.className = 'text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600';
      }
      
      const net_reduction_g = Math.round(paper * 1120 + plastic * 1850 + food * 850);
      document.getElementById('waste-carbon-summary').textContent = '+' + net_reduction_g.toLocaleString() + ' gCO2eq';
      
      const btnSubmit = document.getElementById('btn-submit-waste');
      if (total_waste <= 0) {
        btnSubmit.disabled = true;
        btnSubmit.className = "bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98";
      } else {
        btnSubmit.disabled = false;
        btnSubmit.className = "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98";
      }
    }

    function submitWasteSimulation() {
      const username = document.getElementById('waste-username').value.trim() || '익명 참여자';
      const paper = parseInt(document.getElementById('qty-waste-paper').value || 0);
      const plastic = parseInt(document.getElementById('qty-waste-plastic').value || 0);
      const food = parseInt(document.getElementById('qty-waste-food').value || 0);
      
      const net_reduction_g = Math.round(paper * 1120 + plastic * 1850 + food * 850);
      if (net_reduction_g <= 0) {
        showToast('재활용 분리배출 수량을 1kg 이상 입력해 주세요.', true);
        return;
      }
      
      sessionStats.items.waste_recycling = net_reduction_g;
      
      sendParticipation(username, (data) => {
        showToast('참여 완료! 자원순환 & 폐기물 재활용 실천 내역이 성공적으로 반영되었습니다.');
      }, closeWasteRecyclingModal);
    }

    window.openWasteRecyclingModal = openWasteRecyclingModal;
    window.closeWasteRecyclingModal = closeWasteRecyclingModal;
    window.changeWasteQty = changeWasteQty;
    window.updateWasteModalUI = updateWasteModalUI;
    window.submitWasteSimulation = submitWasteSimulation;

    // Submit log to backend (Eco Reusable)
    function submitEcoSimulation() {
      const username = document.getElementById('eco-username').value.trim() || '익명 참여자';

      // Update session state
      sessionStats.items.reusable_cup = currentEcoQuantities.cup;
      sessionStats.items.reusable_plate = currentEcoQuantities.plate;
      sessionStats.items.reusable_bowl = currentEcoQuantities.bowl;
      sessionStats.items.reusable_fork = currentEcoQuantities.fork;

      sendParticipation(username, (data) => {
        showToast(`참여 완료! 다회용기 실천 내역이 성공적으로 반영되었습니다.`);
      }, closeEcoSimulatorModal);
    }

    // Submit log to backend (Transport)
    function submitTransportSimulation() {
      const username = document.getElementById('transport-username').value.trim() || '익명 참여자';

      if (currentTransportQuantities.distance < 0) {
        showToast('올바른 이동 거리를 입력해 주세요.', true);
        return;
      }

      const passengerKm = currentTransportQuantities.distance * currentTransportQuantities.people;
      sessionStats.items.public_transport = passengerKm;

      sendParticipation(username, (data) => {
        showToast(`참여 완료! 친환경 이동수단 실천 내역이 성공적으로 반영되었습니다.`);
      }, closeTransportSimulatorModal);
    }

    // Value counting animation (Odometer effect)
    function animateValue(element, start, end, duration) {
      if (!element) return;
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = progress * (2 - progress); // easeOutQuad
        const val = Math.floor(easeProgress * (end - start) + start);
        
        if (element.id === 'kpi-total-reduced-kg') {
          const kgVal = (easeProgress * (end - start) + start) / 1000;
          element.textContent = kgVal.toFixed(2) + " kgCO2eq";
        } else if (element.id === 'float-total-carbon') {
          element.textContent = val.toLocaleString() + " gCO2eq";
        } else if (element.id === 'kpi-pine-trees') {
          const pineVal = (easeProgress * (end - start) + start) / 6600;
          element.textContent = pineVal.toFixed(1) + "그루";
        } else if (element.id === 'kpi-car-km') {
          const carVal = (easeProgress * (end - start) + start) / 120;
          element.textContent = carVal.toFixed(1) + "km";
        } else if (element.id === 'kpi-total-participants' || element.id === 'float-participants' || element.id === 'kpi-upcycle-participants' || element.id === 'kpi-booth-participants') {
          element.textContent = val.toLocaleString() + "명";
        } else if (element.id === 'float-actions') {
          element.textContent = val.toLocaleString() + "건";
        } else if (element.id === 'kpi-transport-participants') {
          element.textContent = val.toLocaleString() + "명";
        } else if (element.id === 'kpi-total-distance') {
          element.textContent = val.toLocaleString() + " km";
        } else if (element.id === 'kpi-transport-reduced-carbon' || element.id === 'kpi-energy-reduced-carbon' || element.id === 'kpi-upcycle-reduced-carbon' || element.id === 'kpi-booth-reduced-carbon') {
          element.textContent = val.toLocaleString() + " gCO2eq";
        } else if (element.id === 'kpi-total-booth-area') {
          const areaVal = (easeProgress * (end - start) + start) / 10;
          element.textContent = areaVal.toFixed(1) + " ㎡";
        } else if (element.id === 'kpi-total-energy') {
          element.textContent = val.toLocaleString() + " kWh";
        } else if (element.id === 'kpi-total-energy-cost') {
          const costVal = val * 11;
          element.textContent = costVal.toLocaleString() + "원";
        } else if (element.id === 'kpi-total-banners') {
          const bannerVal = (easeProgress * (end - start) + start) / 10;
          element.textContent = bannerVal.toFixed(1) + "장";
        } else {
          element.textContent = val.toLocaleString() + "개";
        }
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    function updateDashboardUI(stats) {
      const hasAnyActionSubmitted = (stats.totalReducedCarbonGrams > 0 || (stats.items.reusable_cup > 0) || (stats.items.public_transport_km > 0) || (stats.items.renewable_energy > 0) || (stats.items.upcycled_keyring > 0) || (stats.items.upcycled_banner > 0) || (stats.items.paperless_booth > 0) || (stats.items.digital_signage > 0) || (stats.items.waste_recycling > 0) || (barrierFreeState && barrierFreeState.submitted) || (safetyLaborState && safetyLaborState.submitted) || (stakeholderState && stakeholderState.submitted) || venueEcologyState.submitted || localFoodState.submitted || localEconomyState.submitted || inclusionState.submitted || esgEduState.submitted || supportersState.submitted || donationState.submitted || knowledgeState.submitted || iso20121State.submitted || esgReportState.submitted || advisoryState.submitted);

      // 1. Show Floating dashboard bar
      const floatBar = document.getElementById('floatingDashboard');
      if (floatBar && hasAnyActionSubmitted) {
        floatBar.classList.remove('translate-y-20', 'opacity-0');
      }

      // 2. Toggle Left Column Action Card vs Guide Card
      const guideCard = document.getElementById('eco-guide-card');
      const wasteCard = document.getElementById('kpi-waste-card');
      const transportCard = document.getElementById('kpi-transport-card');
      const energyCard = document.getElementById('kpi-energy-card');
      const upcycleCard = document.getElementById('kpi-upcycle-card');
      const venueEcologyCard = document.getElementById('kpi-venue-ecology-card');
      const venueEcologyList = document.getElementById('kpi-venue-ecology-list');
      const venueEcologyFilename = document.getElementById('kpi-venue-ecology-filename');
      const barrierFreeCard = document.getElementById('kpi-barrier-free-card');
      const barrierFreeList = document.getElementById('kpi-barrier-free-list');

      if (venueEcologyState.submitted) {
        if (venueEcologyCard) venueEcologyCard.classList.remove('hidden');
        if (venueEcologyFilename) {
          venueEcologyFilename.textContent = venueEcologyState.fileName;
        }
        if (venueEcologyList) {
          venueEcologyList.innerHTML = '';
          const certLabels = {
            gseed: 'G-SEED (녹색건축)',
            leed: 'LEED (미국 친환경)',
            earthcheck: 'EarthCheck (마이스)',
            iso14001: 'ISO 14001 (환경경영)',
            iso20121: 'ISO 20121 (지속가능이벤트)',
            forest: '산림탄소상쇄 (행사형)'
          };
          venueEcologyState.checkedCerts.forEach(cert => {
            const badge = document.createElement('span');
            badge.className = 'bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1';
            const iconName = cert === 'forest' ? 'trees' : 'award';
            const colorClass = cert === 'forest' ? 'text-blue-500' : 'text-emerald-500';
            badge.innerHTML = `<i data-lucide="${iconName}" class="w-3 h-3 ${colorClass}"></i> ${certLabels[cert]}`;
            venueEcologyList.appendChild(badge);
          });
          lucide.createIcons();
        }
      } else {
        if (venueEcologyCard) venueEcologyCard.classList.add('hidden');
      }

      if (barrierFreeState.submitted) {
        if (barrierFreeCard) barrierFreeCard.classList.remove('hidden');
        if (barrierFreeList) {
          barrierFreeList.innerHTML = '';
          const bfLabels = {
            ramp: '무장애 이동 동선',
            desk: '저단 데스크 운영',
            facility: '장애인 편의시설',
            sign: '수어 및 실시간 자막',
            easy: '쉬운 언어 안내서',
            braille: '점자/음성 QR',
            helper: '보조요원/안내견'
          };
          barrierFreeState.checkedItems.forEach(item => {
            const badge = document.createElement('span');
            badge.className = 'bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1';
            badge.innerHTML = `<i data-lucide="check-circle-2" class="w-3 h-3 text-blue-500"></i> ${bfLabels[item]}`;
            barrierFreeList.appendChild(badge);
          });
          lucide.createIcons();
        }
      } else {
        if (barrierFreeCard) barrierFreeCard.classList.add('hidden');
      }

      // Update Safety & Fair Labor Outcome Card
      const safetyLaborCard = document.getElementById('kpi-safety-labor-card');
      const safetyLaborList = document.getElementById('kpi-safety-labor-list');
      const safetyLaborRate = document.getElementById('kpi-safety-labor-rate');

      if (safetyLaborState && safetyLaborState.submitted) {
        if (safetyLaborCard) safetyLaborCard.classList.remove('hidden');
        const scoreRate = (((safetyLaborState.checkedItems || []).length / 6) * 100).toFixed(1);
        if (safetyLaborRate) safetyLaborRate.textContent = `${scoreRate}%`;
        if (safetyLaborList) {
          safetyLaborList.innerHTML = '';
          const slLabels = {
            crowd: '군중밀집 스마트 관리',
            medical: '응급의료 & AED 배치',
            plan: '안전관리계획 사전심의',
            contract: '서면 근로계약 체결',
            rest: '휴게시간 & 전용휴게실',
            training: '사전 안전/인권 교육'
          };
          (safetyLaborState.checkedItems || []).forEach(item => {
            const badge = document.createElement('span');
            badge.className = 'bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1';
            badge.innerHTML = `<i data-lucide="shield-check" class="w-3 h-3 text-blue-500"></i> ${slLabels[item]}`;
            safetyLaborList.appendChild(badge);
          });
          lucide.createIcons();
        }
      } else {
        if (safetyLaborCard) safetyLaborCard.classList.add('hidden');
      }

      // Update Local Economy Outcome Card
      const localEconomyCard = document.getElementById('kpi-local-economy-card');
      if (localEconomyCard) {
        if (localEconomyState.submitted) {
          localEconomyCard.classList.remove('hidden');
          const amtText = document.getElementById('kpi-local-economy-amount-text');
          const userText = document.getElementById('kpi-local-economy-username-text');
          const detailsBox = document.getElementById('kpi-local-economy-details-box');
          const detailsText = document.getElementById('kpi-local-economy-details-text');
          if (amtText) amtText.textContent = `${localEconomyState.amount.toLocaleString()} 만원`;
          if (userText) userText.textContent = localEconomyState.username || sessionStats.username || '익명 참관객';
          if (detailsText && localEconomyState.details) {
            detailsText.textContent = localEconomyState.details;
            if (detailsBox) detailsBox.classList.remove('hidden');
          } else if (detailsBox) {
            detailsBox.classList.add('hidden');
          }
        } else {
          localEconomyCard.classList.add('hidden');
        }
      }

      // Update Local Food Outcome Card
      const localFoodCard = document.getElementById('kpi-local-food-card');
      if (localFoodCard) {
        if (localFoodState.submitted) {
          localFoodCard.classList.remove('hidden');
          const carbonText = document.getElementById('kpi-local-food-reduced-carbon');
          const amtText = document.getElementById('kpi-local-food-amount-text');
          const storeText = document.getElementById('kpi-local-food-store-text');
          const userText = document.getElementById('kpi-local-food-username-text');
          const detailsBox = document.getElementById('kpi-local-food-details-box');

          if (carbonText) carbonText.textContent = `${(localFoodState.reductionGrams / 1000).toFixed(3)} kgCO2eq`;
          if (amtText) amtText.textContent = `${localFoodState.amount.toLocaleString()}원`;
          if (storeText) storeText.textContent = localFoodState.store;
          if (userText) userText.textContent = localFoodState.username || sessionStats.username || '익명 실천자';
          
          if (detailsBox) detailsBox.classList.remove('hidden');
        } else {
          localFoodCard.classList.add('hidden');
        }
      }

      // Update Inclusion Outcome Card
      const inclusionCard = document.getElementById('kpi-inclusion-card');
      if (inclusionCard) {
        if (inclusionState.submitted) {
          inclusionCard.classList.remove('hidden');
          let totalP = 0;
          let count = 0;
          const tagsContainer = document.getElementById('kpi-inclusion-program-tags');
          if (tagsContainer) tagsContainer.innerHTML = '';
          inclusionState.programs.forEach(p => {
            if (p.name.trim() !== '') {
              count++;
              const pCount = parseInt(p.participants) || 0;
              totalP += pCount;
              if (tagsContainer) {
                const badge = document.createElement('span');
                badge.className = 'bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1';
                badge.innerHTML = `<i data-lucide="check-circle-2" class="w-3 h-3 text-blue-500"></i> ${p.name.trim()} (${pCount.toLocaleString()}명)`;
                tagsContainer.appendChild(badge);
              }
            }
          });
          const partText = document.getElementById('kpi-inclusion-participants-text');
          const countText = document.getElementById('kpi-inclusion-count-text');
          if (partText) partText.textContent = `${totalP.toLocaleString()}명`;
          if (countText) countText.textContent = `${count}개 활동`;
          lucide.createIcons();
        } else {
          inclusionCard.classList.add('hidden');
        }
      }

      // Update ESG Education Outcome Card
      const esgEduCard = document.getElementById('kpi-esg-edu-card');
      if (esgEduCard) {
        if (esgEduState.submitted) {
          esgEduCard.classList.remove('hidden');
          let totalP = 0;
          let count = 0;
          const tagsContainer = document.getElementById('kpi-esg-edu-program-tags');
          if (tagsContainer) tagsContainer.innerHTML = '';
          esgEduState.programs.forEach(p => {
            if (p.name.trim() !== '') {
              count++;
              const pCount = parseInt(p.participants) || 0;
              totalP += pCount;
              if (tagsContainer) {
                const badge = document.createElement('span');
                badge.className = 'bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1';
                badge.innerHTML = `<i data-lucide="graduation-cap" class="w-3 h-3 text-blue-500"></i> ${p.name.trim()} (${pCount.toLocaleString()}명)`;
                tagsContainer.appendChild(badge);
              }
            }
          });
          const partText = document.getElementById('kpi-esg-edu-participants-text');
          const countText = document.getElementById('kpi-esg-edu-count-text');
          if (partText) partText.textContent = `${totalP.toLocaleString()}명`;
          if (countText) countText.textContent = `${count}회 세션`;
          lucide.createIcons();
        } else {
          esgEduCard.classList.add('hidden');
        }
      }

      // Update Stakeholder Participation Outcome Card
      const stakeholderCard = document.getElementById('kpi-stakeholder-card');
      if (stakeholderCard) {
        if ((stakeholderState && stakeholderState.submitted) || pledgesState.length > 0) {
          stakeholderCard.classList.remove('hidden');

          let totalPeople = 0;
          pledgesState.forEach(p => {
            totalPeople += (parseInt(p.peopleCount) || 1);
          });

          const peopleCountEl = document.getElementById('kpi-stakeholder-people-count');
          if (peopleCountEl) peopleCountEl.textContent = `${totalPeople.toLocaleString()}명`;
        } else {
          stakeholderCard.classList.add('hidden');
        }
      }

      // Update Supporters Outcome Card
      const supportersCard = document.getElementById('kpi-supporters-card');
      if (supportersCard) {
        if (supportersState.submitted) {
          supportersCard.classList.remove('hidden');
          const userText = document.getElementById('kpi-supporters-username-text');
          const fileText = document.getElementById('kpi-supporters-filename-text');
          const detailsBox = document.getElementById('kpi-supporters-details-box');
          const detailsText = document.getElementById('kpi-supporters-details-text');
          if (userText) userText.textContent = supportersState.username || sessionStats.username || '청년 서포터즈';
          if (fileText) fileText.textContent = supportersState.fileName ? `${supportersState.fileName} (${supportersState.fileType.toUpperCase()})` : '파일 첨부됨';
          if (detailsText && supportersState.role) {
            detailsText.textContent = supportersState.role;
            if (detailsBox) detailsBox.classList.remove('hidden');
          } else if (detailsBox) {
            detailsBox.classList.add('hidden');
          }
        } else {
          supportersCard.classList.add('hidden');
        }
      }

      // Update Donation Outcome Card
      const donationCard = document.getElementById('kpi-donation-card');
      if (donationCard) {
        if (donationState.submitted) {
          donationCard.classList.remove('hidden');
          const amtText = document.getElementById('kpi-donation-amount-text');
          const targetText = document.getElementById('kpi-donation-target-text');
          const detailsBox = document.getElementById('kpi-donation-details-box');
          const detailsText = document.getElementById('kpi-donation-details-text');
          if (amtText) amtText.textContent = `${donationState.amount.toLocaleString()} 만원`;
          if (targetText) targetText.textContent = donationState.target || '미지정 기부처';
          if (detailsText && donationState.details) {
            detailsText.textContent = donationState.details;
            if (detailsBox) detailsBox.classList.remove('hidden');
          } else if (detailsBox) {
            detailsBox.classList.add('hidden');
          }
        } else {
          donationCard.classList.add('hidden');
        }
      }

      // Update Knowledge Sharing Outcome Card
      const knowledgeCard = document.getElementById('kpi-knowledge-sharing-card');
      if (knowledgeCard) {
        if (knowledgeState.submitted) {
          knowledgeCard.classList.remove('hidden');
          let totalP = 0;
          let count = 0;
          const tagsContainer = document.getElementById('kpi-knowledge-program-tags');
          if (tagsContainer) tagsContainer.innerHTML = '';
          knowledgeState.programs.forEach(p => {
            if (p.name.trim() !== '') {
              count++;
              const pCount = parseInt(p.participants) || 0;
              totalP += pCount;
              if (tagsContainer) {
                const badge = document.createElement('span');
                badge.className = 'bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1';
                const speakerStr = p.speaker.trim() ? ` (${p.speaker.trim()})` : '';
                badge.innerHTML = `<i data-lucide="heart-handshake" class="w-3 h-3 text-blue-500"></i> ${p.name.trim()}${speakerStr} [${pCount.toLocaleString()}명]`;
                tagsContainer.appendChild(badge);
              }
            }
          });
          const partText = document.getElementById('kpi-knowledge-participants-text');
          const countText = document.getElementById('kpi-knowledge-count-text');
          if (partText) partText.textContent = `${totalP.toLocaleString()}명`;
          if (countText) countText.textContent = `${count}개 강연`;
          lucide.createIcons();
        } else {
          knowledgeCard.classList.add('hidden');
        }
      }

      // Update ISO 20121 Outcome Card
      const iso20121Card = document.getElementById('kpi-iso20121-card');
      if (iso20121Card) {
        if (iso20121State.submitted) {
          iso20121Card.classList.remove('hidden');
          const fileText = document.getElementById('kpi-iso20121-filename');
          const typeText = document.getElementById('kpi-iso20121-filetype');
          const detailsBox = document.getElementById('kpi-iso20121-details-box');
          const certOrgText = document.getElementById('kpi-iso20121-cert-org-text');
          const userText = document.getElementById('kpi-iso20121-username-text');
          if (fileText) fileText.textContent = iso20121State.fileName || 'ISO_20121_Certificate.pdf';
          if (typeText) typeText.textContent = iso20121State.fileType ? `${iso20121State.fileType.toUpperCase()} 제출 완료` : '인증서 파일 제출';
          if (certOrgText) certOrgText.textContent = iso20121State.certOrg || '공식 인증 기관';
          if (userText) userText.textContent = iso20121State.username || sessionStats.username || '담당자';
          if (detailsBox) detailsBox.classList.remove('hidden');
        } else {
          iso20121Card.classList.add('hidden');
        }
      }
      // Update ESG Report Outcome Card
      const esgReportCard = document.getElementById('kpi-esg-report-card');
      if (esgReportCard) {
        if (esgReportState.submitted) {
          esgReportCard.classList.remove('hidden');
          const fileText = document.getElementById('kpi-esg-report-filename');
          const titleText = document.getElementById('kpi-esg-report-title-text');
          const userText = document.getElementById('kpi-esg-report-username-text');
          const detailsBox = document.getElementById('kpi-esg-report-details-box');
          if (fileText) fileText.textContent = esgReportState.fileName || 'ESG_Outcome_Report.pdf';
          if (titleText) titleText.textContent = esgReportState.title || '연간 ESG 성과 보고서';
          if (userText) userText.textContent = esgReportState.username || sessionStats.username || '담당자';
          if (detailsBox) detailsBox.classList.remove('hidden');
        } else {
          esgReportCard.classList.add('hidden');
        }
      }

      // Update Advisory Committee Outcome Card
      const advisoryCard = document.getElementById('kpi-advisory-card');
      if (advisoryCard) {
        if (advisoryState.submitted) {
          advisoryCard.classList.remove('hidden');
          const locText = document.getElementById('kpi-advisory-location-text');
          const dtText = document.getElementById('kpi-advisory-datetime-text');
          const summaryText = document.getElementById('kpi-advisory-summary-text');
          const userText = document.getElementById('kpi-advisory-username-text');
          const detailsBox = document.getElementById('kpi-advisory-details-box');
          const photoContainer = document.getElementById('kpi-advisory-photo-container');
          const photoPreview = document.getElementById('kpi-advisory-photo-preview');

          if (locText) locText.textContent = advisoryState.location || '회의 장소 미입력';
          if (dtText) dtText.textContent = advisoryState.datetime || '회의 일시 미입력';
          if (summaryText) summaryText.textContent = advisoryState.summary || '자문 위원회 주요 안건 기록 없음';
          if (userText) userText.textContent = advisoryState.username || sessionStats.username || '기록자';
          
          if (detailsBox) detailsBox.classList.remove('hidden');

          if (advisoryState.previewUrl) {
            if (photoPreview) photoPreview.src = advisoryState.previewUrl;
            if (photoContainer) photoContainer.classList.remove('hidden');
          } else {
            if (photoContainer) photoContainer.classList.add('hidden');
          }
        } else {
          advisoryCard.classList.add('hidden');
        }
      }

      if (hasAnyActionSubmitted) {
        if (guideCard) guideCard.classList.add('hidden');
      } else {
        if (guideCard) guideCard.classList.remove('hidden');
      }

      // Hide or show specific cards based on their values
      const ecoTotal = (stats.items.reusable_cup || 0) + (stats.items.reusable_plate || 0) + (stats.items.reusable_bowl || 0) + (stats.items.reusable_fork || 0);
      if (ecoTotal > 0) {
        if (wasteCard) wasteCard.classList.remove('hidden');
      } else {
        if (wasteCard) wasteCard.classList.add('hidden');
      }

      if ((stats.items.public_transport || 0) > 0) {
        if (transportCard) transportCard.classList.remove('hidden');
      } else {
        if (transportCard) transportCard.classList.add('hidden');
      }

      if ((stats.items.renewable_energy || 0) > 0) {
        if (energyCard) energyCard.classList.remove('hidden');
      } else {
        if (energyCard) energyCard.classList.add('hidden');
      }

      if ((stats.items.upcycled_keyring || 0) > 0 || (stats.items.upcycled_banner || 0) > 0) {
        if (upcycleCard) upcycleCard.classList.remove('hidden');
      } else {
        if (upcycleCard) upcycleCard.classList.add('hidden');
      }

      const boothCard = document.getElementById('kpi-booth-card');
      if ((stats.items.paper_booth || 0) > 0) {
        if (boothCard) boothCard.classList.remove('hidden');
      } else {
        if (boothCard) boothCard.classList.add('hidden');
      }

      const signageCard = document.getElementById('kpi-signage-card');
      if ((stats.items.digital_signage || 0) > 0) {
        if (signageCard) signageCard.classList.remove('hidden');
      } else {
        if (signageCard) signageCard.classList.add('hidden');
      }

      // Calculate total item quantities
      const totalItemsCount = ecoTotal;
      const totalDisplayItems = totalItemsCount + (stats.items.public_transport || 0);

      // 3. Animate total reduced carbon & offset calculations
      animateValue(document.getElementById('kpi-total-reduced-kg'), lastStats.totalReducedCarbonGrams, stats.totalReducedCarbonGrams, 800);
      animateValue(document.getElementById('float-total-carbon'), lastStats.totalReducedCarbonGrams, stats.totalReducedCarbonGrams, 800);
      animateValue(document.getElementById('kpi-pine-trees'), lastStats.totalReducedCarbonGrams, stats.totalReducedCarbonGrams, 800);
      animateValue(document.getElementById('kpi-car-km'), lastStats.totalReducedCarbonGrams, stats.totalReducedCarbonGrams, 800);

      // 4. Animate participants & actions
      animateValue(document.getElementById('kpi-total-participants'), lastStats.totalParticipants, stats.totalParticipants, 800);
      animateValue(document.getElementById('float-actions'), lastStats.totalActions || 0, stats.totalActions || 0, 800);

      // 5. Animate total items count
      const lastTotalItems = (lastStats.reusable_cup || 0) + (lastStats.reusable_plate || 0) + (lastStats.reusable_bowl || 0) + (lastStats.reusable_fork || 0);
      animateValue(document.getElementById('kpi-total-items'), lastTotalItems, totalItemsCount, 800);

      // 5-2. Animate waste reduced carbon
      const wasteReducedCarbon = (stats.items.reusable_cup || 0) * 52 +
                                 (stats.items.reusable_plate || 0) * 37 +
                                 (stats.items.reusable_bowl || 0) * 60 +
                                 (stats.items.reusable_fork || 0) * 9;
      const lastWasteReducedCarbon = (lastStats.reusable_cup || 0) * 52 +
                                     (lastStats.reusable_plate || 0) * 37 +
                                     (lastStats.reusable_bowl || 0) * 60 +
                                     (lastStats.reusable_fork || 0) * 9;
      animateValue(document.getElementById('kpi-waste-reduced-carbon'), lastWasteReducedCarbon, wasteReducedCarbon, 800);

      // 6. Animate detailed items
      animateValue(document.getElementById('kpi-cup-count'), lastStats.reusable_cup || 0, stats.items.reusable_cup || 0, 800);
      animateValue(document.getElementById('kpi-plate-count'), lastStats.reusable_plate || 0, stats.items.reusable_plate || 0, 800);
      animateValue(document.getElementById('kpi-bowl-count'), lastStats.reusable_bowl || 0, stats.items.reusable_bowl || 0, 800);
      animateValue(document.getElementById('kpi-fork-count'), lastStats.reusable_fork || 0, stats.items.reusable_fork || 0, 800);

      // 7. Animate Transport details
      const transportReducedCarbon = (stats.items.public_transport || 0) * TRANSPORT_COEFFICIENT;
      const lastTransportReducedCarbon = (lastStats.public_transport || 0) * TRANSPORT_COEFFICIENT;
      animateValue(document.getElementById('kpi-total-distance'), lastStats.public_transport || 0, stats.items.public_transport || 0, 800);
      animateValue(document.getElementById('kpi-transport-participants'), lastStats.public_transport > 0 ? 1 : 0, transportParticipantsCount, 800);
      animateValue(document.getElementById('kpi-transport-reduced-carbon'), lastTransportReducedCarbon, transportReducedCarbon, 800);

      // 8. Animate Energy details
      const energyReducedCarbon = (stats.items.renewable_energy || 0) * ENERGY_COEFFICIENT;
      const lastEnergyReducedCarbon = (lastStats.renewable_energy || 0) * ENERGY_COEFFICIENT;
      animateValue(document.getElementById('kpi-total-energy'), lastStats.renewable_energy || 0, stats.items.renewable_energy || 0, 800);
      animateValue(document.getElementById('kpi-energy-reduced-carbon'), lastEnergyReducedCarbon, energyReducedCarbon, 800);
      animateValue(document.getElementById('kpi-total-energy-cost'), lastStats.renewable_energy || 0, stats.items.renewable_energy || 0, 800);

      // 9. Animate Upcycle details
      const keyringCount = stats.items.upcycled_keyring || 0;
      const lastKeyringCount = lastStats.upcycled_keyring || 0;
      const bannerCount = stats.items.upcycled_banner || 0;
      const totalUpcycleGrams = (keyringCount * 12) + (bannerCount * 6280);
      const lastTotalUpcycleGrams = (lastKeyringCount * 12) + ((lastStats.upcycled_banner || 0) * 6280);
      animateValue(document.getElementById('kpi-upcycle-reduced-carbon'), lastTotalUpcycleGrams, totalUpcycleGrams, 800);
      animateValue(document.getElementById('kpi-upcycle-participants'), lastStats.keyringParticipants || 0, stats.keyringParticipants || 0, 800);
      animateValue(document.getElementById('kpi-total-keyrings'), lastStats.upcycled_keyring || 0, keyringCount, 800);
      animateValue(document.getElementById('kpi-total-banners'), (lastStats.upcycled_banner || 0) * 10, bannerCount * 10, 800);

      // 9-2. Animate Paper Booth details
      animateValue(document.getElementById('kpi-total-booth-area'), (lastStats.paper_booth || 0) * 10, (stats.items.paper_booth || 0) * 10, 800);
      animateValue(document.getElementById('kpi-booth-participants'), lastStats.paperBoothParticipants || 0, stats.paperBoothParticipants || 0, 800);
      
      const boothReduced = (stats.items.paper_booth || 0) * 10125;
      const lastBoothReduced = (lastStats.paper_booth || 0) * 10125;
      animateValue(document.getElementById('kpi-booth-reduced-carbon'), lastBoothReduced, boothReduced, 800);

      // 9-3. Animate Digital Signage details
      const signageReduced = stats.items.digital_signage || 0;
      const lastSignageReduced = lastStats.digital_signage || 0;
      animateValue(document.getElementById('kpi-signage-reduced-carbon'), lastSignageReduced, signageReduced, 800);
      
      const papersSaved = (currentSignageQuantities.paper_a4 || 0) + (currentSignageQuantities.paper_brochure || 0) + (currentSignageQuantities.paper_poster || 0);
      const lastPapersSaved = lastStats.papersSaved || 0;
      animateValue(document.getElementById('kpi-total-paper-saved'), lastPapersSaved, papersSaved, 800);
      
      const signageParticipants = (stats.items.digital_signage || 0) > 0 ? (stats.signageParticipants || stats.totalParticipants) : 0;
      const lastSignageParticipants = lastStats.digital_signage > 0 ? 1 : 0;
      animateValue(document.getElementById('kpi-signage-participants'), lastSignageParticipants, signageParticipants, 800);

      // Update cached values
      lastStats = {
        totalReducedCarbonGrams: stats.totalReducedCarbonGrams,
        totalParticipants: stats.totalParticipants,
        totalActions: stats.totalActions || 0,
        reusable_cup: stats.items.reusable_cup || 0,
        reusable_plate: stats.items.reusable_plate || 0,
        reusable_bowl: stats.items.reusable_bowl || 0,
        reusable_fork: stats.items.reusable_fork || 0,
        public_transport: stats.items.public_transport || 0,
        renewable_energy: stats.items.renewable_energy || 0,
        upcycled_keyring: stats.items.upcycled_keyring || 0,
        upcycled_banner: stats.items.upcycled_banner || 0,
        paper_booth: stats.items.paper_booth || 0,
        digital_signage: stats.items.digital_signage || 0,
        papersSaved: papersSaved,
        keyringReducedCarbonGrams: stats.keyringReducedCarbonGrams || 0,
        keyringParticipants: stats.keyringParticipants || 0,
        paperBoothParticipants: stats.paperBoothParticipants || 0,
        signageParticipants: stats.signageParticipants || 0
      };
    }

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

    function addKnowledgeRow() {
      knowledgeState.programs.push({ name: '', speaker: '', participants: '' });
      renderKnowledgeProgramRows();
    }

    function removeKnowledgeRow(index) {
      if (knowledgeState.programs.length > 1) {
        knowledgeState.programs.splice(index, 1);
        renderKnowledgeProgramRows();
      } else {
        showToast('최소 1개 이상의 강연이 필요합니다.', true);
      }
    }

    function submitKnowledgeSharing() {
      const username = document.getElementById('knowledge-username').value.trim();
      if (username) sessionStats.username = username;

      let totalParticipants = 0;
      let validPrograms = 0;

      knowledgeState.programs.forEach(p => {
        if (p.name.trim() !== '') {
          validPrograms++;
          totalParticipants += (parseInt(p.participants) || 0);
        }
      });

      if (validPrograms === 0) {
        showToast('최소 하나의 강연 제목을 입력해 주세요.', true);
        return;
      }

      knowledgeState.submitted = true;

      // Update Card 08 Badge
      const label = document.getElementById('badge-knowledge-label');
      const val = document.getElementById('badge-knowledge-value');
      const iconContainer = document.getElementById('badge-knowledge-icon-container');
      const icon = document.getElementById('badge-knowledge-icon');

      if (label && val) {
        label.textContent = `재능 기부 강연`;
        val.textContent = `${validPrograms}개 강연 (${totalParticipants.toLocaleString()}명)`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-blue-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-blue-50', 'text-blue-655');
        iconContainer.classList.add('bg-[#0f2042]', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      closeKnowledgeSharingModal();
      updateDashboardUI(sessionStats);
      showToast(`지식 나눔 강연 ${validPrograms}건 (${totalParticipants.toLocaleString()}명 수강) 등록이 완료되었습니다.`);
    }

    // Stakeholder Participation Functions (GRI 2-29)
    let pledgesState = [
      { id: 1, role: '도민·참관객', peopleCount: 15, time: '10분 전' },
      { id: 2, role: '연사·발표자', peopleCount: 5, time: '25분 전' },
      { id: 3, role: '행사 스태프', peopleCount: 20, time: '1시간 전' }
    ];

    let stakeholderState = {
      submitted: true
    };

    function openStakeholderFeedbackModal() {
      const modal = document.getElementById('stakeholderFeedbackModal');
      if (!modal) return;

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.querySelector('div')) modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeStakeholderFeedbackModal() {
      const modal = document.getElementById('stakeholderFeedbackModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      if (modal.querySelector('div')) modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function submitPledge() {
      const role = document.getElementById('pledge-role')?.value || '도민·참관객';
      const peopleInput = parseInt(document.getElementById('pledge-people-count')?.value) || 1;

      const newPledge = {
        id: Date.now(),
        role: role,
        peopleCount: peopleInput,
        time: '방금 전'
      };

      pledgesState.unshift(newPledge);
      stakeholderState.submitted = true;

      // Calculate total participants
      let sumPeople = 0;
      pledgesState.forEach(p => {
        sumPeople += (parseInt(p.peopleCount) || 1);
      });

      // Update Card 05 Badge
      const label = document.getElementById('badge-stakeholder-label');
      const val = document.getElementById('badge-stakeholder-value');
      const iconContainer = document.getElementById('badge-stakeholder-icon-container');
      const icon = document.getElementById('badge-stakeholder-icon');

      if (label && val) {
        label.textContent = '시민 참여 집계';
        val.textContent = `누적 ${sumPeople}명 참여`;
        val.classList.remove('text-slate-800');
        val.classList.add('text-indigo-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.add('bg-indigo-600', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      updateDashboardUI(sessionStats);
      showToast(`ESG 실천 참여 인원이 등록되었습니다! (총 ${peopleInput}명 누적 반영) 💚`);
      closeStakeholderFeedbackModal();
    }

    window.openStakeholderFeedbackModal = openStakeholderFeedbackModal;
    window.closeStakeholderFeedbackModal = closeStakeholderFeedbackModal;
    window.submitPledge = submitPledge;

    // Advisory Minutes Modal Functions
    let advisoryMinutesState = {
      date: '2026년 7월 20일',
      members: '',
      summary: '',
      fileName: '2026_MICE_이해관계자_자문단_회의록_및_의견수렴보고서.pdf',
      submitted: false
    };

    function openAdvisoryMinutesModal() {
      const modal = document.getElementById('advisoryMinutesModal');
      if (!modal) return;
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.querySelector('div')) modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeAdvisoryMinutesModal() {
      const modal = document.getElementById('advisoryMinutesModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      if (modal.querySelector('div')) modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function handleAdvisoryMinFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        advisoryMinutesState.fileName = file.name;
        const nameEl = document.getElementById('advisory-min-filename');
        if (nameEl) nameEl.textContent = file.name;
      }
    }

    function submitAdvisoryMinutes() {
      advisoryMinutesState.submitted = true;

      // Update Card 06 Badge
      const label = document.getElementById('badge-advisory-min-label');
      const val = document.getElementById('badge-advisory-min-value');
      const iconContainer = document.getElementById('badge-advisory-min-icon-container');
      const icon = document.getElementById('badge-advisory-min-icon');

      if (label && val) {
        label.textContent = '자문단 회의록 공시';
        val.textContent = '회의록 첨부 완료';
        val.classList.remove('text-slate-800');
        val.classList.add('text-indigo-600');
      }
      if (iconContainer && icon) {
        iconContainer.classList.remove('bg-indigo-50', 'text-indigo-655');
        iconContainer.classList.add('bg-indigo-600', 'text-white');
        icon.setAttribute('data-lucide', 'check-circle-2');
        lucide.createIcons();
      }

      showToast('이해관계자 자문단 회의록 및 의견 수렴 보고서 공시가 성공적으로 제출되었습니다.');
      closeAdvisoryMinutesModal();
    }

    window.openAdvisoryMinutesModal = openAdvisoryMinutesModal;
    window.closeAdvisoryMinutesModal = closeAdvisoryMinutesModal;
    window.handleAdvisoryMinFileChange = handleAdvisoryMinFileChange;
    window.submitAdvisoryMinutes = submitAdvisoryMinutes;

    // Close modal on escape keypress
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeDetailModal();
        closeEcoSimulatorModal();
        closeTransportSimulatorModal();
        closeEnergySimulatorModal();
        closeUpcycleSimulatorModal();
        closePaperBoothSimulatorModal();
        closeSignageSimulatorModal();
        closeWasteRecyclingModal();
        closeBarrierFreeModal();
        closeSafetyLaborModal();
        closeLocalEconomyModal();
        closeInclusionModal();
        closeEsgEducationModal();
        closeSupportersModal();
        closeDonationModal();
        closeKnowledgeSharingModal();
        closeIso20121Modal();
        closeEsgReportModal();
        closeAdvisoryModal();
        closeStakeholderFeedbackModal();
        closeAdvisoryMinutesModal();
      }
    });