// Modal Controls, UI Helpers & Toast Notifications
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
 
      fetch('/api/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          sessionStats.username = username;
          sessionUsernames.add(username);
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
        } else {
          showToast(data.error || '이력 저장에 실패했습니다.', true);
        }
      })
      .catch(err => {
        console.error('Fetch err:', err);
        showToast('서버 통신 오류가 발생했습니다.', true);
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
      
      const items = ['ramp', 'desk', 'facility', 'sign', 'easy', 'braille', 'helper'];
      items.forEach(item => {
        document.getElementById(`bf-${item}`).checked = barrierFreeState.checkedItems.includes(item);
      });
      
      document.getElementById('barrier-free-username').value = sessionStats.username || '';
      checkBarrierFreeSubmitStatus();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closeBarrierFreeModal() {
      const modal = document.getElementById('barrierFreeModal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function checkBarrierFreeSubmitStatus() {
      const items = ['ramp', 'desk', 'facility', 'sign', 'easy', 'braille', 'helper'];
      const anyChecked = items.some(item => document.getElementById(`bf-${item}`).checked);
      const btn = document.getElementById('btn-submit-barrier-free');

      if (anyChecked) {
        btn.disabled = false;
        btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
        btn.classList.add('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
      } else {
        btn.disabled = true;
        btn.classList.remove('bg-[#0f2042]', 'hover:bg-blue-900', 'text-white');
        btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
      }
    }

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
      
      // Load existing session quantities
      currentSignageQuantities = JSON.parse(localStorage.getItem('mice_signage_quantities')) || {
        paper_a4: 0,
        paper_brochure: 0,
        paper_poster: 0,
        views: 0,
        hours: 0,
        is_renewable: false
      };
      
      document.getElementById('signage-username').value = sessionStats.username || '';
      document.getElementById('qty-signage-paper-a4').value = currentSignageQuantities.paper_a4 || 0;
      document.getElementById('qty-signage-paper-brochure').value = currentSignageQuantities.paper_brochure || 0;
      document.getElementById('qty-signage-paper-poster').value = currentSignageQuantities.paper_poster || 0;
      document.getElementById('qty-signage-views').value = currentSignageQuantities.views || 0;
      document.getElementById('qty-signage-hours').value = currentSignageQuantities.hours || 0;
      document.getElementById('signage-renewable').checked = currentSignageQuantities.is_renewable || false;
      
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

