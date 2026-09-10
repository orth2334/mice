/**
 * MICE ESG Platform - Governance (G) Domain Modals
 * Covers: ESG Report, ISO 20121, Advisory Committee, Detail Modal, Stakeholder Feedback, ESG Disclosure, Advisory Minutes
 */
(function() {
  'use strict';

    // ==========================================
    // ESG REPORT MODAL JS (ESG 성과 보고서 PDF 첨부)
    // ==========================================
    let esgReportState = {
      submitted: false,
      username: '',
      title: '',
      fileName: ''
    };
    let esgDisclosureState = {
      submitted: false,
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
    let pledgesState = [];

    let stakeholderState = {
      submitted: false
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
      const role = document.getElementById('pledge-role')?.value || '일반 참관객';
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


  // Export states to window
  window.esgReportState = esgReportState;
  window.iso20121State = iso20121State;
  window.advisoryState = advisoryState;
  window.stakeholderState = stakeholderState;
  window.pledgesState = pledgesState;
  window.esgDisclosureState = esgDisclosureState;
  window.advisoryMinutesState = advisoryMinutesState;

  // Auto-exported modal functions to window
  window.updateEsgReportFileUI = updateEsgReportFileUI;
  window.updateIso20121FileUI = updateIso20121FileUI;
  window.updateAdvisoryFileUI = updateAdvisoryFileUI;
  window.closeDetailModal = closeDetailModal;
  window.addKnowledgeRow = addKnowledgeRow;
  window.removeKnowledgeRow = removeKnowledgeRow;
  window.submitKnowledgeSharing = submitKnowledgeSharing;
})();
