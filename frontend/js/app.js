/**
 * MICE ESG Platform - Core Orchestrator (app.js)
 * Architecture: Modular (Core, Env, Social, Gov, Utils)
 */

    // Dynamic Emission Factor Accessors (NZCE & GHG Protocol)
    function getEcoCoefficients() {
      return {
        cup: (window.EmissionFactors ? window.EmissionFactors.get('food', 'reusable_cup') : 52),
        plate: (window.EmissionFactors ? window.EmissionFactors.get('food', 'reusable_plate') : 37),
        bowl: (window.EmissionFactors ? window.EmissionFactors.get('food', 'reusable_bowl') : 60),
        fork: (window.EmissionFactors ? window.EmissionFactors.get('food', 'reusable_fork') : 9)
      };
    }
    function getTransportCoefficient() {
      return window.EmissionFactors ? window.EmissionFactors.get('transport', 'shuttle_reduction') : 120;
    }
    function getEnergyCoefficient() {
      if (window.EmissionFactors) {
        return window.EmissionFactors.get('energy', 'electricity_grid') * 1000;
      }
      return 478.1;
    }
    const ECO_COEFFICIENTS = new Proxy({}, {
      get: function(target, prop) {
        return getEcoCoefficients()[prop] || 0;
      }
    });
    var TRANSPORT_COEFFICIENT = 120;
    var ENERGY_COEFFICIENT = 478.1;

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
    var sessionStats = {
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
        diesel_generator: 0,
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
    window.sessionStats = sessionStats;

    function recalculateSessionTotalCarbon() {
      let scope1 = 0;
      let scope2 = 0;
      let scope3 = 0;
      const items = sessionStats.items;
      
      // Eco (Scope 3)
      const ecoCoeffs = getEcoCoefficients();
      scope3 += (items.reusable_cup || 0) * ecoCoeffs.cup;
      scope3 += (items.reusable_plate || 0) * ecoCoeffs.plate;
      scope3 += (items.reusable_bowl || 0) * ecoCoeffs.bowl;
      scope3 += (items.reusable_fork || 0) * ecoCoeffs.fork;
      
      // Transport & Destination Travel (Scope 3 Category 4/5 & NZCE Cat 4 & Cat 5 Local)
      if (items.travel_reduction !== undefined && items.travel_reduction !== null) {
        scope3 += (items.travel_reduction || 0);
      } else {
        const transportCoeff = getTransportCoefficient();
        scope3 += (items.public_transport || 0) * transportCoeff;
      }
      if (items.local_transport_reduction) {
        scope3 += (items.local_transport_reduction || 0);
      }
      
      // Energy (Scope 1 - 디젤 발전기 무공해 대체)
      const dieselCoeff = window.EmissionFactors ? (window.EmissionFactors.get('energy', 'diesel_generator') * 1000) : 2605.8;
      scope1 += (items.diesel_generator || 0) * dieselCoeff;

      // Energy (Scope 2 - 전시장 계통 전력 전환)
      const energyCoeff = getEnergyCoefficient();
      scope2 += (items.renewable_energy || 0) * energyCoeff;
      
      // Upcycle keyring (Scope 3)
      const keyrings = items.upcycled_keyring || 0;
      if (keyrings > 0) {
        const keyringUpcycle = window.EmissionFactors ? window.EmissionFactors.get('production', 'keyring_upcycle') : 16;
        const keyringNew = window.EmissionFactors ? window.EmissionFactors.get('production', 'keyring_new') : 50;
        scope3 += keyrings * keyringUpcycle - keyringNew;
      }
      
      // Upcycle banner (Scope 3)
      const bannerCoeff = window.EmissionFactors ? window.EmissionFactors.get('production', 'banner_upcycle') : 6280;
      scope3 += (items.upcycled_banner || 0) * bannerCoeff;
      
      // Paper booth (Scope 3)
      const boothCoeff = window.EmissionFactors ? window.EmissionFactors.get('production', 'paper_booth') : 10125;
      scope3 += (items.paper_booth || 0) * boothCoeff;
      
      // Digital signage (Scope 3)
      scope3 += (items.digital_signage || 0) * 1;
      
      // Freight & Logistics (Scope 3 transport & Scope 1 forklift)
      scope3 += (items.freight_reduction || 0);
      scope1 += (items.freight_forklift || 0);

      // Food & Beverage Catering (Scope 3 Category 1 - Purchased goods & services)
      scope3 += (items.fnb_reduction || 0);

      // Zero Waste Recycling (Scope 3 Category 5 - Waste generated in operations)
      scope3 += (items.waste_recycling || 0);

      sessionStats.scope1Grams = Math.round(scope1);
      sessionStats.scope2Grams = Math.round(scope2);
      sessionStats.scope3Grams = Math.round(scope3);
      sessionStats.totalReducedCarbonGrams = Math.round(scope1 + scope2 + scope3);

      // Recalculate active actions count
      let actionsCount = 0;
      if ((items.reusable_cup || 0) > 0 || (items.reusable_plate || 0) > 0 || (items.reusable_bowl || 0) > 0 || (items.reusable_fork || 0) > 0) {
        actionsCount += 1;
      }
      if ((items.public_transport || 0) > 0 || (items.travel_reduction || 0) > 0 || (items.local_transport_reduction || 0) > 0 || (items.local_transport_km || 0) > 0) actionsCount += 1;
      if ((items.renewable_energy || 0) > 0 || (items.diesel_generator || 0) > 0) actionsCount += 1;
      if ((items.upcycled_keyring || 0) > 0) actionsCount += 1;
      if ((items.upcycled_banner || 0) > 0) actionsCount += 1;
      if ((items.paper_booth || 0) > 0) actionsCount += 1;
      if ((items.digital_signage || 0) > 0) actionsCount += 1;
      if ((items.freight_reduction || 0) > 0 || (items.freight_forklift || 0) > 0) actionsCount += 1;
      if ((items.fnb_reduction || 0) > 0) actionsCount += 1;
      if ((items.waste_recycling || 0) > 0) actionsCount += 1;
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

        // Update UI with error guard
        try {
          updateDashboardUI(sessionStats);
        } catch (uiErr) {
          console.error('Error in updateDashboardUI:', uiErr);
        }

        if (callback) {
          try { callback(data); } catch (cbErr) { console.error('Error in callback:', cbErr); }
        } else {
          showToast(`실천 내역이 성공적으로 반영되었습니다.`);
        }
        if (modalCloseFn) {
          try { modalCloseFn(); } catch (closeErr) { console.error('Error closing modal:', closeErr); }
        }
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
    // Show Toast helper
    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-message');
      if (!toast || !toastMsg) return;
      
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
    window.showToast = showToast;

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
        } else if (element.id === 'kpi-local-transport-distance') {
          element.textContent = val.toLocaleString() + " p·km";
        } else if (element.id === 'kpi-waste-reduced-carbon' || element.id === 'kpi-transport-reduced-carbon' || element.id === 'kpi-local-transport-reduced-carbon' || element.id === 'kpi-energy-reduced-carbon' || element.id === 'kpi-upcycle-reduced-carbon' || element.id === 'kpi-booth-reduced-carbon' || element.id === 'kpi-signage-reduced-carbon') {
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
      if (typeof saveAllStateToLocalStorage === 'function') {
        saveAllStateToLocalStorage();
      } else if (typeof window.saveAllStateToLocalStorage === 'function') {
        window.saveAllStateToLocalStorage();
      }

      const vEcology = window.venueEcologyState || (typeof venueEcologyState !== 'undefined' ? venueEcologyState : {});
      const lFood = window.localFoodState || (typeof localFoodState !== 'undefined' ? localFoodState : {});
      const lEconomy = window.localEconomyState || (typeof localEconomyState !== 'undefined' ? localEconomyState : {});
      const incState = window.inclusionState || (typeof inclusionState !== 'undefined' ? inclusionState : { programs: [] });
      const eduState = window.esgEduState || (typeof esgEduState !== 'undefined' ? esgEduState : { programs: [] });
      const suppState = window.supportersState || (typeof supportersState !== 'undefined' ? supportersState : {});
      const donState = window.donationState || (typeof donationState !== 'undefined' ? donationState : {});
      const knowState = window.knowledgeState || (typeof knowledgeState !== 'undefined' ? knowledgeState : { programs: [] });
      const isoState = window.iso20121State || (typeof iso20121State !== 'undefined' ? iso20121State : {});
      const repState = window.esgReportState || (typeof esgReportState !== 'undefined' ? esgReportState : {});
      const advState = window.advisoryState || (typeof advisoryState !== 'undefined' ? advisoryState : {});
      const bfState = window.barrierFreeState || (typeof barrierFreeState !== 'undefined' ? barrierFreeState : { checkedItems: [] });
      const slState = window.safetyLaborState || (typeof safetyLaborState !== 'undefined' ? safetyLaborState : { checkedItems: [] });
      const shState = window.stakeholderState || (typeof stakeholderState !== 'undefined' ? stakeholderState : {});
      const pState = window.pledgesState || (typeof pledgesState !== 'undefined' ? pledgesState : []);

      const hasAnyActionSubmitted = (
        (stats.totalReducedCarbonGrams > 0) ||
        ((stats.items.reusable_cup || 0) > 0) ||
        ((stats.items.public_transport_km || 0) > 0) ||
        ((stats.items.renewable_energy || 0) > 0) ||
        ((stats.items.diesel_generator || 0) > 0) ||
        ((stats.items.upcycled_keyring || 0) > 0) ||
        ((stats.items.upcycled_banner || 0) > 0) ||
        ((stats.items.paper_booth || 0) > 0) ||
        ((stats.items.paperless_booth || 0) > 0) ||
        ((stats.items.digital_signage || 0) > 0) ||
        ((stats.items.waste_recycling || 0) > 0) ||
        ((stats.items.freight_reduction || 0) > 0) ||
        ((stats.items.freight_forklift || 0) > 0) ||
        ((stats.items.fnb_reduction || 0) > 0) ||
        ((stats.items.travel_reduction || 0) > 0) ||
        ((stats.items.public_transport || 0) > 0) ||
        ((stats.items.local_transport_km || 0) > 0) ||
        ((stats.items.local_transport_reduction || 0) > 0) ||
        (bfState && bfState.submitted) ||
        (slState && slState.submitted) ||
        (shState && shState.submitted) ||
        (pState && pState.length > 0) ||
        vEcology.submitted ||
        lFood.submitted ||
        lEconomy.submitted ||
        incState.submitted ||
        eduState.submitted ||
        suppState.submitted ||
        donState.submitted ||
        knowState.submitted ||
        isoState.submitted ||
        repState.submitted ||
        advState.submitted
      );

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

      if (vEcology && vEcology.submitted) {
        if (venueEcologyCard) venueEcologyCard.classList.remove('hidden');
        if (venueEcologyFilename) {
          venueEcologyFilename.textContent = vEcology.fileName;
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
          (vEcology.checkedCerts || []).forEach(cert => {
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

      if (bfState && bfState.submitted) {
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
          (bfState.checkedItems || []).forEach(item => {
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

      if (slState && slState.submitted) {
        if (safetyLaborCard) safetyLaborCard.classList.remove('hidden');
        const scoreRate = (((slState.checkedItems || []).length / 6) * 100).toFixed(1);
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
          (slState.checkedItems || []).forEach(item => {
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
        if (lEconomy && lEconomy.submitted) {
          localEconomyCard.classList.remove('hidden');
          const amtText = document.getElementById('kpi-local-economy-amount-text');
          const userText = document.getElementById('kpi-local-economy-username-text');
          const detailsBox = document.getElementById('kpi-local-economy-details-box');
          const detailsText = document.getElementById('kpi-local-economy-details-text');
          if (amtText) amtText.textContent = `${(lEconomy.amount || 0).toLocaleString()} 만원`;
          if (userText) userText.textContent = lEconomy.username || sessionStats.username || '익명 참관객';
          if (detailsText && lEconomy.details) {
            detailsText.textContent = lEconomy.details;
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
        if (lFood && lFood.submitted) {
          localFoodCard.classList.remove('hidden');
          const carbonText = document.getElementById('kpi-local-food-reduced-carbon');
          const amtText = document.getElementById('kpi-local-food-amount-text');
          const storeText = document.getElementById('kpi-local-food-store-text');
          const userText = document.getElementById('kpi-local-food-username-text');
          const detailsBox = document.getElementById('kpi-local-food-details-box');

          if (carbonText) carbonText.textContent = `${((lFood.reductionGrams || 0) / 1000).toFixed(3)} kgCO2eq`;
          if (amtText) amtText.textContent = `${(lFood.amount || 0).toLocaleString()}원`;
          if (storeText) storeText.textContent = lFood.store || '';
          if (userText) userText.textContent = lFood.username || sessionStats.username || '익명 실천자';
          
          if (detailsBox) detailsBox.classList.remove('hidden');
        } else {
          localFoodCard.classList.add('hidden');
        }
      }

      // Update Inclusion Outcome Card
      const inclusionCard = document.getElementById('kpi-inclusion-card');
      if (inclusionCard) {
        if (incState && incState.submitted) {
          inclusionCard.classList.remove('hidden');
          let totalP = 0;
          let count = 0;
          const tagsContainer = document.getElementById('kpi-inclusion-program-tags');
          if (tagsContainer) tagsContainer.innerHTML = '';
          (incState.programs || []).forEach(p => {
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
        if (eduState && eduState.submitted) {
          esgEduCard.classList.remove('hidden');
          let totalP = 0;
          let count = 0;
          const tagsContainer = document.getElementById('kpi-esg-edu-program-tags');
          if (tagsContainer) tagsContainer.innerHTML = '';
          (eduState.programs || []).forEach(p => {
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
        if ((shState && shState.submitted) || (pState && pState.length > 0)) {
          stakeholderCard.classList.remove('hidden');

          let totalPeople = 0;
          (pState || []).forEach(p => {
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
        if (suppState && suppState.submitted) {
          supportersCard.classList.remove('hidden');
          const userText = document.getElementById('kpi-supporters-username-text');
          const fileText = document.getElementById('kpi-supporters-filename-text');
          const detailsBox = document.getElementById('kpi-supporters-details-box');
          const detailsText = document.getElementById('kpi-supporters-details-text');
          if (userText) userText.textContent = suppState.username || sessionStats.username || '청년 서포터즈';
          if (fileText) fileText.textContent = suppState.fileName ? `${suppState.fileName} (${(suppState.fileType || '').toUpperCase()})` : '파일 첨부됨';
          if (detailsText && suppState.role) {
            detailsText.textContent = suppState.role;
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
        if (donState && donState.submitted) {
          donationCard.classList.remove('hidden');
          const amtText = document.getElementById('kpi-donation-amount-text');
          const targetText = document.getElementById('kpi-donation-target-text');
          const detailsBox = document.getElementById('kpi-donation-details-box');
          const detailsText = document.getElementById('kpi-donation-details-text');
          if (amtText) amtText.textContent = `${(donState.amount || 0).toLocaleString()} 만원`;
          if (targetText) targetText.textContent = donState.target || '미지정 기부처';
          if (detailsText && donState.details) {
            detailsText.textContent = donState.details;
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
        if (knowState && knowState.submitted) {
          knowledgeCard.classList.remove('hidden');
          let totalP = 0;
          let count = 0;
          const tagsContainer = document.getElementById('kpi-knowledge-program-tags');
          if (tagsContainer) tagsContainer.innerHTML = '';
          (knowState.programs || []).forEach(p => {
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
        if (isoState && isoState.submitted) {
          iso20121Card.classList.remove('hidden');
          const fileText = document.getElementById('kpi-iso20121-filename');
          const typeText = document.getElementById('kpi-iso20121-filetype');
          const detailsBox = document.getElementById('kpi-iso20121-details-box');
          const certOrgText = document.getElementById('kpi-iso20121-cert-org-text');
          const userText = document.getElementById('kpi-iso20121-username-text');
          if (fileText) fileText.textContent = isoState.fileName || 'ISO_20121_Certificate.pdf';
          if (typeText) typeText.textContent = isoState.fileType ? `${(isoState.fileType || '').toUpperCase()} 제출 완료` : '인증서 파일 제출';
          if (certOrgText) certOrgText.textContent = isoState.certOrg || '공식 인증 기관';
          if (userText) userText.textContent = isoState.username || sessionStats.username || '담당자';
          if (detailsBox) detailsBox.classList.remove('hidden');
        } else {
          iso20121Card.classList.add('hidden');
        }
      }
      // Update ESG Report Outcome Card
      const esgReportCard = document.getElementById('kpi-esg-report-card');
      if (esgReportCard) {
        if (repState && repState.submitted) {
          esgReportCard.classList.remove('hidden');
          const fileText = document.getElementById('kpi-esg-report-filename');
          const titleText = document.getElementById('kpi-esg-report-title-text');
          const userText = document.getElementById('kpi-esg-report-username-text');
          const detailsBox = document.getElementById('kpi-esg-report-details-box');
          if (fileText) fileText.textContent = repState.fileName || 'ESG_Outcome_Report.pdf';
          if (titleText) titleText.textContent = repState.title || '연간 ESG 성과 보고서';
          if (userText) userText.textContent = repState.username || sessionStats.username || '담당자';
          if (detailsBox) detailsBox.classList.remove('hidden');
        } else {
          esgReportCard.classList.add('hidden');
        }
      }

      // Update Advisory Committee Outcome Card
      const advisoryCard = document.getElementById('kpi-advisory-card');
      if (advisoryCard) {
        if (advState && advState.submitted) {
          advisoryCard.classList.remove('hidden');
          const locText = document.getElementById('kpi-advisory-location-text');
          const dtText = document.getElementById('kpi-advisory-datetime-text');
          const summaryText = document.getElementById('kpi-advisory-summary-text');
          const userText = document.getElementById('kpi-advisory-username-text');
          const detailsBox = document.getElementById('kpi-advisory-details-box');
          const photoContainer = document.getElementById('kpi-advisory-photo-container');
          const photoPreview = document.getElementById('kpi-advisory-photo-preview');

          if (locText) locText.textContent = advState.location || '회의 장소 미입력';
          if (dtText) dtText.textContent = advState.datetime || '회의 일시 미입력';
          if (summaryText) summaryText.textContent = advState.summary || '자문 위원회 주요 안건 기록 없음';
          if (userText) userText.textContent = advState.username || sessionStats.username || '기록자';
          
          if (detailsBox) detailsBox.classList.remove('hidden');

          if (advState && advState.previewUrl) {
            if (photoPreview) photoPreview.src = advState.previewUrl;
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

      if ((stats.items.public_transport || 0) > 0 || (stats.items.travel_reduction || 0) > 0) {
        if (transportCard) transportCard.classList.remove('hidden');
      } else {
        if (transportCard) transportCard.classList.add('hidden');
      }

      const localTransportCard = document.getElementById('kpi-local-transport-card');
      if ((stats.items.local_transport_reduction || 0) > 0 || (stats.items.local_transport_km || 0) > 0) {
        if (localTransportCard) localTransportCard.classList.remove('hidden');
      } else {
        if (localTransportCard) localTransportCard.classList.add('hidden');
      }

      if ((stats.items.renewable_energy || 0) > 0 || (stats.items.diesel_generator || 0) > 0) {
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

      // Update Freight & Logistics KPI Card
      const freightCard = document.getElementById('kpi-freight-card');
      const freightTotal = (stats.items.freight_reduction || 0) + (stats.items.freight_forklift || 0);
      if (freightTotal > 0) {
        if (freightCard) freightCard.classList.remove('hidden');
        const carbonEl = document.getElementById('kpi-freight-reduced-carbon');
        const tonkmEl = document.getElementById('kpi-freight-tonkm');
        const modeEl = document.getElementById('kpi-freight-mode');
        if (carbonEl) carbonEl.textContent = `${(freightTotal / 1000).toFixed(2)} kgCO2e`;
        if (tonkmEl) {
          const frState = window.currentFreightState || (typeof currentFreightState !== 'undefined' ? currentFreightState : {});
          const tk = frState.distance ? (frState.distance * frState.weight * ((frState.allocation || 100) / 100)) : 0;
          tonkmEl.textContent = `${tk.toFixed(1)} ton·km`;
        }
        if (modeEl) {
          const modeNames = {
            'van_1t_diesel': '1t 경유 화물차',
            'van_1t_electric': '1t 전기 화물차',
            'truck_heavy': '중대형 트럭',
            'rail_freight': '철도 화물'
          };
          const frState2 = window.currentFreightState || (typeof currentFreightState !== 'undefined' ? currentFreightState : {});
          modeEl.textContent = modeNames[frState2.mode] || '친환경 화물차';
        }
      } else {
        if (freightCard) freightCard.classList.add('hidden');
      }

      // Update F&B Catering KPI Card
      const fnbCard = document.getElementById('kpi-fnb-card');
      const fnbTotal = stats.items.fnb_reduction || 0;
      if (fnbTotal > 0) {
        if (fnbCard) fnbCard.classList.remove('hidden');
        const carbonEl = document.getElementById('kpi-fnb-reduced-carbon');
        const mealsEl = document.getElementById('kpi-fnb-total-meals');
        const tierEl = document.getElementById('kpi-fnb-tier');
        if (carbonEl) carbonEl.textContent = `${(fnbTotal / 1000).toFixed(2)} kgCO2e`;
        if (mealsEl) {
          const fState = window.currentFnbState || (typeof currentFnbState !== 'undefined' ? currentFnbState : null);
          const totalMeals = fState && fState.meals ? ((fState.meals.meat || 0) + (fState.meals.low_carbon || fState.meals.lowCarbon || 0) + (fState.meals.vegan || 0)) : 0;
          mealsEl.textContent = `${totalMeals.toLocaleString()} 식`;
        }
        if (tierEl) {
          const fState = window.currentFnbState || (typeof currentFnbState !== 'undefined' ? currentFnbState : null);
          const tierNames = {
            'tier2': 'Tier 2 (식단형)',
            'tier1': 'Tier 1 (식재료)',
            'tier3': 'Tier 3 (지출액)'
          };
          tierEl.textContent = fState ? (tierNames[fState.tier] || '식단 기반') : '식단 기반';
        }
      } else {
        if (fnbCard) fnbCard.classList.add('hidden');
      }

      // Update Waste Recycling KPI Card (Card 10)
      const wasteRecyclingCard = document.getElementById('kpi-waste-recycling-card');
      const wasteRecyclingTotal = stats.items.waste_recycling || 0;
      if (wasteRecyclingTotal > 0) {
        if (wasteRecyclingCard) wasteRecyclingCard.classList.remove('hidden');
        const carbonEl = document.getElementById('kpi-waste-recycling-reduced-carbon');
        const totalKgEl = document.getElementById('kpi-waste-recycling-total-kg');
        const rateEl = document.getElementById('kpi-waste-recycling-rate');
        if (carbonEl) carbonEl.textContent = `${(wasteRecyclingTotal / 1000).toFixed(2)} kgCO2e`;
        const wState = window.currentWasteQuantities || stats.wasteQuantities || { paper: 0, plastic: 0, food: 0, general: 0 };
        const totalDiverted = (wState.paper || 0) + (wState.plastic || 0) + (wState.food || 0);
        const totalAll = totalDiverted + (wState.general || 0);
        if (totalKgEl) totalKgEl.textContent = `${totalDiverted.toLocaleString()} kg`;
        if (rateEl) {
          const rate = totalAll > 0 ? ((totalDiverted / totalAll) * 100).toFixed(1) : '100.0';
          rateEl.textContent = `${rate}%`;
        }
      } else {
        if (wasteRecyclingCard) wasteRecyclingCard.classList.add('hidden');
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

      // 5-2. Animate waste reduced carbon with dynamic coefficients
      const ecoCoeffs = getEcoCoefficients();
      const wasteReducedCarbon = (stats.items.reusable_cup || 0) * ecoCoeffs.cup +
                                 (stats.items.reusable_plate || 0) * ecoCoeffs.plate +
                                 (stats.items.reusable_bowl || 0) * ecoCoeffs.bowl +
                                 (stats.items.reusable_fork || 0) * ecoCoeffs.fork;
      const lastWasteReducedCarbon = (lastStats.reusable_cup || 0) * ecoCoeffs.cup +
                                     (lastStats.reusable_plate || 0) * ecoCoeffs.plate +
                                     (lastStats.reusable_bowl || 0) * ecoCoeffs.bowl +
                                     (lastStats.reusable_fork || 0) * ecoCoeffs.fork;
      animateValue(document.getElementById('kpi-waste-reduced-carbon'), lastWasteReducedCarbon, wasteReducedCarbon, 800);

      // 6. Animate detailed items
      animateValue(document.getElementById('kpi-cup-count'), lastStats.reusable_cup || 0, stats.items.reusable_cup || 0, 800);
      animateValue(document.getElementById('kpi-plate-count'), lastStats.reusable_plate || 0, stats.items.reusable_plate || 0, 800);
      animateValue(document.getElementById('kpi-bowl-count'), lastStats.reusable_bowl || 0, stats.items.reusable_bowl || 0, 800);
      animateValue(document.getElementById('kpi-fork-count'), lastStats.reusable_fork || 0, stats.items.reusable_fork || 0, 800);

      // 7. Animate Transport details (NZCE Cat 4 & GLEC)
      const transportCoeff = getTransportCoefficient();
      const transportReducedCarbon = (stats.items.travel_reduction !== undefined && stats.items.travel_reduction !== null)
        ? (stats.items.travel_reduction || 0)
        : ((stats.items.public_transport || 0) * transportCoeff);
      const lastTransportReducedCarbon = (lastStats.travel_reduction !== undefined && lastStats.travel_reduction !== null)
        ? (lastStats.travel_reduction || 0)
        : ((lastStats.public_transport || 0) * transportCoeff);
      animateValue(document.getElementById('kpi-total-distance'), lastStats.public_transport || 0, stats.items.public_transport || 0, 800);
      animateValue(document.getElementById('kpi-transport-participants'), ((stats.items.public_transport || 0) > 0 || (stats.items.travel_reduction || 0) > 0) ? 1 : 0, transportParticipantsCount, 800);
      animateValue(document.getElementById('kpi-transport-reduced-carbon'), lastTransportReducedCarbon, transportReducedCarbon, 800);

      // 7-B. Animate Local Transport details (NZCE Cat 5)
      const localTransportReducedCarbon = stats.items.local_transport_reduction || 0;
      const lastLocalTransportReducedCarbon = lastStats.local_transport_reduction || 0;
      animateValue(document.getElementById('kpi-local-transport-reduced-carbon'), lastLocalTransportReducedCarbon, localTransportReducedCarbon, 800);
      animateValue(document.getElementById('kpi-local-transport-distance'), lastStats.local_transport_km || 0, stats.items.local_transport_km || 0, 800);

      // 8. Animate Energy details
      const energyCoeff = getEnergyCoefficient();
      const energyReducedCarbon = Math.round((stats.items.renewable_energy || 0) * energyCoeff);
      const lastEnergyReducedCarbon = Math.round((lastStats.renewable_energy || 0) * energyCoeff);

      // Scope 1, 2, 3 Breakdown elements
      const s1El = document.getElementById('kpi-scope1-kg');
      const s2El = document.getElementById('kpi-scope2-kg');
      const s3El = document.getElementById('kpi-scope3-kg');
      if (s1El) s1El.textContent = ((stats.scope1Grams || 0) / 1000).toFixed(2) + ' kg';
      if (s2El) s2El.textContent = ((stats.scope2Grams || 0) / 1000).toFixed(2) + ' kg';
      if (s3El) s3El.textContent = ((stats.scope3Grams || 0) / 1000).toFixed(2) + ' kg';

      // Update Scope 1, 2, 3 Donut Chart & Category Breakdown
      if (typeof updateScopeDonutChart === 'function') {
        updateScopeDonutChart(stats);
      }

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
        travel_reduction: stats.items.travel_reduction || 0,
        renewable_energy: stats.items.renewable_energy || 0,
        upcycled_keyring: stats.items.upcycled_keyring || 0,
        upcycled_banner: stats.items.upcycled_banner || 0,
        paper_booth: stats.items.paper_booth || 0,
        digital_signage: stats.items.digital_signage || 0,
        freight_reduction: stats.items.freight_reduction || 0,
        freight_forklift: stats.items.freight_forklift || 0,
        fnb_reduction: stats.items.fnb_reduction || 0,
        papersSaved: papersSaved,
        keyringReducedCarbonGrams: stats.keyringReducedCarbonGrams || 0,
        keyringParticipants: stats.keyringParticipants || 0,
        paperBoothParticipants: stats.paperBoothParticipants || 0,
        signageParticipants: stats.signageParticipants || 0
      };
    }

    // Load saved state automatically on page load
    setTimeout(() => {
      if (typeof loadAllStateFromLocalStorage === 'function') {
        loadAllStateFromLocalStorage();
      } else if (typeof window.loadAllStateFromLocalStorage === 'function') {
        window.loadAllStateFromLocalStorage();
      }
    }, 100);

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
        closeVenueEcologyModal();
        closeEsgDisclosureModal();
        closePdfReportModal();
        closeEsgPresetsModal();
        if (typeof closeFreightSimulatorModal === 'function') closeFreightSimulatorModal();
        if (typeof closeFnbSimulatorModal === 'function') closeFnbSimulatorModal();
        if (typeof closeScopeBreakdownModal === 'function') closeScopeBreakdownModal();
      }
    });
    // Listen for emission factor profile changes and recalculate all KPIs live
    window.addEventListener('ef-profile-changed', function(e) {
      recalculateSessionTotalCarbon();
      if (typeof updateDashboardUI === 'function') {
        updateDashboardUI(sessionStats);
      }
      if (typeof updateModalUI === 'function') updateModalUI();
      if (typeof updateTransportModalUI === 'function') updateTransportModalUI();
      if (typeof updateEnergyModalUI === 'function') updateEnergyModalUI();
    });

    // ----------------------------------------------------
    // Scope 1, 2, 3 & Category Breakdown Calculation
    // ----------------------------------------------------
    function calculateScopeCategoryBreakdown(stats) {
      const s = stats || sessionStats || { items: {} };
      const items = s.items || {};
      const ecoCoeffs = (typeof getEcoCoefficients === 'function') ? getEcoCoefficients() : { cup: 23, plate: 55, bowl: 45, fork: 9 };

      // Scope 1 (Direct - diesel generator & electric forklift)
      const dieselCoeffG = (window.EmissionFactors && typeof window.EmissionFactors.get === 'function')
        ? (window.EmissionFactors.get('energy', 'diesel_generator') * 1000)
        : 2605.8;
      const dieselKg = ((items.diesel_generator || 0) * dieselCoeffG) / 1000;
      const forkliftKg = (items.freight_forklift || 0) / 1000;
      const scope1Kg = dieselKg + forkliftKg;

      // Scope 2 (Indirect - renewable electricity)
      const energyCoeffG = (typeof getEnergyCoefficient === 'function') ? getEnergyCoefficient() : 459.4;
      const energyKg = ((items.renewable_energy || 0) * energyCoeffG) / 1000;
      const scope2Kg = energyKg;

      // Scope 3: Category 1 (Purchased goods & services)
      const fnbKg = (items.fnb_reduction || 0) / 1000;
      const keyrings = items.upcycled_keyring || 0;
      let keyringKg = 0;
      if (keyrings > 0) {
        const keyringUpcycle = (window.EmissionFactors && typeof window.EmissionFactors.get === 'function')
          ? window.EmissionFactors.get('production', 'keyring_upcycle') : 16;
        const keyringNew = (window.EmissionFactors && typeof window.EmissionFactors.get === 'function')
          ? window.EmissionFactors.get('production', 'keyring_new') : 50;
        const keyringGrams = (keyrings * keyringUpcycle) - keyringNew;
        keyringKg = keyringGrams > 0 ? (keyringGrams / 1000) : 0;
      }
      const bannerCoeff = (window.EmissionFactors && typeof window.EmissionFactors.get === 'function')
        ? window.EmissionFactors.get('production', 'banner_upcycle') : 6280;
      const bannerKg = ((items.upcycled_banner || 0) * bannerCoeff) / 1000;

      const boothCoeff = (window.EmissionFactors && typeof window.EmissionFactors.get === 'function')
        ? window.EmissionFactors.get('production', 'paper_booth') : 10125;
      const boothKg = ((items.paper_booth || 0) * boothCoeff) / 1000;
      const cat1Kg = fnbKg + keyringKg + bannerKg + boothKg;

      // Scope 3: Category 4 (Participant destination travel - NZCE Cat 4 / GLEC)
      let travelKg = 0;
      if (items.travel_reduction !== undefined && items.travel_reduction !== null) {
        travelKg = (items.travel_reduction || 0) / 1000;
      } else {
        const transportCoeff = (typeof getTransportCoefficient === 'function') ? getTransportCoefficient() : 120;
        travelKg = ((items.public_transport || 0) * transportCoeff) / 1000;
      }

      // Scope 3: Category 5 (Local transportation - NZCE Cat 5)
      const localTransportKg = (items.local_transport_reduction || 0) / 1000;

      // Scope 3: Category 4/2 (Upstream freight logistics - GLEC)
      const freightKg = (items.freight_reduction || 0) / 1000;

      // Scope 3: Category 5 (Waste generated in operations - GRI 306)
      const reusableGrams = (items.reusable_cup || 0) * ecoCoeffs.cup +
                            (items.reusable_plate || 0) * ecoCoeffs.plate +
                            (items.reusable_bowl || 0) * ecoCoeffs.bowl +
                            (items.reusable_fork || 0) * ecoCoeffs.fork;
      const reusableKg = reusableGrams / 1000;
      const wasteRecyclingKg = (items.waste_recycling || 0) / 1000;
      const cat5WasteKg = reusableKg + wasteRecyclingKg;

      // Scope 3: Category 1 & 12 (Digital Operations - GRI 301)
      const signageKg = (items.digital_signage || 0) / 1000;

      const scope3Kg = cat1Kg + travelKg + localTransportKg + freightKg + cat5WasteKg + signageKg;
      const totalKg = scope1Kg + scope2Kg + scope3Kg;

      return {
        totalKg,
        scope1: {
          totalKg: scope1Kg,
          pct: totalKg > 0 ? (scope1Kg / totalKg) * 100 : 0,
          dieselKg,
          forkliftKg
        },
        scope2: {
          totalKg: scope2Kg,
          pct: totalKg > 0 ? (scope2Kg / totalKg) * 100 : 0,
          energyKg
        },
        scope3: {
          totalKg: scope3Kg,
          pct: totalKg > 0 ? (scope3Kg / totalKg) * 100 : 0,
          cat1: {
            totalKg: cat1Kg,
            fnbKg,
            keyringKg,
            bannerKg,
            boothKg
          },
          cat4_travel: {
            totalKg: travelKg
          },
          cat5_local: {
            totalKg: localTransportKg
          },
          cat4_freight: {
            totalKg: freightKg
          },
          cat5_waste: {
            totalKg: cat5WasteKg,
            reusableKg,
            wasteRecyclingKg
          },
          cat12_signage: {
            totalKg: signageKg
          }
        }
      };
    }

    // ----------------------------------------------------
    // Update Scope Donut Chart & Detailed Modal Elements
    // ----------------------------------------------------
    function updateScopeDonutChart(stats) {
      const breakdown = calculateScopeCategoryBreakdown(stats || sessionStats);
      const totalKg = breakdown.totalKg;
      const s1 = breakdown.scope1;
      const s2 = breakdown.scope2;
      const s3 = breakdown.scope3;

      // SVG Donut circumference for r=40: 2 * PI * 40 ≈ 251.327
      const C = 251.327;

      let len1 = 0;
      let len2 = 0;
      let len3 = 0;

      if (totalKg > 0) {
        len1 = (s1.totalKg / totalKg) * C;
        len2 = (s2.totalKg / totalKg) * C;
        len3 = (s3.totalKg / totalKg) * C;
      }

      // Update Arcs
      const arc1 = document.getElementById('donut-arc-scope1');
      const arc2 = document.getElementById('donut-arc-scope2');
      const arc3 = document.getElementById('donut-arc-scope3');

      if (arc1) {
        arc1.setAttribute('stroke-dasharray', `${len1.toFixed(3)} ${(C - len1).toFixed(3)}`);
        arc1.setAttribute('stroke-dashoffset', '0');
      }
      if (arc2) {
        arc2.setAttribute('stroke-dasharray', `${len2.toFixed(3)} ${(C - len2).toFixed(3)}`);
        arc2.setAttribute('stroke-dashoffset', `-${len1.toFixed(3)}`);
      }
      if (arc3) {
        arc3.setAttribute('stroke-dasharray', `${len3.toFixed(3)} ${(C - len3).toFixed(3)}`);
        arc3.setAttribute('stroke-dashoffset', `-${(len1 + len2).toFixed(3)}`);
      }

      // Center text
      const centerTop = document.getElementById('donut-center-top');
      const centerMain = document.getElementById('donut-center-main');
      if (centerTop && centerMain) {
        if (totalKg > 0) {
          if (s3.pct >= s1.pct && s3.pct >= s2.pct) {
            centerTop.textContent = 'Scope 3 비중';
            centerMain.textContent = `${s3.pct.toFixed(1)}%`;
          } else if (s2.pct >= s1.pct) {
            centerTop.textContent = 'Scope 2 비중';
            centerMain.textContent = `${s2.pct.toFixed(1)}%`;
          } else {
            centerTop.textContent = 'Scope 1 비중';
            centerMain.textContent = `${s1.pct.toFixed(1)}%`;
          }
        } else {
          centerTop.textContent = '실천 대기';
          centerMain.textContent = '0.0%';
        }
      }

      // Dashboard Legend Percentages & kg
      const pct1 = document.getElementById('donut-pct-scope1');
      const pct2 = document.getElementById('donut-pct-scope2');
      const pct3 = document.getElementById('donut-pct-scope3');
      const kg1 = document.getElementById('donut-kg-scope1');
      const kg2 = document.getElementById('donut-kg-scope2');
      const kg3 = document.getElementById('donut-kg-scope3');

      if (pct1) pct1.textContent = `${s1.pct.toFixed(1)}%`;
      if (pct2) pct2.textContent = `${s2.pct.toFixed(1)}%`;
      if (pct3) pct3.textContent = `${s3.pct.toFixed(1)}%`;
      if (kg1) kg1.textContent = `${s1.totalKg.toFixed(2)} kg`;
      if (kg2) kg2.textContent = `${s2.totalKg.toFixed(2)} kg`;
      if (kg3) kg3.textContent = `${s3.totalKg.toFixed(2)} kg`;

      // Update Breakdown Modal Elements (if rendered in DOM)
      const sbTotalKg = document.getElementById('sb-total-kg');
      const sbS1Kg = document.getElementById('sb-scope1-kg');
      const sbS1Pct = document.getElementById('sb-scope1-pct');
      const sbS2Kg = document.getElementById('sb-scope2-kg');
      const sbS2Pct = document.getElementById('sb-scope2-pct');
      const sbS3Kg = document.getElementById('sb-scope3-kg');
      const sbS3Pct = document.getElementById('sb-scope3-pct');

      if (sbTotalKg) sbTotalKg.textContent = totalKg.toFixed(2);
      if (sbS1Kg) sbS1Kg.textContent = s1.totalKg.toFixed(2);
      if (sbS1Pct) sbS1Pct.textContent = `${s1.pct.toFixed(1)}%`;
      if (sbS2Kg) sbS2Kg.textContent = s2.totalKg.toFixed(2);
      if (sbS2Pct) sbS2Pct.textContent = `${s2.pct.toFixed(1)}%`;
      if (sbS3Kg) sbS3Kg.textContent = s3.totalKg.toFixed(2);
      if (sbS3Pct) sbS3Pct.textContent = `${s3.pct.toFixed(1)}%`;

      // Top KPI Progress Bars
      const bar1 = document.getElementById('sb-scope1-bar');
      const bar2 = document.getElementById('sb-scope2-bar');
      const bar3 = document.getElementById('sb-scope3-bar');
      if (bar1) bar1.style.width = `${Math.min(100, Math.max(0, s1.pct)).toFixed(1)}%`;
      if (bar2) bar2.style.width = `${Math.min(100, Math.max(0, s2.pct)).toFixed(1)}%`;
      if (bar3) bar3.style.width = `${Math.min(100, Math.max(0, s3.pct)).toFixed(1)}%`;

      // Subtotals
      const subS1 = document.getElementById('sb-subtotal-scope1');
      const subS2 = document.getElementById('sb-subtotal-scope2');
      const subS3 = document.getElementById('sb-subtotal-scope3');
      if (subS1) subS1.textContent = `${s1.totalKg.toFixed(2)} kg CO₂e`;
      if (subS2) subS2.textContent = `${s2.totalKg.toFixed(2)} kg CO₂e`;
      if (subS3) subS3.textContent = `${s3.totalKg.toFixed(2)} kg CO₂e`;

      // Helper function for active highlighting
      function setItemRowState(valElId, rowElId, kgVal) {
        const valEl = document.getElementById(valElId);
        const rowEl = document.getElementById(rowElId);
        if (valEl) {
          if (kgVal > 0) {
            valEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> ${kgVal.toFixed(2)} kg`;
            valEl.className = 'font-black font-mono shrink-0 ml-2 text-xs text-emerald-300 bg-emerald-500/25 px-2.5 py-0.5 rounded-md border border-emerald-400/50 shadow-xs flex items-center gap-1.5';
          } else {
            valEl.textContent = '0.00 kg';
            valEl.className = 'font-bold font-mono shrink-0 ml-2 text-xs text-slate-500';
          }
        }
        if (rowEl) {
          if (kgVal > 0) {
            rowEl.classList.add('border-emerald-500/60', 'bg-emerald-950/40');
            rowEl.classList.remove('border-slate-800', 'bg-slate-800/50', 'bg-slate-900/80', 'border-slate-700/80');
          } else {
            rowEl.classList.remove('border-emerald-500/60', 'bg-emerald-950/40');
            rowEl.classList.add('border-slate-700/80');
          }
        }
      }

      function setCatBoxState(subtotalElId, boxElId, catKg) {
        const subtotalEl = document.getElementById(subtotalElId);
        const boxEl = document.getElementById(boxElId);
        if (subtotalEl) {
          if (catKg > 0) {
            subtotalEl.textContent = `${catKg.toFixed(2)} kg`;
            subtotalEl.className = 'text-xs font-mono font-black text-emerald-300 bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-400/60 shadow-xs';
          } else {
            subtotalEl.textContent = '0.00 kg';
            subtotalEl.className = 'text-xs font-mono font-bold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60';
          }
        }
        if (boxEl) {
          if (catKg > 0) {
            boxEl.classList.add('border-emerald-500/60', 'ring-1', 'ring-emerald-500/30');
            boxEl.classList.remove('border-slate-700/90');
          } else {
            boxEl.classList.remove('border-emerald-500/60', 'ring-1', 'ring-emerald-500/30');
            boxEl.classList.add('border-slate-700/90');
          }
        }
      }

      // Scope 1 items
      setItemRowState('sb-val-diesel', 'sb-row-diesel', s1.dieselKg);
      setItemRowState('sb-val-forklift', 'sb-row-forklift', s1.forkliftKg);

      // Scope 2 item
      setItemRowState('sb-val-energy', 'sb-row-energy', s2.energyKg);

      // Scope 3 Category subtotals and items
      setCatBoxState('sb-cat1-subtotal', 'sb-box-cat1', s3.cat1.totalKg);
      setItemRowState('sb-val-fnb', 'sb-row-fnb', s3.cat1.fnbKg);
      setItemRowState('sb-val-upcycle', 'sb-row-upcycle', s3.cat1.keyringKg + s3.cat1.bannerKg);
      setItemRowState('sb-val-booth', 'sb-row-booth', s3.cat1.boothKg);

      setCatBoxState('sb-cat4-subtotal', 'sb-box-cat4', s3.cat4_travel.totalKg);
      setItemRowState('sb-val-travel', 'sb-row-travel', s3.cat4_travel.totalKg);

      setCatBoxState('sb-cat5-local-subtotal', 'sb-box-cat5-local', s3.cat5_local.totalKg);
      setItemRowState('sb-val-local-transport', 'sb-row-local-transport', s3.cat5_local.totalKg);

      setCatBoxState('sb-cat4-freight-subtotal', 'sb-box-cat4-freight', s3.cat4_freight.totalKg);
      setItemRowState('sb-val-freight', 'sb-row-freight', s3.cat4_freight.totalKg);

      setCatBoxState('sb-cat5-waste-subtotal', 'sb-box-cat5-waste', s3.cat5_waste.totalKg);
      setItemRowState('sb-val-reusable', 'sb-row-reusable', s3.cat5_waste.reusableKg);
      setItemRowState('sb-val-waste-recycling', 'sb-row-waste-recycling', s3.cat5_waste.wasteRecyclingKg);

      setCatBoxState('sb-cat1-digital-subtotal', 'sb-box-cat1-digital', s3.cat12_signage.totalKg);
      setItemRowState('sb-val-signage', 'sb-row-signage', s3.cat12_signage.totalKg);
    }

    // Modal open / close handlers
    function openScopeBreakdownModal() {
      const modal = document.getElementById('scopeBreakdownModal');
      if (!modal) return;
      if (typeof updateScopeDonutChart === 'function') {
        updateScopeDonutChart(sessionStats);
      }
      modal.style.display = 'flex';
      modal.style.pointerEvents = 'auto';
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const content = modal.querySelector('> div');
        if (content) content.classList.remove('scale-95');
      }, 10);
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    function closeScopeBreakdownModal() {
      const modal = document.getElementById('scopeBreakdownModal');
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

// Window Global Exports for Core
window.sessionStats = sessionStats;
window.sendParticipation = sendParticipation;
window.recalculateSessionTotalCarbon = recalculateSessionTotalCarbon;
window.updateDashboardUI = updateDashboardUI;
window.animateValue = animateValue;
window.showToast = showToast;
window.calculateScopeCategoryBreakdown = calculateScopeCategoryBreakdown;
window.updateScopeDonutChart = updateScopeDonutChart;
window.openScopeBreakdownModal = openScopeBreakdownModal;
window.closeScopeBreakdownModal = closeScopeBreakdownModal;
