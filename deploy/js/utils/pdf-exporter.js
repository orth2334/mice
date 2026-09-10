/**
 * MICE ESG Platform - PDF Report Exporter & Preview Engine
 */
(function() {
  'use strict';

    // PDF Report Preview & Export Functions
    function openPdfReportModal() {
      const modal = document.getElementById('pdfReportModal');
      if (!modal) return;

      updatePdfReportData();

      modal.style.display = 'flex';
      modal.style.pointerEvents = 'auto';
      modal.classList.remove('hidden');

      // Reset scroll position to top
      const scrollables = modal.querySelectorAll('.overflow-y-auto');
      scrollables.forEach(el => el.scrollTop = 0);
      modal.scrollTop = 0;

      setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.querySelector('div')) modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    }

    function closePdfReportModal() {
      const modal = document.getElementById('pdfReportModal');
      if (!modal) return;
      modal.style.pointerEvents = 'none';
      modal.classList.add('opacity-0');
      if (modal.querySelector('div')) modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }, 300);
    }

    function updatePdfReportData() {
      const now = new Date();
      const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;
      const dateEl = document.getElementById('pdf-report-date');
      if (dateEl) dateEl.textContent = dateStr;

      if (typeof recalculateSessionTotalCarbon === 'function') {
        recalculateSessionTotalCarbon();
      }

      let localFoodGrams = 0;
      if (window.localFoodState && window.localFoodState.submitted) {
        localFoodGrams = window.localFoodState.reductionGrams || Math.round((window.localFoodState.carbonReduction || 0.172) * 1000);
      }

      const totalGrams = (sessionStats && typeof sessionStats.totalReducedCarbonGrams === 'number')
        ? (sessionStats.totalReducedCarbonGrams + localFoodGrams)
        : localFoodGrams;

      const totalKg = (totalGrams / 1000).toFixed(2);
      const treeCount = (totalGrams / 6600).toFixed(1);
      const carKm = (totalGrams / 120).toFixed(1);

      // Update emission factor compliance in PDF report
      if (window.EmissionFactors) {
        const p = window.EmissionFactors.getActivePresetInfo();
        const pdfEf = document.getElementById('pdf-ef-source-text');
        if (pdfEf) pdfEf.textContent = `${p.name} (${p.source})`;
      }

      const totalCarbonEl = document.getElementById('pdf-total-carbon');
      if (totalCarbonEl) totalCarbonEl.innerHTML = `${totalKg} <span class="text-xs font-semibold text-emerald-300">kgCO2eq</span>`;

      const treeEl = document.getElementById('pdf-tree-effect');
      if (treeEl) treeEl.innerHTML = `${treeCount} <span class="text-xs font-semibold text-emerald-300">그루/년</span>`;

      const carEl = document.getElementById('pdf-car-effect');
      if (carEl) carEl.innerHTML = `${carKm} <span class="text-xs font-semibold text-emerald-300">km</span>`;

      const items = (sessionStats && sessionStats.items) ? sessionStats.items : {};
      const totalReusable = (items.reusable_cup || 0) + (items.reusable_plate || 0) + (items.reusable_bowl || 0) + (items.reusable_fork || 0);
      if (document.getElementById('pdf-e-reusable')) document.getElementById('pdf-e-reusable').textContent = `${totalReusable.toLocaleString()} 개`;
      if (document.getElementById('pdf-e-energy')) document.getElementById('pdf-e-energy').textContent = `${(items.renewable_energy || 0).toLocaleString()} kWh`;
      if (document.getElementById('pdf-e-transport')) document.getElementById('pdf-e-transport').textContent = `${((items.public_transport || 0) + (items.public_transport_km || 0)).toLocaleString()} km`;
      if (document.getElementById('pdf-e-upcycle')) document.getElementById('pdf-e-upcycle').textContent = `${((items.upcycled_keyring || 0) + (items.upcycled_banner || 0)).toLocaleString()} 개`;
      if (document.getElementById('pdf-e-paperbooth')) document.getElementById('pdf-e-paperbooth').textContent = `${(items.paper_booth || 0).toLocaleString()} ㎡`;

      if (document.getElementById('pdf-e-localfood')) {
        const isFoodSubmitted = window.localFoodState && window.localFoodState.submitted;
        const foodElem = document.getElementById('pdf-e-localfood');
        if (isFoodSubmitted) {
          const amt = (window.localFoodState.amount || 0).toLocaleString();
          const kg = ((window.localFoodState.reductionGrams || localFoodGrams) / 1000).toFixed(2);
          foodElem.textContent = `${amt}원 (${kg}kg 감축)`;
          foodElem.className = 'text-emerald-700 font-bold ml-1 flex-shrink-0';
        } else {
          foodElem.textContent = '0 원';
          foodElem.className = 'text-slate-900 font-bold ml-1 flex-shrink-0';
        }
      }

      const isWasteSubmitted = window.wasteRecyclingState && window.wasteRecyclingState.submitted;
      const recyclingRate = isWasteSubmitted ? (window.wasteRecyclingState.recyclingRate || 0) : 0;
      const recyclingEl = document.getElementById('pdf-e-recycling');
      if (recyclingEl) {
        recyclingEl.textContent = `${recyclingRate}%`;
        recyclingEl.className = isWasteSubmitted ? 'text-emerald-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      const isBarrierSubmitted = window.barrierFreeState && window.barrierFreeState.submitted;
      const barrierScore = isBarrierSubmitted 
        ? (((window.barrierFreeState.checkedItems?.length || 0) / 7) * 100).toFixed(0) 
        : 0;
      const barrierEl = document.getElementById('pdf-s-barrier');
      if (barrierEl) {
        barrierEl.textContent = `${barrierScore}%`;
        barrierEl.className = isBarrierSubmitted ? 'text-blue-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      const isSafetySubmitted = window.safetyLaborState && window.safetyLaborState.submitted;
      const safetyEl = document.getElementById('pdf-s-safety');
      if (safetyEl) {
        safetyEl.textContent = isSafetySubmitted ? '수립 완료 (0건 사고)' : '미수립';
        safetyEl.className = isSafetySubmitted ? 'text-blue-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      let totalPledgeHeadcount = 0;
      if (window.pledgesState && window.pledgesState.length > 0) {
        window.pledgesState.forEach(p => totalPledgeHeadcount += (parseInt(p.peopleCount) || 1));
      }
      const pledgeEl = document.getElementById('pdf-s-pledge');
      if (pledgeEl) {
        pledgeEl.textContent = `${totalPledgeHeadcount} 명`;
        pledgeEl.className = totalPledgeHeadcount > 0 ? 'text-blue-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      let knowledgeProgramsCount = 0;
      if (window.knowledgeState && window.knowledgeState.submitted && window.knowledgeState.programs) {
        knowledgeProgramsCount = window.knowledgeState.programs.filter(p => p.name && p.name.trim() !== '').length;
      }
      const knowledgeEl = document.getElementById('pdf-s-knowledge');
      if (knowledgeEl) {
        knowledgeEl.textContent = `${knowledgeProgramsCount} 건`;
        knowledgeEl.className = knowledgeProgramsCount > 0 ? 'text-blue-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      if (document.getElementById('pdf-s-localeconomy')) {
        const isEconomySubmitted = window.localEconomyState && window.localEconomyState.submitted;
        const economyElem = document.getElementById('pdf-s-localeconomy');
        if (isEconomySubmitted) {
          const amt = (window.localEconomyState.amount || 0).toLocaleString();
          economyElem.textContent = `${amt} 만원`;
          economyElem.className = 'text-blue-700 font-bold ml-1 flex-shrink-0';
        } else {
          economyElem.textContent = '0 만원';
          economyElem.className = 'text-slate-900 font-bold ml-1 flex-shrink-0';
        }
      }

      if (document.getElementById('pdf-s-education')) {
        const isEduSubmitted = (window.esgEduState && window.esgEduState.submitted) || (window.inclusionState && window.inclusionState.submitted);
        const eduElem = document.getElementById('pdf-s-education');
        eduElem.textContent = isEduSubmitted ? '실천 완료' : '미제출';
        eduElem.className = isEduSubmitted ? 'text-blue-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      if (document.getElementById('pdf-s-creators')) {
        const isSupportersSubmitted = window.supportersState && window.supportersState.submitted;
        const elem = document.getElementById('pdf-s-creators');
        elem.textContent = isSupportersSubmitted ? '제출 완료' : '미제출';
        elem.className = isSupportersSubmitted ? 'text-blue-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      if (document.getElementById('pdf-g-iso')) {
        const isIso = window.iso20121State && window.iso20121State.submitted;
        const elem = document.getElementById('pdf-g-iso');
        elem.textContent = isIso ? '완료 (100%)' : '미완료';
        elem.className = isIso ? 'text-indigo-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }
      if (document.getElementById('pdf-g-advisory')) {
        const isAdvisory = window.advisoryMinutesState && window.advisoryMinutesState.submitted;
        const elem = document.getElementById('pdf-g-advisory');
        elem.textContent = isAdvisory ? '공시 완료' : '미공시';
        elem.className = isAdvisory ? 'text-indigo-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }
      if (document.getElementById('pdf-g-disclosure')) {
        const isDisclosure = window.esgDisclosureState && window.esgDisclosureState.submitted;
        const elem = document.getElementById('pdf-g-disclosure');
        elem.textContent = isDisclosure ? '구축 완료' : '미구축';
        elem.className = isDisclosure ? 'text-indigo-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }
      if (document.getElementById('pdf-g-report')) {
        const isReport = window.esgReportState && window.esgReportState.submitted;
        const elem = document.getElementById('pdf-g-report');
        elem.textContent = isReport ? '등록 완료' : '미등록';
        elem.className = isReport ? 'text-indigo-700 font-bold ml-1 flex-shrink-0' : 'text-slate-900 font-bold ml-1 flex-shrink-0';
      }

      const certContainer = document.getElementById('pdf-cert-tags');
      if (certContainer) {
        const certs = window.venueEcologyState?.checkedCerts || [];
        const certNames = {
          gseed: 'G-SEED (녹색건축인증)',
          leed: 'LEED (미국 친환경인증)',
          earthcheck: 'EarthCheck (마이스인증)',
          iso14001: 'ISO 14001 (환경경영)',
          iso20121: 'ISO 20121 (지속가능경영)',
          forest: '산림탄소상쇄 (행사형)'
        };

        if (certs.length === 0) {
          certContainer.innerHTML = `<span class="text-[10px] text-slate-400 font-medium">제출된 인증서가 없습니다. (카드를 클릭하여 친환경 인증을 등록할 수 있습니다)</span>`;
        } else {
          certContainer.innerHTML = certs.map(c => 
            `<span class="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-md">✓ ${certNames[c] || c}</span>`
          ).join('');
        }
      }
    }

    function downloadPdfReport() {
      const originalEl = document.getElementById('pdf-report-document');
      if (!originalEl) return;

      showToast('MUREPA KOREA ESG PDF 보고서를 생성 중입니다... 📄');

      const currentScrollX = window.scrollX;
      const currentScrollY = window.scrollY;

      // Attach wrapper to document.documentElement to bypass body max-w-7xl mx-auto centering
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position: fixed !important; top: 0px !important; left: 0px !important; width: 794px !important; margin: 0px !important; padding: 0px !important; background: #ffffff !important; z-index: 99999999 !important; transform: none !important;';

      const clone = originalEl.cloneNode(true);
      clone.id = 'pdf-report-clone';
      clone.style.cssText = 'margin: 0px !important; width: 794px !important; max-width: 794px !important; min-width: 794px !important; box-shadow: none !important; border: none !important; border-radius: 0px !important; transform: none !important; background: #ffffff !important;';

      wrapper.appendChild(clone);
      document.documentElement.appendChild(wrapper);

      window.scrollTo(0, 0);

      const opt = {
        margin: [5, 5, 5, 5],
        filename: `MUREPA_KOREA_MICE_ESG_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          x: 0,
          y: 0,
          width: 794,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      setTimeout(() => {
        if (window.html2pdf) {
          html2pdf().set(opt).from(clone).save().then(() => {
            if (document.documentElement.contains(wrapper)) document.documentElement.removeChild(wrapper);
            window.scrollTo(currentScrollX, currentScrollY);
            showToast('MUREPA KOREA ESG PDF 성과 보고서 다운로드가 완료되었습니다! 🎉');
          }).catch(err => {
            console.error('PDF Export Error:', err);
            if (document.documentElement.contains(wrapper)) document.documentElement.removeChild(wrapper);
            window.scrollTo(currentScrollX, currentScrollY);
            window.print();
          });
        } else {
          if (document.documentElement.contains(wrapper)) document.documentElement.removeChild(wrapper);
          window.scrollTo(currentScrollX, currentScrollY);
          window.print();
        }
      }, 150);
    }

    function printPdfReport() {
      window.print();
    }

    window.openPdfReportModal = openPdfReportModal;
    window.closePdfReportModal = closePdfReportModal;
    window.downloadPdfReport = downloadPdfReport;
    window.printPdfReport = printPdfReport;
})();
