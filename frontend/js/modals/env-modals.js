/**
 * MICE ESG Platform - Environment (E) Domain Modals
 * Covers: Eco Simulator, Transport, Energy, Upcycle, Paper Booth, Signage, Waste, Venue Ecology, Freight
 */
(function() {
  'use strict';

  // State Variables
  let currentEcoQuantities = { cup: 0, plate: 0, bowl: 0, fork: 0 };
  let currentTransportQuantities = { distance: 0, people: 1 };
  let currentTravelState = {
    tier: 2, // 1: Detailed, 2: City Presets, 3: Proxy
    mode: 'ktx', // 'ktx', 'air_domestic', 'air_intl', 'bus', 'car'
    cityKey: '', // Empty initially - no pre-filled preset
    oneWayDistanceKm: 0, // Empty initially
    isRoundTrip: true,
    passengers: 0, // Empty initially
    seatClass: 'weighted_80_20', // 'weighted_80_20', 'economy', 'business'
    rf: true, // Radiative Forcing 1.9x
    wtt: true, // Well-to-Tank fuel upstream
    proxyTotalAttendees: 0, // Empty initially
    baselineKg: 0,
    actualKg: 0,
    reductionKg: 0,
    totalPkm: 0
  };

  const TRAVEL_CITY_PRESETS = {
    busan_ktx: { name: '부산권', distance: 400, mode: 'ktx' },
    daegu_ktx: { name: '대구권', distance: 300, mode: 'ktx' },
    gwangju_ktx: { name: '광주·호남권', distance: 320, mode: 'ktx' },
    jeju_air: { name: '제주권', distance: 450, mode: 'air_domestic' },
    tokyo_air: { name: '일본 / 도쿄', distance: 1260, mode: 'air_intl' },
    beijing_air: { name: '중국 / 베이징', distance: 950, mode: 'air_intl' },
    sg_air: { name: '싱가포르·동남아', distance: 4650, mode: 'air_intl' },
    us_air: { name: '미주·유럽', distance: 9000, mode: 'air_intl' }
  };
  let currentEnergyQuantity = 0;
  let currentDieselQuantity = 0;
  let currentUpcycleQuantity = 0;
  let currentSignageQuantities = { papersSaved: 0, printedSigns: 0 };
  let currentWasteQuantities = { paper: 0, plastic: 0, food: 0, general: 0 };
  let lastUpcycleCategory = 'keyring';
  let lastBannerN = 0;
  let lastBannerY = 0;

    // 친환경 행사장 조성 · 관리 인증서 제출 상태 변수 및 모달 처리
    let venueEcologyState = {
      submitted: false,
      checkedCerts: [],
      fileName: ''
    };



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
      
      // Calculate carbon with dynamic coefficients
      const ecoCoeffs = getEcoCoefficients();
      let totalCarbon = 0;
      for (const [item, qty] of Object.entries(currentEcoQuantities)) {
        totalCarbon += qty * (ecoCoeffs[item] || 0);
      }
      
      document.getElementById('eco-carbon-summary').textContent = totalCarbon.toLocaleString() + ' gCO2eq';

      // Update item coefficient descriptions dynamically
      const cupText = document.getElementById('eco-cup-ef-text');
      if (cupText) cupText.textContent = `-${ecoCoeffs.cup} gCO2eq / 개`;
      const plateText = document.getElementById('eco-plate-ef-text');
      if (plateText) plateText.textContent = `-${ecoCoeffs.plate} gCO2eq / 개`;
      const bowlText = document.getElementById('eco-bowl-ef-text');
      if (bowlText) bowlText.textContent = `-${ecoCoeffs.bowl} gCO2eq / 개`;
      const forkText = document.getElementById('eco-fork-ef-text');
      if (forkText) forkText.textContent = `-${ecoCoeffs.fork} gCO2eq / 개`;
    }

    // ==========================================
    // Travel & Transport Simulator (NZCE Cat 4 · GLEC Framework)
    // ==========================================
    function calculateTravelEmissions() {
      const tripMult = currentTravelState.isRoundTrip ? 2 : 1;
      const wttMult = currentTravelState.wtt ? 1.20 : 1.0;
      
      let seatMult = 1.0;
      if (currentTravelState.seatClass === 'weighted_80_20') seatMult = 1.38;
      else if (currentTravelState.seatClass === 'business') seatMult = 2.90;
      else seatMult = 1.00;

      const rfMult = currentTravelState.rf ? 1.90 : 1.0;

      if (currentTravelState.tier === 3) {
        // Guideline 4.3 Proxy Engine Calculation
        const totalAttendees = currentTravelState.proxyTotalAttendees || 0;
        if (totalAttendees <= 0) {
          currentTravelState.totalPkm = 0;
          currentTravelState.baselineKg = 0;
          currentTravelState.actualKg = 0;
          currentTravelState.reductionKg = 0;
          return;
        }
        const localPax = Math.round(totalAttendees * 0.25);
        const outTownPax = totalAttendees - localPax;
        const under200Pax = Math.round(outTownPax * 0.50);
        const over200Pax = outTownPax - under200Pax;

        const localPkm = localPax * 30; // 30km round-trip local transit
        const under200Pkm = under200Pax * 250; // 250km round-trip
        const over200Pkm = over200Pax * 700; // 700km round-trip
        const totalPkm = localPkm + under200Pkm + over200Pkm;

        // Baseline: If all traveled by private car or single-seat air
        const baselineLocal = localPkm * 0.160 * wttMult;
        const baselineUnder200 = under200Pkm * 0.160 * wttMult;
        const baselineOver200 = over200Pkm * (0.176 * 1.38 * rfMult) * wttMult;
        const baselineKg = baselineLocal + baselineUnder200 + baselineOver200;

        // Actual with Guideline 4.3 modal split
        const actualLocal = localPkm * 0.040 * wttMult;
        const efUnder200 = (0.49 * 0.160) + (0.35 * 0.020) + (0.15 * 0.030) + (0.01 * 0.050);
        const actualUnder200 = under200Pkm * efUnder200 * wttMult;
        const airEfOver200 = 0.176 * 1.38 * rfMult;
        const efOver200 = (0.70 * airEfOver200) + (0.25 * 0.012) + (0.05 * 0.160);
        const actualOver200 = over200Pkm * efOver200 * wttMult;

        const actualKg = actualLocal + actualUnder200 + actualOver200;
        const reductionKg = Math.max(0, baselineKg - actualKg);

        currentTravelState.totalPkm = totalPkm;
        currentTravelState.baselineKg = baselineKg;
        currentTravelState.actualKg = actualKg;
        currentTravelState.reductionKg = reductionKg;
        return;
      }

      // Tier 1 & Tier 2:
      const totalPkm = (currentTravelState.oneWayDistanceKm || 0) * tripMult * (currentTravelState.passengers || 0);
      currentTravelState.totalPkm = totalPkm;

      let baselineKg = 0;
      let actualKg = 0;

      if (totalPkm <= 0) {
        currentTravelState.baselineKg = 0;
        currentTravelState.actualKg = 0;
        currentTravelState.reductionKg = 0;
        return;
      }

      if (currentTravelState.mode === 'ktx') {
        // High-speed rail: baseline is car (160 g/km)
        const carEf = 0.160;
        const ktxEf = 0.012;
        baselineKg = totalPkm * carEf * wttMult;
        actualKg = totalPkm * ktxEf * wttMult;
      } else if (currentTravelState.mode === 'bus') {
        // Express/intercity bus: baseline is car (160 g/km)
        const carEf = 0.160;
        const busEf = 0.030;
        baselineKg = totalPkm * carEf * wttMult;
        actualKg = totalPkm * busEf * wttMult;
      } else if (currentTravelState.mode === 'air_domestic') {
        // Domestic flight
        const airEf = 0.176;
        baselineKg = totalPkm * airEf * 1.38 * rfMult * wttMult;
        actualKg = totalPkm * airEf * seatMult * rfMult * wttMult;
      } else if (currentTravelState.mode === 'air_intl') {
        // International flight
        const airEf = currentTravelState.oneWayDistanceKm < 3700 ? 0.082 : 0.102;
        baselineKg = totalPkm * airEf * 1.38 * rfMult * wttMult;
        actualKg = totalPkm * airEf * seatMult * rfMult * wttMult;
      } else if (currentTravelState.mode === 'car') {
        // Private car: carpooling savings if passengers >= 2
        const carEf = 0.160;
        baselineKg = totalPkm * carEf * wttMult;
        actualKg = (totalPkm / Math.max(1, currentTravelState.passengers)) * carEf * wttMult;
      }

      const reductionKg = Math.max(0, baselineKg - actualKg);
      currentTravelState.baselineKg = baselineKg;
      currentTravelState.actualKg = actualKg;
      currentTravelState.reductionKg = reductionKg;
    }

    function openTransportSimulatorModal() {
      const modal = document.getElementById('transportSimulatorModal');
      if (!modal) return;
      
      const usernameInput = document.getElementById('transport-username');
      if (usernameInput) usernameInput.value = (window.sessionStats && sessionStats.username) || '';

      updateTravelModalUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const card = modal.querySelector('div');
        if (card) card.classList.remove('scale-95');
      }, 10);
    }

    function closeTransportSimulatorModal() {
      const modal = document.getElementById('transportSimulatorModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const card = modal.querySelector('div');
      if (card) card.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function setTravelTier(tier) {
      currentTravelState.tier = tier;
      
      const t1 = document.getElementById('travel-tier-1-container');
      const t2 = document.getElementById('travel-tier-2-container');
      const t3 = document.getElementById('travel-tier-3-container');
      if (t1) { if (tier === 1) t1.classList.remove('hidden'); else t1.classList.add('hidden'); }
      if (t2) { if (tier === 2) t2.classList.remove('hidden'); else t2.classList.add('hidden'); }
      if (t3) { if (tier === 3) t3.classList.remove('hidden'); else t3.classList.add('hidden'); }

      [1, 2, 3].forEach(t => {
        const btn = document.getElementById(`btn-travel-tier-${t}`);
        if (!btn) return;
        if (t === tier) {
          btn.classList.add('border-blue-500', 'bg-blue-50/50', 'shadow-xs');
          btn.classList.remove('border-slate-200', 'bg-white');
        } else {
          btn.classList.remove('border-blue-500', 'bg-blue-50/50', 'shadow-xs');
          btn.classList.add('border-slate-200', 'bg-white');
        }
      });

      updateTravelModalUI();
    }

    function applyTravelCityPreset(cityKey) {
      const preset = TRAVEL_CITY_PRESETS[cityKey];
      if (!preset) return;

      currentTravelState.cityKey = cityKey;
      currentTravelState.oneWayDistanceKm = preset.distance;
      currentTravelState.mode = preset.mode;
      if (!currentTravelState.passengers || currentTravelState.passengers < 1) {
        currentTravelState.passengers = 1;
      }

      updateTravelModalUI();
    }

    function setTravelMode(mode) {
      currentTravelState.mode = mode;
      updateTravelModalUI();
    }

    function toggleTravelRoundTrip() {
      currentTravelState.isRoundTrip = !currentTravelState.isRoundTrip;
      updateTravelModalUI();
    }

    function changeTravelDistance(delta) {
      const current = currentTravelState.oneWayDistanceKm || 0;
      const next = Math.max(0, Math.min(20000, current + delta));
      currentTravelState.oneWayDistanceKm = next;
      updateTravelModalUI();
    }

    function changeTravelPassengers(delta) {
      const current = currentTravelState.passengers || 0;
      const next = Math.max(0, Math.min(10000, current + delta));
      currentTravelState.passengers = next;
      updateTravelModalUI();
    }

    function onTravelParamChange() {
      const distInput = document.getElementById('qty-travel-distance');
      if (distInput) {
        const val = distInput.value.trim();
        currentTravelState.oneWayDistanceKm = val === '' ? 0 : Math.max(0, parseInt(val) || 0);
      }
      const paxInput = document.getElementById('qty-travel-passengers');
      if (paxInput) {
        const val = paxInput.value.trim();
        currentTravelState.passengers = val === '' ? 0 : Math.max(0, parseInt(val) || 0);
      }
      const seatSelect = document.getElementById('sel-travel-seat-class');
      if (seatSelect) {
        currentTravelState.seatClass = seatSelect.value;
      }
      const rfChk = document.getElementById('chk-travel-rf');
      if (rfChk) {
        currentTravelState.rf = rfChk.checked;
      }
      const wttChk = document.getElementById('chk-travel-wtt');
      if (wttChk) {
        currentTravelState.wtt = wttChk.checked;
      }
      updateTravelModalUI();
    }

    function runTravelProxyCalculation() {
      const proxyInput = document.getElementById('qty-travel-proxy-total');
      if (proxyInput) {
        const val = proxyInput.value.trim();
        const num = parseInt(val) || 0;
        if (num <= 0) {
          showToast('참가자 수를 1명 이상 입력해 주세요.', true);
          return;
        }
        currentTravelState.proxyTotalAttendees = num;
      }
      calculateTravelEmissions();
      updateTravelModalUI();
      showToast(`참가자 ${currentTravelState.proxyTotalAttendees}명에 대해 가이드라인 4.3 결측치 표준 안분이 적용되었습니다.`);
    }

    function updateTravelModalUI() {
      calculateTravelEmissions();

      // Trip distance display
      const distDisplay = document.getElementById('travel-total-dist-display');
      const tripMult = currentTravelState.isRoundTrip ? 2 : 1;
      const totalKm = (currentTravelState.oneWayDistanceKm || 0) * tripMult;
      if (distDisplay) {
        distDisplay.textContent = totalKm > 0 ? `${currentTravelState.isRoundTrip ? '왕복 ' : '편도 '}${totalKm.toLocaleString()} km` : '0 km';
      }

      // Roundtrip button labels
      const rtLabel1 = document.getElementById('label-roundtrip-tier1');
      if (rtLabel1) {
        rtLabel1.textContent = currentTravelState.isRoundTrip ? '왕복 (편도 × 2) 적용 중' : '편도 이동 적용 중';
      }
      const rtLabel2 = document.getElementById('label-roundtrip-tier2');
      if (rtLabel2) {
        rtLabel2.textContent = currentTravelState.isRoundTrip ? '왕복 (편도 × 2) 적용 중' : '편도 이동 적용 중';
      }

      // Input values sync (Empty string when 0 to avoid pre-filled default numbers)
      const distInput = document.getElementById('qty-travel-distance');
      if (distInput && document.activeElement !== distInput) {
        distInput.value = currentTravelState.oneWayDistanceKm > 0 ? currentTravelState.oneWayDistanceKm : '';
      }
      const paxInput = document.getElementById('qty-travel-passengers');
      if (paxInput && document.activeElement !== paxInput) {
        paxInput.value = currentTravelState.passengers > 0 ? currentTravelState.passengers : '';
      }
      const proxyInput = document.getElementById('qty-travel-proxy-total');
      if (proxyInput && document.activeElement !== proxyInput) {
        proxyInput.value = currentTravelState.proxyTotalAttendees > 0 ? currentTravelState.proxyTotalAttendees : '';
      }
      const seatSelect = document.getElementById('sel-travel-seat-class');
      if (seatSelect) {
        seatSelect.value = currentTravelState.seatClass;
      }
      const rfChk = document.getElementById('chk-travel-rf');
      if (rfChk) {
        rfChk.checked = !!currentTravelState.rf;
      }
      const wttChk = document.getElementById('chk-travel-wtt');
      if (wttChk) {
        wttChk.checked = !!currentTravelState.wtt;
      }

      // Seat ratio display
      const seatRatioDisp = document.getElementById('travel-seat-ratio-display');
      if (seatRatioDisp) {
        if (currentTravelState.seatClass === 'weighted_80_20') seatRatioDisp.textContent = '표준 80:20 (1.38x)';
        else if (currentTravelState.seatClass === 'economy') seatRatioDisp.textContent = '이코노미 (1.0x)';
        else if (currentTravelState.seatClass === 'business') seatRatioDisp.textContent = '비즈니스 (2.9x)';
      }

      // Summary Card
      const pkmDisp = document.getElementById('travel-summary-pkm');
      if (pkmDisp) {
        pkmDisp.textContent = `${Math.round(currentTravelState.totalPkm).toLocaleString()} p·km`;
      }
      const tripTypeDisp = document.getElementById('travel-summary-trip-type');
      if (tripTypeDisp) {
        tripTypeDisp.textContent = currentTravelState.tier === 3 ? '참가자 표준 모델 추정' : (currentTravelState.isRoundTrip ? '왕복 이동 기준' : '편도 이동 기준');
      }
      const baselineDisp = document.getElementById('travel-summary-baseline');
      if (baselineDisp) {
        baselineDisp.textContent = `${currentTravelState.baselineKg.toFixed(2)} kg`;
      }
      const reductionDisp = document.getElementById('travel-summary-reduction');
      if (reductionDisp) {
        reductionDisp.textContent = currentTravelState.reductionKg.toFixed(2);
      }
      const percentDisp = document.getElementById('travel-summary-percent');
      if (percentDisp) {
        const pct = currentTravelState.baselineKg > 0 ? ((currentTravelState.reductionKg / currentTravelState.baselineKg) * 100).toFixed(1) : '0.0';
        percentDisp.textContent = `${pct}% 감축`;
      }

      // City Presets active button styling
      const presetKeys = ['busan_ktx', 'daegu_ktx', 'gwangju_ktx', 'jeju_air', 'tokyo_air', 'beijing_air', 'sg_air', 'us_air'];
      presetKeys.forEach(k => {
        const btn = document.getElementById(`btn-city-${k}`);
        if (!btn) return;
        if (currentTravelState.cityKey === k && currentTravelState.tier === 2) {
          btn.classList.add('border-blue-500', 'bg-blue-50/70', 'ring-2', 'ring-blue-500/20');
          btn.classList.remove('border-slate-200', 'bg-white');
        } else {
          btn.classList.remove('border-blue-500', 'bg-blue-50/70', 'ring-2', 'ring-blue-500/20');
          btn.classList.add('border-slate-200', 'bg-white');
        }
      });

      // Travel Mode active button styling
      const modeKeys = ['ktx', 'air_domestic', 'air_intl', 'bus', 'car'];
      modeKeys.forEach(m => {
        const btn = document.getElementById(`btn-travel-mode-${m}`);
        if (!btn) return;
        if (currentTravelState.mode === m) {
          btn.classList.add('border-blue-500', 'bg-blue-50/60', 'text-blue-950');
          btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-800');
        } else {
          btn.classList.remove('border-blue-500', 'bg-blue-50/60', 'text-blue-950');
          btn.classList.add('border-slate-200', 'bg-white', 'text-slate-800');
        }
      });

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    // Backward compatibility aliases
    function changeTransportQty(field, delta) {
      if (field === 'distance') changeTravelDistance(delta);
      else if (field === 'people') changeTravelPassengers(delta);
    }
    function updateTransportModalUI() {
      updateTravelModalUI();
    }

    // Energy Simulator Modal Functions (Scope 1 & Scope 2)
    let currentEnergyScopeMode = 'scope2';

    function setEnergyScopeMode(mode) {
      currentEnergyScopeMode = mode;
      
      const tabS2 = document.getElementById('btn-tab-scope2');
      const tabS1 = document.getElementById('btn-tab-scope1');
      const tabBoth = document.getElementById('btn-tab-both');
      const guideS2 = document.getElementById('guide-scope2');
      const guideS1 = document.getElementById('guide-scope1');
      const guideBoth = document.getElementById('guide-both');
      const inputS2 = document.getElementById('section-input-scope2');
      const inputS1 = document.getElementById('section-input-scope1');

      [tabS2, tabS1, tabBoth].forEach(btn => {
        if (!btn) return;
        btn.classList.remove('border-amber-500', 'bg-amber-50/50', 'border-rose-500', 'bg-rose-50/50', 'border-purple-500', 'bg-purple-50/50', 'shadow-xs');
        btn.classList.add('border-slate-200', 'bg-white');
      });

      if (guideS2) guideS2.classList.add('hidden');
      if (guideS1) guideS1.classList.add('hidden');
      if (guideBoth) guideBoth.classList.add('hidden');

      if (mode === 'scope2') {
        if (tabS2) {
          tabS2.classList.remove('border-slate-200', 'bg-white');
          tabS2.classList.add('border-amber-500', 'bg-amber-50/50', 'shadow-xs');
        }
        if (guideS2) guideS2.classList.remove('hidden');
        if (inputS2) inputS2.classList.remove('hidden');
        if (inputS1) inputS1.classList.add('hidden');
      } else if (mode === 'scope1') {
        if (tabS1) {
          tabS1.classList.remove('border-slate-200', 'bg-white');
          tabS1.classList.add('border-rose-500', 'bg-rose-50/50', 'shadow-xs');
        }
        if (guideS1) guideS1.classList.remove('hidden');
        if (inputS2) inputS2.classList.add('hidden');
        if (inputS1) inputS1.classList.remove('hidden');
      } else if (mode === 'both') {
        if (tabBoth) {
          tabBoth.classList.remove('border-slate-200', 'bg-white');
          tabBoth.classList.add('border-purple-500', 'bg-purple-50/50', 'shadow-xs');
        }
        if (guideBoth) guideBoth.classList.remove('hidden');
        if (inputS2) inputS2.classList.remove('hidden');
        if (inputS1) inputS1.classList.remove('hidden');
      }
      
      updateEnergyModalUI();
    }

    function openEnergySimulatorModal() {
      const modal = document.getElementById('energySimulatorModal');
      
      const energyInput = document.getElementById('qty-energy');
      const dieselInput = document.getElementById('qty-diesel');
      if (energyInput) energyInput.value = sessionStats.items.renewable_energy || 0;
      if (dieselInput) dieselInput.value = sessionStats.items.diesel_generator || 0;
      
      const usernameInput = document.getElementById('energy-username');
      if (usernameInput) usernameInput.value = sessionStats.username || '';
      
      if ((sessionStats.items.diesel_generator || 0) > 0 && (sessionStats.items.renewable_energy || 0) > 0) {
        setEnergyScopeMode('both');
      } else if ((sessionStats.items.diesel_generator || 0) > 0) {
        setEnergyScopeMode('scope1');
      } else {
        setEnergyScopeMode('scope2');
      }

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

    function changeDieselQty(delta) {
      const qtyInput = document.getElementById('qty-diesel');
      let newVal = parseInt(qtyInput.value || 0) + delta;
      if (newVal < 0) newVal = 0;
      if (newVal > 10000) newVal = 10000;
      qtyInput.value = newVal;
      updateEnergyModalUI();
    }

    function updateEnergyModalUI() {
      const energyInput = document.getElementById('qty-energy');
      const dieselInput = document.getElementById('qty-diesel');
      
      let energyVal = parseInt(energyInput?.value || 0);
      let dieselVal = parseInt(dieselInput?.value || 0);

      if (currentEnergyScopeMode === 'scope2') dieselVal = 0;
      if (currentEnergyScopeMode === 'scope1') energyVal = 0;

      const energyCoeff = getEnergyCoefficient();
      const dieselCoeff = window.EmissionFactors ? (window.EmissionFactors.get('energy', 'diesel_generator') * 1000) : 2605.8;

      const scope2Carbon = Math.round(energyVal * energyCoeff);
      const scope1Carbon = Math.round(dieselVal * dieselCoeff);
      const totalCarbon = scope1Carbon + scope2Carbon;

      const s1El = document.getElementById('summary-scope1-carbon');
      const s2El = document.getElementById('summary-scope2-carbon');
      if (s1El) s1El.textContent = (scope1Carbon / 1000).toFixed(2) + ' kg';
      if (s2El) s2El.textContent = (scope2Carbon / 1000).toFixed(2) + ' kg';

      const totalCarbonEl = document.getElementById('energy-carbon-summary');
      if (totalCarbonEl) {
        totalCarbonEl.textContent = (totalCarbon / 1000).toFixed(2) + ' kgCO2e';
      }

      const energyEfVal = document.getElementById('energy-ef-value');
      if (energyEfVal) energyEfVal.textContent = (energyCoeff / 1000).toFixed(4) + ' kgCO2e';
    }

    function submitEnergySimulation() {
      const username = document.getElementById('energy-username')?.value.trim() || '익명 참여자';
      const energyInput = document.getElementById('qty-energy');
      const dieselInput = document.getElementById('qty-diesel');

      let energyVal = parseInt(energyInput?.value || 0);
      let dieselVal = parseInt(dieselInput?.value || 0);

      if (currentEnergyScopeMode === 'scope2') dieselVal = 0;
      if (currentEnergyScopeMode === 'scope1') energyVal = 0;

      if (energyVal < 0 || dieselVal < 0) {
        showToast('실천 수량은 0 이상 입력해 주세요.', true);
        return;
      }

      if (energyVal === 0 && dieselVal === 0) {
        showToast('실천 수량을 1 이상 입력해 주세요.', true);
        return;
      }

      sessionStats.items.renewable_energy = energyVal;
      sessionStats.items.diesel_generator = dieselVal;

      sendParticipation(username, (data) => {
        showToast(`참여 완료! 재생에너지 & 친환경 전원 실천 내역이 반영되었습니다.`);
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

    // Submit log to backend (Transport & Travel NZCE Cat 4)
    function submitTransportSimulation() {
      const usernameInput = document.getElementById('transport-username');
      const username = (usernameInput ? usernameInput.value.trim() : '') || '익명 참여자';

      calculateTravelEmissions();

      if (currentTravelState.totalPkm <= 0) {
        showToast('올바른 이동 거리 및 인원을 설정해 주세요.', true);
        return;
      }

      // Sync with sessionStats
      sessionStats.items.public_transport = Math.round(currentTravelState.totalPkm);
      sessionStats.items.travel_reduction = Math.round(currentTravelState.reductionKg * 1000); // grams

      // Update legacy helper
      const tripMult = currentTravelState.isRoundTrip ? 2 : 1;
      currentTransportQuantities.distance = currentTravelState.oneWayDistanceKm * tripMult;
      currentTransportQuantities.people = currentTravelState.passengers;

      sendParticipation(username, (data) => {
        showToast(`참여 완료! 목적지 왕복 이동(NZCE Cat 4) 실천 내역이 성공적으로 반영되었습니다.`);
        if (typeof recalculateSessionTotalCarbon === 'function') recalculateSessionTotalCarbon();
        if (typeof updateDashboardUI === 'function') updateDashboardUI(sessionStats);
        if (typeof saveAllStateToLocalStorage === 'function') saveAllStateToLocalStorage();
      }, closeTransportSimulatorModal);
    }

    // ==========================================
    // Freight Simulator Modal Functions (NZCE Cat 2 · GLEC Framework)
    // ==========================================
    let currentFreightMode = 'van_1t_electric';
    let currentFreightState = {
      mode: 'van_1t_electric',
      distance: 0,
      weight: 0,
      allocation: 100,
      forklift: false,
      wtt: false,
      calculatedScope3ReductionKg: 0,
      calculatedScope1ReductionKg: 0,
      totalReductionKg: 0
    };

    function setFreightMode(mode) {
      currentFreightMode = mode;
      currentFreightState.mode = mode;
      
      const modes = ['van_1t_diesel', 'van_1t_electric', 'truck_heavy', 'rail_freight'];
      modes.forEach(m => {
        const btn = document.getElementById('btn-freight-mode-' + m);
        if (!btn) return;
        btn.classList.remove('border-emerald-500', 'bg-emerald-50/50', 'border-blue-500', 'bg-blue-50/50', 'shadow-xs');
        btn.classList.add('border-slate-200', 'bg-white');
      });

      const activeBtn = document.getElementById('btn-freight-mode-' + mode);
      if (activeBtn) {
        activeBtn.classList.remove('border-slate-200', 'bg-white');
        if (mode === 'rail_freight') {
          activeBtn.classList.add('border-blue-500', 'bg-blue-50/50', 'shadow-xs');
        } else {
          activeBtn.classList.add('border-emerald-500', 'bg-emerald-50/50', 'shadow-xs');
        }
      }

      updateFreightModalUI();
    }

    function changeFreightDistance(delta) {
      const el = document.getElementById('qty-freight-distance');
      if (!el) return;
      let val = (parseFloat(el.value) || 0) + delta;
      if (val < 0) val = 0;
      if (val > 10000) val = 10000;
      el.value = val > 0 ? val : '';
      currentFreightState.distance = val;
      updateFreightModalUI();
    }

    function changeFreightWeight(delta) {
      const el = document.getElementById('qty-freight-weight');
      if (!el) return;
      let val = Math.round(((parseFloat(el.value) || 0) + delta) * 10) / 10;
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      el.value = val > 0 ? val : '';
      currentFreightState.weight = val;
      updateFreightModalUI();
    }

    function onFreightAllocationChange(val) {
      const badge = document.getElementById('allocation-badge');
      if (badge) {
        if (parseInt(val) === 100) {
          badge.textContent = '100% (단독 운송)';
          badge.className = 'px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black';
        } else {
          badge.textContent = val + '% (혼적 안분)';
          badge.className = 'px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black';
        }
      }
      updateFreightModalUI();
    }

    function setAllocation(val) {
      const slider = document.getElementById('freight-allocation-slider');
      if (slider) {
        slider.value = val;
        onFreightAllocationChange(val);
      }
    }

    function updateFreightModalUI() {
      const distEl = document.getElementById('qty-freight-distance');
      const weightEl = document.getElementById('qty-freight-weight');
      const allocSlider = document.getElementById('freight-allocation-slider');
      const chkForklift = document.getElementById('chk-freight-forklift');
      const chkWtt = document.getElementById('chk-freight-wtt');

      const distance = distEl ? (parseFloat(distEl.value) || 0) : 0;
      const weight = weightEl ? (parseFloat(weightEl.value) || 0) : 0;
      const allocRatio = allocSlider ? ((parseFloat(allocSlider.value) || 100) / 100) : 1.0;
      const hasForklift = chkForklift ? chkForklift.checked : false;
      const hasWtt = chkWtt ? chkWtt.checked : false;

      // ton·km
      const tonKm = Math.round(distance * weight * allocRatio * 10) / 10;
      const tonkmDisplay = document.getElementById('freight-tonkm-display');
      if (tonkmDisplay) {
        tonkmDisplay.textContent = `산정 지수: ${tonKm.toLocaleString()} ton·km`;
      }

      // Emission factors (via window.EmissionFactors if available)
      const efVanDiesel = window.EmissionFactors ? window.EmissionFactors.get('freight', 'van_1t_diesel') : 0.2492;
      const efVanEv = window.EmissionFactors ? window.EmissionFactors.get('freight', 'van_1t_electric') : 0.0890;
      const efHeavyTruck = window.EmissionFactors ? window.EmissionFactors.get('freight', 'truck_heavy') : 0.1650;
      const efRail = window.EmissionFactors ? window.EmissionFactors.get('freight', 'rail_freight') : 0.0245;
      const efForklift = window.EmissionFactors ? window.EmissionFactors.get('freight', 'electric_forklift') : 25.0;

      // WTT multiplier (DEFRA 2024 guideline ~1.18x upstream factor)
      const wttMultiplier = hasWtt ? 1.18 : 1.0;

      // Calculate Scope 3 Transport reduction based on mode
      let scope3ReductionKg = 0;
      let modeLabel = '1t 전기 화물차 전환';

      if (currentFreightMode === 'van_1t_electric') {
        const baselineEmissions = distance * efVanDiesel * allocRatio * wttMultiplier;
        const actualEmissions = distance * efVanEv * allocRatio * wttMultiplier;
        scope3ReductionKg = Math.max(0, baselineEmissions - actualEmissions);
        modeLabel = '1t 전기 화물차 (64% 감축)';
      } else if (currentFreightMode === 'van_1t_diesel') {
        scope3ReductionKg = 0;
        modeLabel = '1t 경유 화물차 (기준 운송)';
      } else if (currentFreightMode === 'truck_heavy') {
        const baselineEquivalent = distance * weight * efVanDiesel * allocRatio * wttMultiplier;
        const heavyEmissions = distance * weight * efHeavyTruck * allocRatio * wttMultiplier;
        scope3ReductionKg = Math.max(0, baselineEquivalent - heavyEmissions);
        modeLabel = '5t·11t 중대형 트럭 (집하 수송)';
      } else if (currentFreightMode === 'rail_freight') {
        const roadEmissions = distance * weight * efHeavyTruck * allocRatio * wttMultiplier;
        const railEmissions = distance * weight * efRail * allocRatio * wttMultiplier;
        scope3ReductionKg = Math.max(0, roadEmissions - railEmissions);
        modeLabel = '철도 화물 (모달시프트 85% 감축)';
      }

      // Calculate Scope 1 Forklift reduction
      let scope1ReductionKg = 0;
      if (hasForklift) {
        scope1ReductionKg = efForklift;
      }

      const totalReductionKg = Math.round((scope3ReductionKg + scope1ReductionKg) * 100) / 100;

      currentFreightState = {
        mode: currentFreightMode,
        distance,
        weight,
        allocation: allocRatio * 100,
        forklift: hasForklift,
        wtt: hasWtt,
        calculatedScope3ReductionKg: Math.round(scope3ReductionKg * 100) / 100,
        calculatedScope1ReductionKg: Math.round(scope1ReductionKg * 100) / 100,
        totalReductionKg
      };

      const scope3Display = document.getElementById('summary-freight-scope3');
      if (scope3Display) scope3Display.textContent = `${(Math.round(scope3ReductionKg * 100) / 100).toLocaleString()} kg`;

      const scope1Display = document.getElementById('summary-freight-scope1');
      if (scope1Display) scope1Display.textContent = `${scope1ReductionKg.toFixed(1)} kg`;

      const modeLabelEl = document.getElementById('summary-freight-mode-label');
      if (modeLabelEl) modeLabelEl.textContent = modeLabel;

      const totalSummaryEl = document.getElementById('freight-carbon-summary');
      if (totalSummaryEl) totalSummaryEl.textContent = `${totalReductionKg.toLocaleString()} kgCO2e`;
    }

    function openFreightSimulatorModal() {
      const modal = document.getElementById('freightSimulatorModal');
      if (!modal) return;

      const usernameInput = document.getElementById('freight-username');
      if (usernameInput) usernameInput.value = sessionStats.username || '';

      // Force purge any legacy default dummy values (120, 2)
      if (currentFreightState.distance === 120) currentFreightState.distance = 0;
      if (currentFreightState.weight === 2 || currentFreightState.weight === 2.0) currentFreightState.weight = 0;
      if ((sessionStats.items.freight_reduction || 0) === 0 && (sessionStats.items.freight_forklift || 0) === 0) {
        currentFreightState.distance = 0;
        currentFreightState.weight = 0;
        currentFreightState.forklift = false;
        currentFreightState.wtt = false;
        currentFreightState.calculatedScope3ReductionKg = 0;
        currentFreightState.calculatedScope1ReductionKg = 0;
        currentFreightState.totalReductionKg = 0;
      }

      const distEl = document.getElementById('qty-freight-distance');
      const weightEl = document.getElementById('qty-freight-weight');
      const allocSlider = document.getElementById('freight-allocation-slider');
      const chkForklift = document.getElementById('chk-freight-forklift');
      const chkWtt = document.getElementById('chk-freight-wtt');

      if (distEl) distEl.value = currentFreightState.distance > 0 ? currentFreightState.distance : '';
      if (weightEl) weightEl.value = currentFreightState.weight > 0 ? currentFreightState.weight : '';
      if (allocSlider) {
        allocSlider.value = currentFreightState.allocation || 100;
        onFreightAllocationChange(allocSlider.value);
      }
      if (chkForklift) chkForklift.checked = !!currentFreightState.forklift;
      if (chkWtt) chkWtt.checked = !!currentFreightState.wtt;

      setFreightMode(currentFreightMode || 'van_1t_electric');
      updateFreightModalUI();

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const inner = modal.querySelector('div');
        if (inner) inner.classList.remove('scale-95');
      }, 10);
    }

    function closeFreightSimulatorModal() {
      const modal = document.getElementById('freightSimulatorModal');
      if (!modal) return;
      modal.classList.add('opacity-0');
      const inner = modal.querySelector('div');
      if (inner) inner.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function submitFreightSimulation() {
      const usernameInput = document.getElementById('freight-username');
      const username = (usernameInput && usernameInput.value.trim()) || '익명 참여자';

      if (currentFreightState.totalReductionKg <= 0 && currentFreightState.distance <= 0 && currentFreightState.weight <= 0 && !currentFreightState.forklift) {
        showToast('운송 거리나 중량, 또는 실천 옵션을 1개 이상 입력해 주세요.', true);
        return;
      }

      // Grams conversion
      const scope3Grams = Math.round(currentFreightState.calculatedScope3ReductionKg * 1000);
      const scope1Grams = Math.round(currentFreightState.calculatedScope1ReductionKg * 1000);

      sessionStats.items.freight_reduction = scope3Grams;
      sessionStats.items.freight_forklift = scope1Grams;

      sendParticipation(username, (data) => {
        showToast('참여 완료! 친환경 화물 & 물류 관리 실천 내역이 성공적으로 반영되었습니다.');
      }, closeFreightSimulatorModal);
    }

    // ============================================================================
    // Food & Beverage (F&B) Catering Simulator (NZCE Category 3 & Cool Food Pledge)
    // ============================================================================
    let currentFnbState = {
      tier: 2, // 1: ingredient, 2: meal, 3: spend
      meals: { meat: 0, low_carbon: 0, vegan: 0 },
      ingredients: { beef: 0, pork: 0, poultry: 0, fish: 0, plant_protein: 0, veg: 0, cheese: 0, coffee_kg: 0 },
      spendWon: 0,
      options: { coffee: false, fruit: false, portion: false },
      baselineCarbonKg: 0,
      actualCarbonKg: 0,
      reductionKg: 0,
      reductionPercent: 0
    };

    function openFnbSimulatorModal() {
      const modal = document.getElementById('fnbSimulatorModal');
      if (!modal) return;

      const usernameInput = document.getElementById('fnb-username');
      if (usernameInput && sessionStats) {
        usernameInput.value = sessionStats.username || '';
      }

      setFnbTier(currentFnbState.tier || 2);
      updateFnbModalUI();

      modal.style.display = 'flex';
      modal.style.pointerEvents = 'auto';
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const content = modal.querySelector('> div');
        if (content) content.classList.remove('scale-95');
      }, 10);

      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }

    function closeFnbSimulatorModal() {
      const modal = document.getElementById('fnbSimulatorModal');
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

    function setFnbTier(tier) {
      currentFnbState.tier = tier;
      const t1 = document.getElementById('fnb-tier-1-container');
      const t2 = document.getElementById('fnb-tier-2-container');
      const t3 = document.getElementById('fnb-tier-3-container');

      const btn1 = document.getElementById('btn-fnb-tier-1');
      const btn2 = document.getElementById('btn-fnb-tier-2');
      const btn3 = document.getElementById('btn-fnb-tier-3');

      [btn1, btn2, btn3].forEach(b => {
        if (!b) return;
        b.classList.remove('border-emerald-500', 'bg-emerald-50/50', 'shadow-xs');
        b.classList.add('border-slate-200', 'bg-white');
      });

      if (t1) t1.classList.add('hidden');
      if (t2) t2.classList.add('hidden');
      if (t3) t3.classList.add('hidden');

      if (tier === 1) {
        if (t1) t1.classList.remove('hidden');
        if (btn1) {
          btn1.classList.add('border-emerald-500', 'bg-emerald-50/50', 'shadow-xs');
          btn1.classList.remove('border-slate-200', 'bg-white');
        }
      } else if (tier === 3) {
        if (t3) t3.classList.remove('hidden');
        if (btn3) {
          btn3.classList.add('border-emerald-500', 'bg-emerald-50/50', 'shadow-xs');
          btn3.classList.remove('border-slate-200', 'bg-white');
        }
      } else {
        if (t2) t2.classList.remove('hidden');
        if (btn2) {
          btn2.classList.add('border-emerald-500', 'bg-emerald-50/50', 'shadow-xs');
          btn2.classList.remove('border-slate-200', 'bg-white');
        }
      }

      updateFnbModalUI();
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }

    function changeFnbMeals(type, delta) {
      let val = (currentFnbState.meals[type] || 0) + delta;
      if (val < 0) val = 0;
      currentFnbState.meals[type] = val;
      const el = document.getElementById(`qty-fnb-${type}`);
      if (el) el.value = val;
      updateFnbModalUI();
    }

    function onFnbMealChange() {
      ['meat', 'low_carbon', 'vegan'].forEach(type => {
        const el = document.getElementById(`qty-fnb-${type}`);
        if (el) {
          const val = Math.max(0, parseInt(el.value, 10) || 0);
          currentFnbState.meals[type] = val;
        }
      });
      updateFnbModalUI();
    }

    function applyFnbQuickScenario(scenario) {
      if (scenario === 'baseline_100') {
        currentFnbState.meals = { meat: 100, low_carbon: 0, vegan: 0 };
      } else if (scenario === 'balanced_100') {
        currentFnbState.meals = { meat: 20, low_carbon: 50, vegan: 30 };
      } else if (scenario === 'vegan_100') {
        currentFnbState.meals = { meat: 0, low_carbon: 0, vegan: 100 };
      }
      ['meat', 'low_carbon', 'vegan'].forEach(type => {
        const el = document.getElementById(`qty-fnb-${type}`);
        if (el) el.value = currentFnbState.meals[type];
      });
      updateFnbModalUI();
    }

    function onFnbIngredientChange() {
      const map = {
        beef: 'qty-fnb-beef',
        pork: 'qty-fnb-pork',
        poultry: 'qty-fnb-poultry',
        fish: 'qty-fnb-fish',
        plant_protein: 'qty-fnb-plant_protein',
        veg: 'qty-fnb-veg',
        cheese: 'qty-fnb-cheese',
        coffee_kg: 'qty-fnb-coffee_kg'
      };
      for (const [key, id] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) {
          currentFnbState.ingredients[key] = Math.max(0, parseFloat(el.value) || 0);
        }
      }
      updateFnbModalUI();
    }

    function onFnbSpendChange() {
      const el = document.getElementById('qty-fnb-spend');
      if (el) {
        currentFnbState.spendWon = Math.max(0, parseFloat(el.value) || 0) * 10000;
      }
      updateFnbModalUI();
    }

    function updateFnbModalUI() {
      const optCoffee = document.getElementById('fnb-opt-coffee');
      const optFruit = document.getElementById('fnb-opt-fruit');
      const optPortion = document.getElementById('fnb-opt-portion');
      currentFnbState.options.coffee = optCoffee ? optCoffee.checked : false;
      currentFnbState.options.fruit = optFruit ? optFruit.checked : false;
      currentFnbState.options.portion = optPortion ? optPortion.checked : false;

      let baselineKg = 0;
      let actualKg = 0;
      let additionalSavingKg = 0;

      const EF = window.EmissionFactors;
      const factorBaseline = EF ? EF.get('food', 'meal_meat_baseline') : 7.20;
      const factorLowCarbon = EF ? EF.get('food', 'meal_low_carbon') : 2.80;
      const factorVegan = EF ? EF.get('food', 'meal_vegan') : 1.20;

      if (currentFnbState.tier === 1) {
        const ing = currentFnbState.ingredients;
        const fBeef = EF ? EF.get('food', 'beef') : 59.60;
        const fPork = EF ? EF.get('food', 'pork') : 7.60;
        const fPoultry = EF ? EF.get('food', 'poultry') : 5.70;
        const fFish = EF ? EF.get('food', 'fish') : 5.10;
        const fPlant = EF ? EF.get('food', 'plant_protein') : 2.20;
        const fVeg = EF ? EF.get('food', 'vegetables_fruits') : 0.80;
        const fCheese = EF ? EF.get('food', 'cheese_dairy') : 13.50;
        const fCoffee = EF ? EF.get('food', 'coffee') : 16.50;

        actualKg = (ing.beef * fBeef) + (ing.pork * fPork) + (ing.poultry * fPoultry) +
                   (ing.fish * fFish) + (ing.plant_protein * fPlant) + (ing.veg * fVeg) +
                   (ing.cheese * fCheese) + (ing.coffee_kg * fCoffee);
        
        const totalKg = ing.beef + ing.pork + ing.poultry + ing.fish + ing.plant_protein + ing.veg + ing.cheese;
        baselineKg = totalKg > 0 ? (totalKg * 18.5) : 0;
      } else if (currentFnbState.tier === 3) {
        const spendWon = currentFnbState.spendWon || 0;
        const spendProxyFactor = 0.00045;
        baselineKg = spendWon * spendProxyFactor;
        actualKg = baselineKg * 0.65;
      } else {
        const meals = currentFnbState.meals;
        const totalMeals = (meals.meat || 0) + (meals.low_carbon || 0) + (meals.vegan || 0);
        baselineKg = totalMeals * factorBaseline;
        actualKg = (meals.meat * factorBaseline) + (meals.low_carbon * factorLowCarbon) + (meals.vegan * factorVegan);

        const badge = document.getElementById('fnb-total-meals-badge');
        if (badge) badge.textContent = `총 ${totalMeals}인분`;

        if (currentFnbState.options.coffee) additionalSavingKg += totalMeals * 0.06;
        if (currentFnbState.options.fruit) additionalSavingKg += totalMeals * 0.12;
        if (currentFnbState.options.portion) additionalSavingKg += actualKg * 0.10;
      }

      let netReductionKg = Math.max(0, (baselineKg - actualKg) + additionalSavingKg);
      let reductionPct = baselineKg > 0 ? ((netReductionKg / baselineKg) * 100) : 0;
      if (reductionPct > 100) reductionPct = 100;

      currentFnbState.baselineCarbonKg = baselineKg;
      currentFnbState.actualCarbonKg = actualKg;
      currentFnbState.reductionKg = netReductionKg;
      currentFnbState.reductionPercent = reductionPct;

      const elBase = document.getElementById('fnb-baseline-carbon');
      const elAct = document.getElementById('fnb-actual-carbon');
      const elRed = document.getElementById('fnb-total-reduction-kg');
      const elPct = document.getElementById('fnb-reduction-percent');

      if (elBase) elBase.textContent = `${baselineKg.toFixed(2)} kg`;
      if (elAct) elAct.textContent = `${actualKg.toFixed(2)} kg`;
      if (elRed) elRed.textContent = netReductionKg.toFixed(2);
      if (elPct) elPct.textContent = `${reductionPct.toFixed(1)}% 감축`;
    }

    function submitFnbSimulation() {
      const usernameInput = document.getElementById('fnb-username');
      const username = (usernameInput && usernameInput.value.trim()) || '익명 참여자';

      if (currentFnbState.reductionKg <= 0 && currentFnbState.baselineCarbonKg <= 0) {
        showToast('식단 인원수 또는 식재료 정보를 1개 이상 입력해 주세요.', true);
        return;
      }

      const scope3Grams = Math.round(currentFnbState.reductionKg * 1000);
      sessionStats.items.fnb_reduction = scope3Grams;

      sendParticipation(username, (data) => {
        showToast('참여 완료! 친환경 식음료 & 케이터링 실천 내역이 성공적으로 반영되었습니다.');
      }, closeFnbSimulatorModal);
    }

    window.openFnbSimulatorModal = openFnbSimulatorModal;
    window.closeFnbSimulatorModal = closeFnbSimulatorModal;
    window.setFnbTier = setFnbTier;
    window.changeFnbMeals = changeFnbMeals;
    window.onFnbMealChange = onFnbMealChange;
    window.applyFnbQuickScenario = applyFnbQuickScenario;
    window.onFnbIngredientChange = onFnbIngredientChange;
    window.onFnbSpendChange = onFnbSpendChange;
    window.updateFnbModalUI = updateFnbModalUI;
    window.submitFnbSimulation = submitFnbSimulation;

    window.openFreightSimulatorModal = openFreightSimulatorModal;
    window.closeFreightSimulatorModal = closeFreightSimulatorModal;
    window.setFreightMode = setFreightMode;
    window.changeFreightDistance = changeFreightDistance;
    window.changeFreightWeight = changeFreightWeight;
    window.onFreightAllocationChange = onFreightAllocationChange;
    window.setAllocation = setAllocation;
    window.updateFreightModalUI = updateFreightModalUI;
    window.submitFreightSimulation = submitFreightSimulation;


  // Export states and functions to window
  window.venueEcologyState = venueEcologyState;
  window.currentFreightState = currentFreightState;
  window.currentFnbState = currentFnbState;
  window.currentEcoQuantities = currentEcoQuantities;
  window.currentTransportQuantities = currentTransportQuantities;
  window.currentTravelState = currentTravelState;
  window.TRAVEL_CITY_PRESETS = TRAVEL_CITY_PRESETS;
  window.setTravelTier = setTravelTier;
  window.applyTravelCityPreset = applyTravelCityPreset;
  window.setTravelMode = setTravelMode;
  window.toggleTravelRoundTrip = toggleTravelRoundTrip;
  window.changeTravelDistance = changeTravelDistance;
  window.changeTravelPassengers = changeTravelPassengers;
  window.onTravelParamChange = onTravelParamChange;
  window.runTravelProxyCalculation = runTravelProxyCalculation;
  window.updateTravelModalUI = updateTravelModalUI;
  window.calculateTravelEmissions = calculateTravelEmissions;
  window.currentWasteQuantities = currentWasteQuantities;

  // Auto-exported modal functions to window
  window.openVenueEcologyModal = openVenueEcologyModal;
  window.closeVenueEcologyModal = closeVenueEcologyModal;
  window.handleFileChange = handleFileChange;
  window.checkVenueEcologySubmitStatus = checkVenueEcologySubmitStatus;
  window.submitVenueEcology = submitVenueEcology;
  window.openEcoSimulatorModal = openEcoSimulatorModal;
  window.closeEcoSimulatorModal = closeEcoSimulatorModal;
  window.changeQty = changeQty;
  window.updateModalUI = updateModalUI;
  window.openTransportSimulatorModal = openTransportSimulatorModal;
  window.closeTransportSimulatorModal = closeTransportSimulatorModal;
  window.changeTransportQty = changeTransportQty;
  window.updateTransportModalUI = updateTransportModalUI;
  window.setEnergyScopeMode = setEnergyScopeMode;
  window.openEnergySimulatorModal = openEnergySimulatorModal;
  window.closeEnergySimulatorModal = closeEnergySimulatorModal;
  window.changeEnergyQty = changeEnergyQty;
  window.changeDieselQty = changeDieselQty;
  window.updateEnergyModalUI = updateEnergyModalUI;
  window.submitEnergySimulation = submitEnergySimulation;
  window.openUpcycleSimulatorModal = openUpcycleSimulatorModal;
  window.closeUpcycleSimulatorModal = closeUpcycleSimulatorModal;
  window.changeUpcycleQty = changeUpcycleQty;
  window.changeBannerQty = changeBannerQty;
  window.updateUpcycleModalUI = updateUpcycleModalUI;
  window.submitUpcycleSimulation = submitUpcycleSimulation;
  window.openPaperBoothSimulatorModal = openPaperBoothSimulatorModal;
  window.closePaperBoothSimulatorModal = closePaperBoothSimulatorModal;
  window.changeBoothQty = changeBoothQty;
  window.updateBoothModalUI = updateBoothModalUI;
  window.submitBoothSimulation = submitBoothSimulation;
  window.showToast = showToast;
  window.openSignageSimulatorModal = openSignageSimulatorModal;
  window.closeSignageSimulatorModal = closeSignageSimulatorModal;
  window.changeSignagePaperQty = changeSignagePaperQty;
  window.changeSignageQty = changeSignageQty;
  window.updateSignageModalUI = updateSignageModalUI;
  window.submitSignageSimulation = submitSignageSimulation;
  window.submitEcoSimulation = submitEcoSimulation;
  window.submitTransportSimulation = submitTransportSimulation;
})();
