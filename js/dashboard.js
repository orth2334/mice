// Dashboard Rendering & Animations
    function updateDashboardUI(stats) {
      const hasAnyActionSubmitted = (stats.totalReducedCarbonGrams > 0 || venueEcologyState.submitted || barrierFreeState.submitted || localFoodState.submitted || localEconomyState.submitted || inclusionState.submitted || esgEduState.submitted || supportersState.submitted || donationState.submitted || knowledgeState.submitted || iso20121State.submitted || esgReportState.submitted || advisoryState.submitted);

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
      const totalUpcycleGrams = (stats.keyringReducedCarbonGrams || 0) + ((stats.items.upcycled_banner || 0) * 6280);
      const lastTotalUpcycleGrams = (lastStats.keyringReducedCarbonGrams || 0) + ((lastStats.upcycled_banner || 0) * 6280);
      animateValue(document.getElementById('kpi-upcycle-reduced-carbon'), lastTotalUpcycleGrams, totalUpcycleGrams, 800);
      animateValue(document.getElementById('kpi-upcycle-participants'), lastStats.keyringParticipants || 0, stats.keyringParticipants || 0, 800);

      const keyringCount = stats.items.upcycled_keyring || 0;
      const bannerCount = stats.items.upcycled_banner || 0;
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


// Real-time EventSource Listener & Page Initialization
// Initialization & Real-time Event Listeners
</script>
  <!-- Lucide Icons for clean SVG rendering -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Custom font styling -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Noto Sans KR', 'Inter', sans-serif;
      background-color: #f1f5f9;
    }
    .custom-shadow {
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.02);
    }
  </style>
</head>
<body class="text-slate-800 antialiased selection:bg-blue-200 py-12">

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    
    <!-- ==========================================
         HERO & VISION (MICE EVENT 특화형 헤더)
         ========================================== -->
    <header class="relative rounded-3xl overflow-hidden bg-cover bg-center text-white min-h-[440px] flex items-center shadow-md" 
            style="background-image: linear-gradient(to right, rgba(10, 25, 47, 0.98) 35%, rgba(15, 32, 67, 0.85) 70%, rgba(15, 23, 42, 0.4)), url('headway-F2KRf_QfCqw-unsplash.jpg'), url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200'); background-size: cover; background-position: center;">
      
      <!-- Top Right Logo (MUREPA KOREA 세리프 2줄 동일 크기 텍스트 로고 적용) -->
      <div class="absolute top-6 right-8 text-right select-none z-20">
        <div class="font-serif text-xl font-bold tracking-[0.15em] text-white leading-none uppercase">MUREPA</div>
        <div class="font-serif text-xl font-bold tracking-[0.15em] text-white leading-none uppercase mt-2">KOREA</div>
      </div>

      <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 sm:px-12 py-12 items-center relative z-10">
        <!-- Left Side: Header Copy -->
        <div class="lg:col-span-6 space-y-5">
          <div class="space-y-1">
            <span class="text-sm font-semibold text-sky-400 tracking-wider">ESG로 완성하는</span>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              지속가능한 <br>
              <span class="text-sky-400">MICE EVENT</span>
            </h1>
          </div>
          <p class="text-slate-300 text-sm font-light max-w-md leading-relaxed">
            탄소를 저감하고, 친환경 비즈니스 네트워크 환경을 조성하며, 투명한 거버넌스로 신뢰받는 비즈니스 가치를 창출합니다.
          </p>

          <div class="flex flex-wrap gap-4 pt-4 border-t border-blue-800/60 max-w-lg">
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-full bg-blue-900 border border-blue-500/30 flex items-center justify-center"><i data-lucide="leaf" class="w-3.5 h-3.5 text-sky-400"></i></span>
              <span class="text-xs text-slate-300 font-bold">E · Environment 환경</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-full bg-blue-950 border border-blue-500/30 flex items-center justify-center"><i data-lucide="users" class="w-3.5 h-3.5 text-blue-400"></i></span>
              <span class="text-xs text-slate-300 font-bold">S · Social 사회</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/30 flex items-center justify-center"><i data-lucide="shield" class="w-3.5 h-3.5 text-purple-400"></i></span>
              <span class="text-xs text-slate-300 font-bold">G · Governance 지배구조</span>
            </div>
          </div>
        </div>

        <!-- Right Side: ESG Vision Overlay Box -->
        <div class="lg:col-span-6 bg-[#0f2042]/95 backdrop-blur-md rounded-2xl p-6 border border-blue-800/40 space-y-5 shadow-2xl">
          <div class="text-center pb-3 border-b border-blue-900/50">
            <span class="text-[10px] tracking-widest text-sky-400 font-extrabold uppercase">ESG Vision</span>
            <h2 class="text-base font-bold text-white mt-1">자연과 사람이 함께 만드는 지속가능한 가치</h2>
          </div>
          
          <div class="grid grid-cols-3 gap-1 text-center">
            <!-- Column 1: 탄소 배출 관리 운영 -->
            <div class="space-y-2 px-1">
              <div class="flex justify-center"><i data-lucide="cloud" class="w-5 h-5 text-sky-400"></i></div>
              <p class="text-xs font-bold text-white leading-tight">탄소 배출<br>관리 운영</p>
              <p class="text-[9px] text-slate-300 leading-normal font-light">행사 기간 ESG 운영<br>데이터 측정 예정</p>
            </div>
            <!-- Column 2: 지역사회 연계 프로그램 운영 -->
            <div class="space-y-2 border-x border-blue-900/50 px-2">
              <div class="flex justify-center"><i data-lucide="users" class="w-5 h-5 text-sky-400"></i></div>
              <p class="text-xs font-bold text-white leading-tight">지역사회 연계<br>프로그램 운영</p>
              <p class="text-[9px] text-slate-300 leading-normal font-light">지역 사회와 함께하는<br>참여형 ESG 추진</p>
            </div>
            <!-- Column 3: 지속가능 행사 운영 강화 -->
            <div class="space-y-2 px-1">
              <div class="flex justify-center"><i data-lucide="heart-handshake" class="w-5 h-5 text-sky-400"></i></div>
              <p class="text-xs font-bold text-white leading-tight">지속가능<br>행사 운영 강화</p>
              <p class="text-[9px] text-slate-300 leading-normal font-light">친환경·투명 운영 기반<br>ESG 체계 구축</p>
            </div>
          </div>
        </div>
      </div>
    </header>


    <!-- ==========================================
         SECTION 01: ENVIRONMENT (환경)
         ========================================== -->
    <section class="relative bg-white rounded-3xl p-6 sm:p-8 custom-shadow border border-slate-100 overflow-hidden space-y-6">
      
      <!-- HIGH-QUALITY BACKGROUND ILLUSTRATIONS -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-40">
        <!-- Top Right Eucalyptus Branch -->
        <svg class="absolute -top-12 -right-12 w-[380px] h-[380px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#059669" stop-opacity="0.03"/>
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#a7f3d0" stop-opacity="0.75"/>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
            </linearGradient>
          </defs>
          <path d="M190 10 C 130 40, 70 100, 20 180" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
          <path d="M150 25 C 120 15, 105 30, 115 50 C 135 60, 150 45, 150 25 Z" fill="url(#leafGrad1)"/>
          <path d="M120 55 C 90 50, 75 65, 85 85 C 105 95, 120 80, 120 55 Z" fill="url(#leafGrad2)"/>
          <path d="M90 90 C 65 85, 50 100, 60 120 C 80 130, 95 115, 90 90 Z" fill="url(#leafGrad1)"/>
          <path d="M165 40 C 150 50, 155 70, 175 65 C 185 50, 180 30, 165 40 Z" fill="url(#leafGrad2)"/>
        </svg>

        <!-- Bottom Left Eucalyptus Branch -->
        <svg class="absolute -bottom-12 -left-12 w-[340px] h-[340px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 190 C 70 160, 130 100, 180 20" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
          <path d="M50 175 C 80 185, 95 170, 85 150 C 65 140, 50 155, 50 175 Z" fill="url(#leafGrad1)"/>
          <path d="M80 145 C 110 150, 125 135, 115 115 C 95 105, 80 120, 80 145 Z" fill="url(#leafGrad2)"/>
        </svg>
      </div>

      <!-- Section Header -->
      <div class="relative z-10 space-y-2 pb-5 border-b border-slate-100">
        <div class="flex items-center space-x-3">
          <span class="bg-emerald-500 text-white text-sm font-extrabold px-3.5 py-1 rounded-full shadow-sm tracking-wide">01 / E</span>
          <span class="text-sm uppercase font-black tracking-widest text-emerald-600 border-l-2 border-emerald-200 pl-3">Environment · 환경</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">자연을 지키는 MICE 운영</h2>
        <p class="text-sm text-slate-500 leading-relaxed font-medium">행사 전 과정에서의 탄소 중립 지표 측정과 친환경 조성을 최우선 과제로 상정합니다.</p>
      </div>

      <!-- Horizontal Scrollable Cards -->
      <div class="relative w-full z-10 group">
        <!-- Left Arrow -->
        <button onclick="document.getElementById('env-cards').scrollBy({left: -300, behavior: 'smooth'})" class="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 text-emerald-600 hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-slate-100 hidden md:flex">
          <i data-lucide="chevron-left" class="w-6 h-6"></i>
        </button>
        <!-- Right Arrow -->
        <button onclick="document.getElementById('env-cards').scrollBy({left: 300, behavior: 'smooth'})" class="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 text-emerald-600 hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-slate-100 hidden md:flex">
          <i data-lucide="chevron-right" class="w-6 h-6"></i>
        </button>

        <div id="env-cards" class="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <!-- Card 1 -->
          <div onclick="openDetailModal('탄소발자국 측정·공개', '교통, 전력 에너지, 행사 인쇄물 및 폐기물 전 과정의 탄소 배출량을 계량화하여 지속가능한 친환경 컨퍼런스 규격을 설정합니다.')" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=300" alt="Carbon" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">01</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">탄소발자국 측정 · 공개</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">행사 전 과정 탄소 발생 유발 요인을 면밀히 측정하고 공시</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center justify-between pb-1">
                  <div class="flex items-center space-x-2">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                      <i data-lucide="cloud" class="w-4 h-4"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">(2023년 대비)</span>
                      <span class="text-[11px] font-bold text-slate-800 leading-none">탄소량 감축 측정</span>
                    </div>
                  </div>
                  <!-- Custom sparkline chart -->
                  <svg class="w-6 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <line x1="12" y1="20" x2="12" y2="8" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div onclick="openEcoSimulatorModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=300" alt="Reusable" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">02</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">다회용기 · 친환경 에코 서비스</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">다회용 식기 도입 및 친환경 패키징 공수를 통한 종이컵 대체</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <i data-lucide="cup-soda" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">일회용 식기</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">실천 등록</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div onclick="openEnergySimulatorModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=300" alt="Solar" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">03</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">100% 재생에너지 운영</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">이벤트 및 프레젠테이션 운영 전력을 100% 신재생에너지로 전환</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <i data-lucide="sun" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">재생에너지</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">신재생 전력 전환</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4 -->
          <div onclick="openTransportSimulatorModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=300" alt="Eco Bus" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">04</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">친환경 이동수단</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">행사 관계자 및 글로벌 바이어를 위한 친환경 수소 버스 지원</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <i data-lucide="bus" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">친환경 이동</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">수소·전기 셔틀</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 05: 업사이클링 굿즈(ESG 기념품) 제작 -->
          <div onclick="openUpcycleSimulatorModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300" alt="Upcycling Goods" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">05</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">업사이클링 굿즈 제작</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">사용된 배너, 현수막, 의자 커버를 수거해 유니크한 가방·소품으로 변신</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <i data-lucide="recycle" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">기념품 기증</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">VIP 증정용</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 06: 친환경 행사장 조성 · 관리 -->
          <div onclick="openVenueEcologyModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=300" alt="Jeju Ecology" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">06</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">친환경 행사장 조성 · 관리</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">생태 보호 인근 지역 공간 보호 및 실내 청정 가이드라인 수립</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 transition-colors" id="badge-venue-ecology-icon-container">
                    <i data-lucide="tree-pine" class="w-4 h-4" id="badge-venue-ecology-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span id="badge-venue-ecology-label" class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">생태 공간</span>
                    <span id="badge-venue-ecology-value" class="text-[11px] font-bold text-slate-800 leading-none">실천 등록</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 07: 디지털 페이퍼리스 및 사이니지 시스템 -->
          <div onclick="openSignageSimulatorModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300" alt="Digital Signage & Card" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">07</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">디지털 페이퍼리스 & 사이니지</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">종이 인쇄물 및 일회성 안내판을 전면 폐지하고 NFC/QR 플랫폼 및 디지털 사이니지 도입</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <i data-lucide="monitor" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">인쇄물·안내판</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">Zero & 신재생 공급</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 08: 친환경 부스 자재 의무화 -->
          <div onclick="openPaperBoothSimulatorModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=300" alt="Eco Booth" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">08</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-emerald-800 tracking-tight leading-tight">친환경 부스 자재 의무화</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">재활용 알루미늄 및 종이 보드 사용, 철거 시 폐기물 관리</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <i data-lucide="layers" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">부스 폐기물</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">처리 계획서 의무</span>
                  </div>
                </div>
              </div>
            </div>
          </div>




          </div>
      </div>
    </section>


        <!-- ==========================================
         SECTION 02: SOCIAL (사회)
         ========================================== -->
    <section class="relative bg-white rounded-3xl p-6 sm:p-8 custom-shadow border border-slate-100 overflow-hidden space-y-6">
      
      <!-- HIGH-QUALITY BACKGROUND ILLUSTRATIONS (Jeju Landscape) -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-50">
        <!-- Top Right Soft Clouds -->
        <svg class="absolute top-0 right-0 w-[450px] h-[250px]" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#bfdbfe" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#eff6ff" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M220 30 C205 30, 195 40, 185 40 C175 40, 165 30, 150 30 C130 30, 125 45, 135 55 C145 65, 215 65, 225 55 C235 45, 230 30, 220 30 Z" fill="url(#cloudGrad)"/>
          <path d="M120 15 C110 10, 102 10, 95 15 L95 20 L120 20 Z" fill="url(#cloudGrad)" opacity="0.5"/>
          <path d="M80 35 Q85 27 90 35 Q95 27 100 35" stroke="#3b82f6" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.5"/>
        </svg>

        <!-- Bottom Landscape -->
        <svg class="absolute bottom-0 right-0 left-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mountainGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.55"/>
              <stop offset="100%" stop-color="#dbeafe" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="waveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#eff6ff" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M350 120 L580 25 L640 40 L820 120 Z" fill="url(#mountainGrad)"/>
          <path d="M0 120 Q120 60, 320 105 T650 90 T1000 100 T1200 120 L1200 120 L0 120 Z" fill="url(#waveGrad)"/>
        </svg>
      </div>

      <!-- Section Header -->
      <div class="relative z-10 space-y-2 pb-5 border-b border-slate-100">
        <div class="flex items-center space-x-3">
          <span class="bg-blue-500 text-white text-sm font-extrabold px-3.5 py-1 rounded-full shadow-sm tracking-wide">02 / S</span>
          <span class="text-sm uppercase font-black tracking-wider text-blue-600 border-l-2 border-blue-200 pl-3">Social · 사회</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">자연과 함께, 모두를 위한 컨퍼런스</h2>
        <p class="text-sm text-slate-500 leading-relaxed font-medium">지역 소상공인과의 협력 및 무장애 동선 설계로 장벽 없는 열린 교류의 장을 만듭니다.</p>
      </div>

      <!-- Horizontal Scrollable Cards -->
      <div class="relative w-full z-10 group">
        <!-- Left Arrow -->
        <button onclick="document.getElementById('soc-cards').scrollBy({left: -300, behavior: 'smooth'})" class="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-slate-100 hidden md:flex">
          <i data-lucide="chevron-left" class="w-6 h-6"></i>
        </button>
        <!-- Right Arrow -->
        <button onclick="document.getElementById('soc-cards').scrollBy({left: 300, behavior: 'smooth'})" class="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-slate-100 hidden md:flex">
          <i data-lucide="chevron-right" class="w-6 h-6"></i>
        </button>

        <div id="soc-cards" class="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          <!-- Card 1 -->
          <div onclick="openLocalFoodModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300" alt="Local Biz" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">01</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">지역·소상공인 ESG 협업존</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">지역 로컬 특산품 및 지적 자산 연계 판로 촉진망 수립</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-655 font-black transition-colors" id="badge-local-food-icon-container">
                    <i data-lucide="store" class="w-4 h-4" id="badge-local-food-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-local-food-label">협력 모델</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-local-food-value">소상공인 연계</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div onclick="openBarrierFreeModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=300" alt="Barrier Free" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">02</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">무장애 행사 가이드라인</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">휠체어 동선 및 수어 통역사 배치, 발달장애인용 '쉬운 언어' 자료 제공</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-650 font-black transition-colors" id="badge-barrier-free-icon-container">
                    <i data-lucide="accessibility" class="w-4 h-4" id="badge-barrier-free-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-barrier-free-label">배리어프리</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-barrier-free-value">정보·이동 보장</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div onclick="openLocalEconomyModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=300" alt="Economy Boost" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">03</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">지역경제 기여</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">도외 및 해외 유입 비즈니스 참관단 유치 기획 강화</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-650 font-black transition-colors" id="badge-local-economy-icon-container">
                    <i data-lucide="heart" class="w-4 h-4" id="badge-local-economy-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-local-economy-label">지역 소비 효과</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-local-economy-value">실천 등록</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4 -->
          <div onclick="openInclusionModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=300" alt="Inclusion" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">04</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">포용 프로그램</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">지역 아동 환경 보존 아카데미 투어리즘 동반 진행</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-650 font-black transition-colors" id="badge-inclusion-icon-container">
                    <i data-lucide="smile" class="w-4 h-4" id="badge-inclusion-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-inclusion-label">포용 프로그램</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-inclusion-value">실천 등록</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 5 -->
          <div onclick="openEsgEducationModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=300" alt="ESG Study" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">05</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">ESG 교육 · 체험</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">글로벌 연계 비즈니스 전문가 멘토링 연 12회 이상 조율</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-655 font-black transition-colors" id="badge-esg-edu-icon-container">
                    <i data-lucide="graduation-cap" class="w-4 h-4" id="badge-esg-edu-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-esg-edu-label">교육 프로그램</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-esg-edu-value">실천 등록</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 6: 로컬 청년 크리에이터 서포터즈 -->
          <div onclick="openSupportersModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=300" alt="Youth Supporters" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">06</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">로컬 청년 크리에이터 서포터즈</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">지역 청년으로 기획, 촬영, 홍보진 구성 및 직무 육성</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-655 font-black transition-colors" id="badge-supporters-icon-container">
                    <i data-lucide="camera" class="w-4 h-4" id="badge-supporters-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-supporters-label">지역 인재</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-supporters-value">청년 서포터즈</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 7: 기부 챌린지 및 사회 공헌 연계 -->
          <div onclick="openDonationModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=300" alt="Giving" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">07</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">기부 챌린지 · 사회공헌 연계</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">걷기, 퀴즈 미션 완료 시 지역 사회 단체 및 복지시설 기부 매칭</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-655 font-black transition-colors" id="badge-donation-icon-container">
                    <i data-lucide="gift" class="w-4 h-4" id="badge-donation-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-donation-label">매칭 기부</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-donation-value">사회 공헌 연계</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 8: 지식 나눔 및 재능 기부 강연 -->
          <div onclick="openKnowledgeSharingModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=300" alt="Mentoring" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">08</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-blue-800 tracking-tight leading-tight">지식 나눔 · 재능 기부 강연</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">글로벌 연사들의 도내 대학생 및 청년 스타트업 대상 무료 멘토링</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-655 font-black transition-colors" id="badge-knowledge-icon-container">
                    <i data-lucide="heart-handshake" class="w-4 h-4" id="badge-knowledge-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-knowledge-label">멘토링 지원</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-knowledge-value">재능 기부 세션</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>


        <!-- ==========================================
         SECTION 03: GOVERNANCE (지배구조 & 재무 투명성)
         ========================================== -->
    <section class="relative bg-white rounded-3xl p-6 sm:p-8 custom-shadow border border-slate-100 overflow-hidden space-y-6">
      
      <!-- HIGH-QUALITY BACKGROUND ILLUSTRATIONS (Lavender / Purple Organic Botanical Branches) -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-40">
        <!-- Top Left Lavender Branch -->
        <svg class="absolute -top-12 -left-12 w-[340px] h-[340px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="purpleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#c4b5fd" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.03"/>
            </linearGradient>
            <linearGradient id="purpleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ddd6fe" stop-opacity="0.75"/>
              <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.05"/>
            </linearGradient>
          </defs>
          <path d="M10 10 C 60 40, 110 90, 170 170" stroke="#8b5cf6" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
          <path d="M35 25 C 60 15, 75 30, 65 50 C 45 60, 30 45, 35 25 Z" fill="url(#purpleGrad1)"/>
          <path d="M65 55 C 90 45, 105 60, 95 80 C 75 90, 60 75, 65 55 Z" fill="url(#purpleGrad2)"/>
          <path d="M95 90 C 120 80, 135 95, 125 115 C 105 125, 90 110, 95 90 Z" fill="url(#purpleGrad1)"/>
        </svg>

        <!-- Bottom Right Lavender Branch -->
        <svg class="absolute -bottom-12 -right-12 w-[340px] h-[340px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M190 190 C 140 160, 90 110, 30 30" stroke="#8b5cf6" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
          <path d="M165 175 C 140 185, 125 170, 135 150 C 155 140, 170 155, 165 175 Z" fill="url(#purpleGrad1)"/>
          <path d="M135 145 C 110 155, 95 140, 105 120 C 125 110, 140 125, 135 145 Z" fill="url(#purpleGrad2)"/>
        </svg>
      </div>

      <!-- Section Header -->
      <div class="relative z-10 space-y-2 pb-5 border-b border-slate-100">
        <div class="flex items-center space-x-3">
          <span class="bg-indigo-500 text-white text-sm font-extrabold px-3.5 py-1 rounded-full shadow-sm tracking-wide">03 / G</span>
          <span class="text-sm uppercase font-black tracking-widest text-indigo-600 border-l-2 border-indigo-200 pl-3">Governance · 지배구조 & 재무 투명성</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">투명하게 운영하고, 신뢰로 완성합니다</h2>
        <p class="text-sm text-slate-500 leading-relaxed font-medium">국제 수준의 ESG 거버넌스로 책임 있게 운영합니다.</p>
      </div>

      <!-- Horizontal Scrollable Cards -->
      <div class="relative w-full z-10 group">
        <!-- Left Arrow -->
        <button onclick="document.getElementById('gov-cards').scrollBy({left: -300, behavior: 'smooth'})" class="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-slate-100 hidden md:flex">
          <i data-lucide="chevron-left" class="w-6 h-6"></i>
        </button>
        <!-- Right Arrow -->
        <button onclick="document.getElementById('gov-cards').scrollBy({left: 300, behavior: 'smooth'})" class="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-slate-100 hidden md:flex">
          <i data-lucide="chevron-right" class="w-6 h-6"></i>
        </button>

        <div id="gov-cards" class="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          <!-- Card 1: ESG 성과 보고서 (PDF 보고서 첨부 모달) -->
          <div id="card-esg-report" onclick="openEsgReportModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300" alt="ESG Report" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">01</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-indigo-850 tracking-tight leading-tight">ESG 성과 보고서</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">ESG 성과를 정량적으로 측정 공시하여 투명하게 공개</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-655 font-black transition-colors" id="badge-esg-report-icon-container">
                    <i data-lucide="file-text" class="w-4 h-4" id="badge-esg-report-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-esg-report-label">공시 주기</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-esg-report-value">연 1회 보고서 발간</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: ISO 20121 국제 인증 추진 (인증서 파일 첨부 모달) -->
          <div id="card-iso20121" onclick="openIso20121Modal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1496065187959-7f07b8353c55?auto=format&fit=crop&q=80&w=300" alt="ISO Cert" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">02</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-indigo-850 tracking-tight leading-tight">ISO 20121 국제 인증 추진</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">글로벌 스탠다드 충족을 위한 지속가능이벤트경영시스템 구축</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-655 font-black transition-colors" id="badge-iso20121-icon-container">
                    <i data-lucide="shield-check" class="w-4 h-4" id="badge-iso20121-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-iso20121-label">인증 절차</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-iso20121-value">ISO 20121 진행 중</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: ESG 자문위원회 (회의 장소, 일시, 사진 첨부 모달) -->
          <div id="card-advisory" onclick="openAdvisoryModal()" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300" alt="Advisory" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">03</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-indigo-850 tracking-tight leading-tight">ESG 자문위원회</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">환경·사회·지배구조 전문가 자문으로 운영의 전문성과 신뢰성 강화</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-655 font-black transition-colors" id="badge-advisory-icon-container">
                    <i data-lucide="users-2" class="w-4 h-4" id="badge-advisory-icon"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5" id="badge-advisory-label">전문가 위원</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none" id="badge-advisory-value">자문단 구성</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4 -->
          <div onclick="openDetailModal('로컬 고유성 연계', '개최지 및 로컬 고유 문화의 미학적 핵심 가치를 인포그래픽 및 굿즈, 공간 기획 요소에 전적으로 반영합니다.')" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=300" alt="Jeju Heritage" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">04</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-indigo-850 tracking-tight leading-tight">로컬 고유성 연계</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">개최 지역의 자연·문화 가치를 보존하고 지속가능한 모델로 발전</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-655 font-black">
                    <i data-lucide="map" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">지역 문화 가치</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">100% 반영 보존</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 5: 이해관계자 의견 수렴 플랫폼 -->
          <div onclick="openDetailModal('이해관계자 의견 수렴 플랫폼', '행사 전 과정에 걸쳐 참가자와 협력사로부터 ESG 운영에 대한 피드백을 실시간으로 받는 ESG 소통 채널을 운영하고, 그 결과를 다음 행사 운영에 어떻게 반영했는지 공개합니다.')" class="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-0.8rem)] snap-center flex-shrink-0 group cursor-pointer bg-white rounded-[24px] p-3 shadow-sm border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[295px]">
            <div class="relative w-full h-[115px] rounded-[18px] overflow-hidden bg-slate-50">
              <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=300" alt="Feedback Channel" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <span class="absolute top-2.5 left-2.5 bg-white text-slate-850 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">05</span>
            </div>
            <div class="flex-grow flex flex-col justify-between pt-2.5">
              <div>
                <h3 class="font-extrabold text-[13px] text-indigo-850 tracking-tight leading-tight">이해관계자 의견 수렴 플랫폼</h3>
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">참가자와 협력사의 ESG 피드백을 실시간 수렴하는 소통 채널 운영</p>
              </div>
              <div>
                <div class="border-t border-slate-100 my-2"></div>
                <div class="flex items-center space-x-2 pb-1">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-655 font-black">
                    <i data-lucide="message-square" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] text-slate-400 font-medium leading-none mb-0.5">실시간 피드백</span>
                    <span class="text-[11px] font-bold text-slate-800 leading-none">ESG 소통 채널</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- ==========================================
         SECTION 04: ESG IMPACT & ROADMAP
         ========================================== -->
    <section class="relative bg-white rounded-3xl p-6 sm:p-8 custom-shadow border border-slate-100 overflow-hidden space-y-6">
      
      <!-- HIGH-QUALITY BACKGROUND ILLUSTRATIONS -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-40">
        <div class="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 to-transparent blur-3xl"></div>
        <div class="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-50 to-transparent blur-3xl"></div>
        <svg class="absolute top-1/4 right-8 w-44 h-44 text-amber-600" fill="currentColor" viewBox="0 0 100 100" opacity="0.12">
          <path d="M10 50 C 30 20, 70 30, 90 10 C 80 40, 50 50, 10 50 Z" />
          <path d="M20 70 C 40 40, 80 50, 95 20 C 85 55, 60 65, 20 70 Z" />
        </svg>
      </div>

      <!-- Section Header -->
      <div class="relative z-10 space-y-2 pb-5 border-b border-slate-100">
        <div class="flex items-center space-x-3">
          <span class="bg-amber-500 text-white text-sm font-extrabold px-3.5 py-1 rounded-full shadow-sm tracking-wide">04 / Impact</span>
          <span class="text-sm uppercase font-black tracking-widest text-amber-600 border-l-2 border-amber-200 pl-3">ESG Impact · 우리의 약속과 성과</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">지속가능한 미래, 우리의 실천에서 시작됩니다</h2>
        <p class="text-sm text-slate-500 leading-relaxed font-medium">숫자로 증명하는 ESG 성과와 우리의 약속</p>
      </div>

      <!-- Main Layout -->
      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- Left Column: Quantitative Expected Effects Dashboard (Only show active/selected outcomes) -->
        <div class="lg:col-span-6 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/50 flex flex-col justify-between space-y-6">
          <div>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Selected Outcomes</span>
            <h3 class="text-base font-extrabold text-slate-800 mt-0.5">실천한 ESG 활동 기대효과</h3>
          </div>

          <!-- Guides when no action is taken -->
          <div id="eco-guide-card" class="bg-white rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-3 py-16 my-auto">
            <div class="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i data-lucide="sparkles" class="w-5 h-5"></i>
            </div>
            <p class="text-xs font-bold text-slate-800">참여 중인 친환경 활동이 없습니다.</p>
            <p class="text-[10px] text-slate-450 max-w-[200px] leading-relaxed">위의 E(환경) 탭에 있는 녹색 카드(다회용기 등)를 클릭하여 실천에 직접 참여해 주세요!</p>
          </div>

          <!-- Dynamic Active Action Cards -->
          <div id="kpi-waste-card" class="hidden transition-all duration-300">
            <!-- Diagram 3: 자원 순환 (플라스틱 Zero) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <i data-lucide="recycle" class="w-4 h-4 text-emerald-600"></i> 일회용 폐기물 억제 (자원 순환)
                </span>
                <span class="bg-emerald-50 text-[10px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">다회용기 실천</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <div class="text-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span class="text-[9px] text-emerald-600 block font-bold">감축량</span>
                  <span id="kpi-waste-reduced-carbon" class="text-[11px] font-black text-emerald-700">0 gCO2eq</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">다회용기 절감</span>
                  <span id="kpi-total-items" class="text-[11px] font-black text-slate-700">0개</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">누적 참여자</span>
                  <span id="kpi-total-participants" class="text-[11px] font-black text-slate-700">0명</span>
                </div>
              </div>
              <!-- 상세 품목 브레이크다운 추가 -->
              <div class="text-[9px] text-slate-500 grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-slate-150 pt-2">
                <div class="flex justify-between"><span>컵:</span><span id="kpi-cup-count" class="font-bold text-slate-700">0개</span></div>
                <div class="flex justify-between"><span>접시:</span><span id="kpi-plate-count" class="font-bold text-slate-700">0개</span></div>
                <div class="flex justify-between"><span>볼:</span><span id="kpi-bowl-count" class="font-bold text-slate-700">0개</span></div>
                <div class="flex justify-between"><span>포크:</span><span id="kpi-fork-count" class="font-bold text-slate-700">0개</span></div>
              </div>
            </div>
          </div>

          <div id="kpi-transport-card" class="hidden transition-all duration-300 mt-4">
            <!-- Diagram 5: 친환경 이동수단 (저탄소 이동) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="bus" class="w-4 h-4 text-blue-600"></i> 친환경 이동수단 (저탄소 이동)
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">대중교통 실천</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <div class="text-center bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                  <span class="text-[9px] text-blue-600 block font-bold">감축량</span>
                  <span id="kpi-transport-reduced-carbon" class="text-[11px] font-black text-blue-700">0 gCO2eq</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block">참여 횟수</span>
                  <span id="kpi-transport-participants" class="text-[11px] font-black text-slate-700">0명</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block">이동 거리</span>
                  <span id="kpi-total-distance" class="text-[11px] font-black text-slate-700">0 km</span>
                </div>
              </div>
            </div>
          </div>

          <div id="kpi-energy-card" class="hidden transition-all duration-300 mt-4">
            <!-- Diagram 6: 100% 재생에너지 운영 (저탄소 에너지) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
                  <i data-lucide="sun" class="w-4 h-4 text-amber-500"></i> 100% 재생에너지 운영
                </span>
                <span class="bg-amber-50 text-[10px] text-amber-700 font-bold px-2.5 py-0.5 rounded-full">녹색프리미엄 실천</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <div class="text-center bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span class="text-[9px] text-amber-600 block font-bold">감축량</span>
                  <span id="kpi-energy-reduced-carbon" class="text-[11px] font-black text-amber-700">0 gCO2eq</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">사용 전력량</span>
                  <span id="kpi-total-energy" class="text-[11px] font-black text-slate-700">0 kWh</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">발생 금액</span>
                  <span id="kpi-total-energy-cost" class="text-[11px] font-black text-slate-700">0원</span>
                </div>
              </div>
            </div>
          </div>

          <div id="kpi-upcycle-card" class="hidden transition-all duration-300 mt-4">
            <!-- Diagram 7: 업사이클링 굿즈 제작 (플라스틱 Upcycle) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <i data-lucide="recycle" class="w-4 h-4 text-emerald-600"></i> 업사이클링 굿즈 제작
                </span>
                <span class="bg-emerald-50 text-[10px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">플라스틱 Upcycle</span>
              </div>
              <div class="grid grid-cols-4 gap-2 items-center">
                <div class="text-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span class="text-[9px] text-emerald-600 block font-bold">감축량</span>
                  <span id="kpi-upcycle-reduced-carbon" class="text-[11px] font-black text-emerald-700">0 gCO2eq</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">키링 수량</span>
                  <span id="kpi-total-keyrings" class="text-[11px] font-black text-slate-700">0개</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">현수막 수량</span>
                  <span id="kpi-total-banners" class="text-[11px] font-black text-slate-700">0장</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">누적 참여자</span>
                  <span id="kpi-upcycle-participants" class="text-[11px] font-black text-slate-700">0명</span>
                </div>
              </div>
            </div>
          </div>

          <div id="kpi-booth-card" class="hidden transition-all duration-300 mt-4">
            <!-- Diagram 8: 친환경 종이 전시부스 도입 (자원 순환) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <i data-lucide="layers" class="w-4 h-4 text-emerald-600"></i> 친환경 종이 전시부스 도입
                </span>
                <span class="bg-emerald-50 text-[10px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">허니컴보드 실천</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <div class="text-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span class="text-[9px] text-emerald-600 block font-bold">감축량</span>
                  <span id="kpi-booth-reduced-carbon" class="text-[11px] font-black text-emerald-700">0 gCO2eq</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">도입 면적</span>
                  <span id="kpi-total-booth-area" class="text-[11px] font-black text-slate-700">0 ㎡</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">누적 참여자</span>
                  <span id="kpi-booth-participants" class="text-[11px] font-black text-slate-700">0명</span>
                </div>
              </div>
            </div>
          </div>

          <div id="kpi-signage-card" class="hidden transition-all duration-300 mt-4">
            <!-- Diagram 7: 디지털 페이퍼리스 & 사이니지 (전환 실적) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <i data-lucide="monitor" class="w-4 h-4 text-emerald-600"></i> 디지털 페이퍼리스 & 사이니지
                </span>
                <span class="bg-emerald-50 text-[10px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">디지털 전환 실적</span>
              </div>
              <div class="grid grid-cols-3 gap-2 items-center">
                <div class="text-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span class="text-[9px] text-emerald-600 block font-bold">감축량</span>
                  <span id="kpi-signage-reduced-carbon" class="text-[11px] font-black text-emerald-700">0 gCO2eq</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">종이 절감</span>
                  <span id="kpi-total-paper-saved" class="text-[11px] font-black text-slate-700">0 장</span>
                </div>
                <div class="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-[9px] text-slate-450 block font-bold">누적 참여자</span>
                  <span id="kpi-signage-participants" class="text-[11px] font-black text-slate-700">0명</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 9: 친환경 행사장 인증 및 탄소상쇄 (기대효과) -->
          <div id="kpi-venue-ecology-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i> 친환경 행사장 인증 제출
                </span>
                <span class="bg-emerald-50 text-[10px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">인증 완료</span>
              </div>
              <div class="space-y-3">
                <div class="space-y-1.5">
                  <span class="text-[9px] text-slate-450 block font-bold">확인된 인증 자산</span>
                  <div id="kpi-venue-ecology-list" class="flex flex-wrap gap-1.5">
                  </div>
                </div>
                <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px]">
                  <div class="flex items-center space-x-2">
                    <i data-lucide="file-text" class="w-4 h-4 text-emerald-600"></i>
                    <span class="font-bold text-slate-700 truncate max-w-[180px]" id="kpi-venue-ecology-filename">filename.pdf</span>
                  </div>
                  <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">PDF 제출 완료</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 10: 배리어프리 실천 가이드라인 (기대효과) -->
          <div id="kpi-barrier-free-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="accessibility" class="w-4 h-4 text-blue-600"></i> 무장애 행사 가이드라인 실천
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">실천 완료</span>
              </div>
              <div class="space-y-3">
                <div class="space-y-1.5">
                  <span class="text-[9px] text-slate-450 block font-bold">적용된 배리어프리 항목</span>
                  <div id="kpi-barrier-free-list" class="flex flex-wrap gap-1.5">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 11: 지역경제 기여 파급효과 (기대효과) -->
          <div id="kpi-local-economy-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="trending-up" class="w-4 h-4 text-blue-600"></i> 지역경제 기여 파급효과
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">경제 가치 창출</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <span class="text-[9px] text-blue-600 block font-bold">추정 경제 창출 가치</span>
                    <span id="kpi-local-economy-amount-text" class="text-sm font-black text-blue-700">0 만원</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] text-slate-400 block font-bold">등록 기관/담당자</span>
                    <span id="kpi-local-economy-username-text" class="text-xs font-bold text-slate-700">익명</span>
                  </div>
                </div>
                <div id="kpi-local-economy-details-box" class="hidden bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600">
                  <span class="font-bold text-slate-700 block mb-0.5">기여 분야 / 세부 내역:</span>
                  <p id="kpi-local-economy-details-text" class="leading-relaxed"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 11-2: 로컬푸드 구매 기여 파급효과 (기대효과) -->
          <div id="kpi-local-food-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <i data-lucide="leaf" class="w-4 h-4 text-emerald-600"></i> 로컬푸드 협력 탄소 감축
                </span>
                <span class="bg-emerald-50 text-[10px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">로컬푸드 실천</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60">
                  <div>
                    <span class="text-[9px] text-emerald-600 block font-bold">로컬푸드 탄소 감축량</span>
                    <span id="kpi-local-food-reduced-carbon" class="text-sm font-black text-emerald-700">0.00 kgCO2eq</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] text-slate-400 block font-bold">구매 금액 (원)</span>
                    <span id="kpi-local-food-amount-text" class="text-xs font-bold text-slate-700">0원</span>
                  </div>
                </div>
                <div id="kpi-local-food-details-box" class="hidden bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600 space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-700">구매 매장 / 업체명:</span>
                    <span id="kpi-local-food-store-text" class="font-semibold text-slate-800"></span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-700">구매 실천자:</span>
                    <span id="kpi-local-food-username-text" class="font-semibold text-slate-800"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 12: 사회적 포용 프로그램 (기대효과) -->
          <div id="kpi-inclusion-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="smile" class="w-4 h-4 text-blue-600"></i> 사회적 포용 프로그램 실천
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">사회적 포용 실천</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <span class="text-[9px] text-blue-600 block font-bold">총 참가 인원</span>
                    <span id="kpi-inclusion-participants-text" class="text-sm font-black text-blue-700">0명</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] text-slate-400 block font-bold">등록 프로그램 수</span>
                    <span id="kpi-inclusion-count-text" class="text-xs font-bold text-slate-700">0개 활동</span>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <span class="text-[9px] text-slate-400 block font-bold">등록된 포용 프로그램 목록</span>
                  <div id="kpi-inclusion-program-tags" class="flex flex-wrap gap-1.5"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 13: ESG 교육 · 멘토링 프로그램 (기대효과) -->
          <div id="kpi-esg-edu-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="graduation-cap" class="w-4 h-4 text-blue-600"></i> ESG 교육 · 멘토링 프로그램
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">멘토링·교육 실천</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <span class="text-[9px] text-blue-600 block font-bold">총 교육 수강 인원</span>
                    <span id="kpi-esg-edu-participants-text" class="text-sm font-black text-blue-700">0명</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] text-slate-400 block font-bold">실시 세션 수</span>
                    <span id="kpi-esg-edu-count-text" class="text-xs font-bold text-slate-700">0회 세션</span>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <span class="text-[9px] text-slate-400 block font-bold">등록된 교육/멘토링 세션 목록</span>
                  <div id="kpi-esg-edu-program-tags" class="flex flex-wrap gap-1.5"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 14: 청년 서포터즈 제출 실적 (기대효과) -->
          <div id="kpi-supporters-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="camera" class="w-4 h-4 text-blue-600"></i> 청년 크리에이터 서포터즈 제출
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">서포터즈 제출 완료</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px]">
                  <div class="flex items-center space-x-2">
                    <i data-lucide="user" class="w-4 h-4 text-blue-600"></i>
                    <span class="font-bold text-slate-700" id="kpi-supporters-username-text">닉네임</span>
                  </div>
                  <span class="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black" id="kpi-supporters-filename-text">활동 파일 첨부됨</span>
                </div>
                <div id="kpi-supporters-details-box" class="hidden bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600">
                  <span class="font-bold text-slate-700 block mb-0.5">활동 역할 / 소개:</span>
                  <p id="kpi-supporters-details-text" class="leading-relaxed"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 15: 기부 챌린지 및 판매 실적 (기대효과) -->
          <div id="kpi-donation-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="gift" class="w-4 h-4 text-blue-600"></i> 기부 챌린지 및 판매 기부 실적
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">기부 매칭 완료</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <span class="text-[9px] text-blue-600 block font-bold">총 판매/기부 금액</span>
                    <span id="kpi-donation-amount-text" class="text-sm font-black text-blue-700">0 만원</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] text-slate-400 block font-bold">수혜 대상 / 기부처</span>
                    <span id="kpi-donation-target-text" class="text-xs font-bold text-slate-700">미지정</span>
                  </div>
                </div>
                <div id="kpi-donation-details-box" class="hidden bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600">
                  <span class="font-bold text-slate-700 block mb-0.5">챌린지 세부 설명:</span>
                  <p id="kpi-donation-details-text" class="leading-relaxed"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 16: 지식 나눔 및 재능 기부 강연 (기대효과) -->
          <div id="kpi-knowledge-sharing-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                  <i data-lucide="heart-handshake" class="w-4 h-4 text-blue-600"></i> 지식 나눔 · 재능 기부 강연
                </span>
                <span class="bg-blue-50 text-[10px] text-blue-700 font-bold px-2.5 py-0.5 rounded-full">재능 기부 강연</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <span class="text-[9px] text-blue-600 block font-bold">총 수강 인원</span>
                    <span id="kpi-knowledge-participants-text" class="text-sm font-black text-blue-700">0명</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] text-slate-400 block font-bold">실시 강연 수</span>
                    <span id="kpi-knowledge-count-text" class="text-xs font-bold text-slate-700">0개 강연</span>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <span class="text-[9px] text-slate-400 block font-bold">등록된 강연 목록</span>
                  <div id="kpi-knowledge-program-tags" class="flex flex-wrap gap-1.5"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 17: ISO 20121 국제 인증서 제출 (기대효과) -->
          <div id="kpi-iso20121-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-indigo-850 flex items-center gap-1.5">
                  <i data-lucide="award" class="w-4 h-4 text-indigo-600"></i> ISO 20121 국제 인증서 제출
                </span>
                <span class="bg-indigo-50 text-[10px] text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">인증서 제출 완료</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px]">
                  <div class="flex items-center space-x-2">
                    <i data-lucide="file-check-2" class="w-4 h-4 text-indigo-600"></i>
                    <span class="font-bold text-slate-700 truncate max-w-[180px]" id="kpi-iso20121-filename">cert.pdf</span>
                  </div>
                  <span class="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-black" id="kpi-iso20121-filetype">PDF 첨부 완료</span>
                </div>
                <div id="kpi-iso20121-details-box" class="hidden bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600 space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-700">발급 기관 / 번호:</span>
                    <span id="kpi-iso20121-cert-org-text" class="font-semibold text-slate-800"></span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-700">제출 담당자:</span>
                    <span id="kpi-iso20121-username-text" class="font-semibold text-slate-800"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 18: ESG 성과 보고서 제출 (기대효과) -->
          <div id="kpi-esg-report-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-indigo-850 flex items-center gap-1.5">
                  <i data-lucide="file-text" class="w-4 h-4 text-indigo-600"></i> ESG 성과 보고서 공시
                </span>
                <span class="bg-indigo-50 text-[10px] text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">성과공시 완료</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px]">
                  <div class="flex items-center space-x-2">
                    <i data-lucide="file-check-2" class="w-4 h-4 text-indigo-600"></i>
                    <span class="font-bold text-slate-700 truncate max-w-[180px]" id="kpi-esg-report-filename">report.pdf</span>
                  </div>
                  <span class="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-black">PDF 공시 완료</span>
                </div>
                <div id="kpi-esg-report-details-box" class="hidden bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600 space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-700">보고서 제목:</span>
                    <span id="kpi-esg-report-title-text" class="font-semibold text-slate-800"></span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-700">공시 담당자:</span>
                    <span id="kpi-esg-report-username-text" class="font-semibold text-slate-800"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Diagram 19: ESG 자문위원회 회의 기록 (기대효과) -->
          <div id="kpi-advisory-card" class="hidden transition-all duration-300 mt-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                <span class="text-xs font-extrabold text-indigo-850 flex items-center gap-1.5">
                  <i data-lucide="users-2" class="w-4 h-4 text-indigo-600"></i> ESG 자문위원회 회의 개최
                </span>
                <span class="bg-indigo-50 text-[10px] text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">회의 기록 완료</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px]">
                  <div class="flex items-center space-x-2">
                    <i data-lucide="map-pin" class="w-4 h-4 text-indigo-600"></i>
                    <span class="font-bold text-slate-700 truncate max-w-[180px]" id="kpi-advisory-location-text">회의 장소</span>
                  </div>
                  <span class="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-black" id="kpi-advisory-datetime-text">회의 일시</span>
                </div>
                
                <!-- Meeting Photo Preview in Selected Outcomes -->
                <div id="kpi-advisory-photo-container" class="hidden flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <img id="kpi-advisory-photo-preview" src="" class="w-full h-24 object-cover rounded-lg border border-slate-200">
                </div>

                <div id="kpi-advisory-details-box" class="hidden bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600 space-y-1">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-700">회의 주요 안건 / 자문 내용:</span>
                    <p id="kpi-advisory-summary-text" class="text-slate-800 mt-0.5 leading-relaxed"></p>
                  </div>
                  <div class="flex justify-between items-center border-t border-slate-200/50 pt-1.5 mt-1.5">
                    <span class="font-bold text-slate-700">회의 서기 / 위원:</span>
                    <span id="kpi-advisory-username-text" class="font-semibold text-slate-800"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom description info badge inside the card -->
          <div class="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <p class="text-[11px] text-amber-800 leading-normal font-medium">
              각 지표는 개최지의 생태 가치를 수호하기 위한 상시 모니터링 체계와 연동되며, 대회 종료 후 공식 투명 보고서(GRI 표준 준용) 형태로 출간 및 공시됩니다.
            </p>
          </div>
        </div>

        <!-- Right Column: Quantitative Carbon Offset Performance Dashboard (Light Themed to match the left card) -->
        <div class="lg:col-span-5 bg-slate-50/70 rounded-2xl p-6 text-slate-800 border border-slate-200/50 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/5 blur-2xl"></div>
          
          <div class="space-y-5 relative z-10">
            <div class="border-b border-slate-200/60 pb-3 flex justify-between items-center">
              <div>
                <span class="text-[9px] uppercase font-black text-emerald-600 tracking-widest block">ESG Impact Dashboard</span>
                <h3 class="text-sm font-extrabold text-slate-900 mt-0.5">누적 ESG 탄소 감축 성과</h3>
              </div>
              <div class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <i data-lucide="bar-chart-3" class="w-4 h-4 text-emerald-600"></i>
              </div>
            </div>

            <!-- Big Counter Display -->
            <div class="bg-white rounded-2xl p-6 border border-slate-200/60 text-center space-y-2 shadow-sm">
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Carbon Reduction</span>
              <span id="kpi-total-reduced-kg" class="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight block">0.00 kgCO2eq</span>
              <p class="text-[9px] text-slate-500">실시간 누적 탄소 배출 저감 효과</p>
            </div>

            <!-- Offset Conversion Details -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Pine Trees Card -->
              <div class="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between space-y-3 shadow-sm">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                    <i data-lucide="tree-pine" class="w-3.5 h-3.5 text-emerald-600"></i>
                  </div>
                  <span class="text-[9px] text-slate-500 font-bold">소나무 식재 효과</span>
                </div>
                <div>
                  <span id="kpi-pine-trees" class="text-lg font-black text-slate-800 block">0.0그루</span>
                  <span class="text-[8px] text-slate-400 leading-none">소나무 상세 효과</span>
                </div>
              </div>
              
              <!-- Car Km Card -->
              <div class="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between space-y-3 shadow-sm">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                    <i data-lucide="car" class="w-3.5 h-3.5 text-emerald-600"></i>
                  </div>
                  <span class="text-[9px] text-slate-500 font-bold">승용차 주행 감축</span>
                </div>
                <div>
                  <span id="kpi-car-km" class="text-lg font-black text-slate-800 block">0.0km</span>
                  <span class="text-[8px] text-slate-400 leading-none">내연기관 차 대체 주행거리</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Motto with Clean Quotes -->
          <div class="bg-white rounded-xl p-3 border border-slate-200/60 relative shadow-sm">
            <span class="absolute top-1 right-2 text-2xl text-slate-200 font-serif select-none leading-none">“</span>
            <p class="text-[10px] italic text-slate-600 font-medium relative z-10 leading-relaxed">
              "지금의 실현이, 우리 지역과 미래 세대의 자산이 됩니다."
            </p>
            <p class="text-[8px] text-emerald-600 font-bold mt-1 uppercase tracking-widest">
              Sustainable Event, Better Future
            </p>
          </div>
        </div>

      </div>
    </section>

  </div>
  <!-- FLOATING LIVE CARBON DASHBOARD -->
  <div id="floatingDashboard" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3.5 rounded-full shadow-2xl border border-emerald-500/20 z-40 flex items-center space-x-6 transition-all duration-500 transform translate-y-20 opacity-0 max-w-lg w-[calc(100%-2rem)] sm:w-auto">
    <div class="flex items-center space-x-2.5">
      <div class="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 animate-pulse">
        <i data-lucide="leaf" class="w-4 h-4 text-emerald-400"></i>
      </div>
      <div class="flex flex-col">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Live Carbon Reduction</span>
        <span id="float-total-carbon" class="text-sm font-black text-emerald-400 leading-none">0 gCO2eq</span>
      </div>
    </div>
    <div class="h-8 w-px bg-slate-800"></div>
    <div class="flex items-center space-x-4 text-xs font-medium text-slate-300">
      <div class="flex flex-col">
        <span class="text-[8px] text-slate-400 font-bold leading-none mb-1">실천 행동</span>
        <span id="float-actions" class="font-extrabold text-white leading-none text-center">0건</span>
      </div>
    </div>
  </div>

  <!-- Footer Info -->
  <footer class="text-center py-8 text-slate-400 text-[10px] pb-24">
    <p>© 2026 MUREPA. All Rights Reserved.</p>
  </footer>

  <!-- ==========================================
       MODAL POPUP FOR DETAILS
       ========================================== -->
  <div id="detailModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300">
      <div class="flex justify-between items-start pb-3 border-b border-slate-100">
        <h3 id="modalTitle" class="text-sm font-extrabold text-slate-900">상세 정보</h3>
        <button onclick="closeDetailModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="py-4 space-y-3">
        <p id="modalDescription" class="text-xs text-slate-600 leading-relaxed">상세 설명문이 들어가는 공간입니다.</p>
        
        <!-- File upload box inside detailModal -->
        <div id="detailModalFileUploadContainer" class="hidden space-y-2 border-t border-slate-100 pt-3">
          <span class="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">ISO 20121 인증서 첨부파일 (PDF / 이미지)</span>
          <label for="detail-file-upload" class="flex flex-col items-center justify-center w-full min-h-[95px] p-2.5 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
            <div id="iso20121-preview-container" class="flex flex-col items-center justify-center text-center">
              <i data-lucide="file-check-2" id="iso20121-upload-icon" class="w-6 h-6 text-indigo-500 mb-1"></i>
              <p class="text-[11px] text-slate-700 font-bold mb-0.5" id="iso20121-filename">클릭하여 인증서 파일(PDF, JPG, PNG) 첨부</p>
              <p class="text-[9px] text-slate-400">PDF 문서 및 이미지 파일 가능 (최대 20MB)</p>
            </div>
            <input id="detail-file-upload" type="file" accept="image/*,.pdf" class="hidden" onchange="handleIso20121FileChange(event)">
          </label>
        </div>
      </div>
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeDetailModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">닫기</button>
        <button id="btn-detail-submit" onclick="submitIso20121(); closeDetailModal();" class="hidden bg-[#0f2042] hover:bg-blue-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-md">인증서 제출</button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR ECO SIMULATOR (다회용기)
       ========================================== -->
  <div id="ecoSimulatorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="cup-soda" class="w-5 h-5 text-emerald-600"></i>
            나의 다회용기 탄소감축 실천
          </h3>
          <p class="text-[10px] text-slate-500">일회용기 대신 다회용 식기를 사용하여 온실가스를 줄여주세요.</p>
        </div>
        <button onclick="closeEcoSimulatorModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">참여자 닉네임 (선택)</label>
          <input type="text" id="eco-username" placeholder="이름 또는 닉네임을 입력하세요 (선택)" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium">
        </div>

        <!-- Items Counters -->
        <div class="space-y-2.5">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">실천할 품목 수량</span>
          
          <!-- 1. Cup -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="cup-soda" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">다회용 컵</h4>
                <p class="text-[9px] text-slate-450">-52 gCO2eq / 개</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button onclick="changeQty('cup', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span id="qty-cup" class="w-6 text-center text-xs font-extrabold text-slate-800 select-none">0</span>
              <button onclick="changeQty('cup', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            </div>
          </div>

          <!-- 2. Plate -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="utensils" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">다회용 접시</h4>
                <p class="text-[9px] text-slate-450">-37 gCO2eq / 개</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button onclick="changeQty('plate', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span id="qty-plate" class="w-6 text-center text-xs font-extrabold text-slate-800 select-none">0</span>
              <button onclick="changeQty('plate', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            </div>
          </div>

          <!-- 3. Bowl -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="soup" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">다회용 볼</h4>
                <p class="text-[9px] text-slate-450">-60 gCO2eq / 개</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button onclick="changeQty('bowl', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span id="qty-bowl" class="w-6 text-center text-xs font-extrabold text-slate-800 select-none">0</span>
              <button onclick="changeQty('bowl', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            </div>
          </div>

          <!-- 4. Fork -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="hand-metal" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">다회용 포크</h4>
                <p class="text-[9px] text-slate-450">-9 gCO2eq / 개</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button onclick="changeQty('fork', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span id="qty-fork" class="w-6 text-center text-xs font-extrabold text-slate-800 select-none">0</span>
              <button onclick="changeQty('fork', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            </div>
          </div>
        </div>

        <!-- Result Summary Board -->
        <div class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/70 flex justify-between items-center transition-all duration-300">
          <div>
            <span class="text-[9px] font-bold text-emerald-700 uppercase tracking-widest block">Expected CO2 Reduction</span>
            <span class="text-[10px] text-slate-400 font-medium">실시간 예상 탄소 감축 결과</span>
          </div>
          <div class="text-right">
            <span id="eco-carbon-summary" class="text-lg font-black text-emerald-700 leading-none">0 gCO2eq</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeEcoSimulatorModal()" class="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors">취소</button>
        <button onclick="submitEcoSimulation()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 완료
        </button>
      </div>
    </div>
  </div>

  <!-- Custom Alert Toast -->
  <div id="toast" class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold transition-all duration-300 opacity-0 pointer-events-none transform translate-y-3 z-50 flex items-center gap-2">
    <i data-lucide="info" class="w-4 h-4 text-emerald-400"></i>
    <span id="toast-message">메시지</span>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR TRANSPORT SIMULATOR (친환경 이동수단)
       ========================================== -->
  <div id="transportSimulatorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="bus" class="w-5 h-5 text-blue-600"></i>
            나의 친환경 이동수단 실천
          </h3>
          <p class="text-[10px] text-slate-500">승용차 대신 셔틀버스나 대중교통을 타서 탄소 배출을 줄여보세요.</p>
        </div>
        <button onclick="closeTransportSimulatorModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">참여자 닉네임 (선택)</label>
          <input type="text" id="transport-username" placeholder="이름 또는 닉네임을 입력하세요 (선택)" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Inputs Grid -->
        <div class="space-y-3">
          <!-- Distance Input -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <i data-lucide="milestone" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">이동 거리</h4>
                <p class="text-[9px] text-slate-450">승용차 대체 주행 거리</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="changeTransportQty('distance', -5)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">-5</button>
              <button onclick="changeTransportQty('distance', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span id="qty-distance" class="w-10 text-center text-xs font-extrabold text-slate-800 select-none">0 km</span>
              <button onclick="changeTransportQty('distance', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
              <button onclick="changeTransportQty('distance', 5)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">+5</button>
            </div>
          </div>

          <!-- People Count Input -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <i data-lucide="users-2" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">탑승 인원</h4>
                <p class="text-[9px] text-slate-450">대체 이동 인원수</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button onclick="changeTransportQty('people', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span id="qty-people" class="w-6 text-center text-xs font-extrabold text-slate-800 select-none">1</span>
              <button onclick="changeTransportQty('people', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            </div>
          </div>
        </div>

        <!-- Info Description Block -->
        <div class="text-[9px] text-slate-450 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li>승용차 배출계수: 0.16 kgCO2eq/km (160 g/km)</li>
            <li>일반 버스 배출계수: 0.8 kgCO2eq/대·km (20명 탑승 기준 인당 40 g/km)</li>
            <li><strong>대비 감축 효과: 120 gCO2eq / 인·km</strong></li>
          </ul>
        </div>

        <!-- Result Summary Board -->
        <div class="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/70 flex justify-between items-center transition-all duration-300">
          <div>
            <span class="text-[9px] font-bold text-blue-700 uppercase tracking-widest block">Expected CO2 Reduction</span>
            <span class="text-[10px] text-slate-400 font-medium">실시간 예상 탄소 감축 결과</span>
          </div>
          <div class="text-right">
            <span id="transport-carbon-summary" class="text-lg font-black text-blue-700 leading-none">0 gCO2eq</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeTransportSimulatorModal()" class="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors">취소</button>
        <button onclick="submitTransportSimulation()" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 완료
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR ENERGY SIMULATOR (100% 재생에너지 운영)
       ========================================== -->
  <div id="energySimulatorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="sun" class="w-5 h-5 text-amber-500"></i>
            나의 재생에너지 사용 실천
          </h3>
          <p class="text-[10px] text-slate-500">이벤트 운영 전력을 재생에너지로 사용하여 탄소 배출을 줄여보세요.</p>
        </div>
        <button onclick="closeEnergySimulatorModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">참여자 닉네임 (선택)</label>
          <input type="text" id="energy-username" placeholder="이름 또는 닉네임을 입력하세요 (선택)" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-medium font-bold">
        </div>

        <!-- Input Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <i data-lucide="zap" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">사용 전력량</h4>
                <p class="text-[9px] text-slate-450 font-bold">재생에너지 사용 전력</p>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <button onclick="changeEnergyQty(-100)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">-100</button>
              <button onclick="changeEnergyQty(-10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">-10</button>
              <input type="number" id="qty-energy" value="0" min="0" max="100000" oninput="updateEnergyModalUI()"
                     class="w-16 text-center text-xs font-extrabold text-slate-800 bg-white border border-slate-200 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
              <span class="text-[10px] font-bold text-slate-500 ml-0.5">kWh</span>
              <button onclick="changeEnergyQty(10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">+10</button>
              <button onclick="changeEnergyQty(100)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">+100</button>
            </div>
          </div>
        </div>

        <!-- Info Description Block -->
        <div class="text-[9px] text-slate-450 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li>녹색프리미엄 입찰 구매 단가: 1 kWh당 11원</li>
            <li>온실가스 감축(회피) 배출계수: 1 kWh당 0.4781 kg CO2e (478.1 gCO2eq)</li>
          </ul>
        </div>

        <!-- Result Summary Board -->
        <div class="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/70 space-y-2 transition-all duration-300">
          <div class="flex justify-between items-center">
            <div>
              <span class="text-[9px] font-bold text-amber-700 uppercase tracking-widest block">Expected Cost</span>
              <span class="text-[10px] text-slate-400 font-medium">실시간 예상 구매 금액 (단가 11원)</span>
            </div>
            <div class="text-right">
              <span id="energy-cost-summary" class="text-xs font-black text-amber-700 leading-none">0원</span>
            </div>
          </div>
          <div class="border-t border-amber-200/40 my-1"></div>
          <div class="flex justify-between items-center">
            <div>
              <span class="text-[9px] font-bold text-emerald-700 uppercase tracking-widest block">Expected CO2 Reduction</span>
              <span class="text-[10px] text-slate-400 font-medium">실시간 예상 탄소 감축 결과</span>
            </div>
            <div class="text-right">
              <span id="energy-carbon-summary" class="text-xs font-black text-emerald-700 leading-none">0 gCO2eq</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeEnergySimulatorModal()" class="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors">취소</button>
        <button onclick="submitEnergySimulation()" class="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 완료
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR UPCYCLE SIMULATOR (업사이클링 굿즈 제작)
       ========================================== -->
  <div id="upcycleSimulatorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="recycle" class="w-5 h-5 text-emerald-600"></i>
            나의 업사이클링 굿즈 제작 실천
          </h3>
          <p class="text-[10px] text-slate-500">버려지는 폐기물을 활용해 유니크한 굿즈를 제작하고 탄소를 줄여보세요.</p>
        </div>
        <button onclick="closeUpcycleSimulatorModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">참여자 닉네임 (선택)</label>
          <input type="text" id="upcycle-username" placeholder="이름 또는 닉네임을 입력하세요 (선택)" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium">
        </div>

        <!-- Product Category Select -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">상품 카테고리</label>
          <select id="upcycle-category" onchange="updateUpcycleModalUI()" 
                  class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-bold bg-white text-slate-800">
            <option value="keyring">키링 (Keyring) - 플라스틱 병뚜껑 업사이클링</option>
            <option value="banner">캠핑의자 (Chair) - 폐현수막 업사이클링</option>
          </select>
        </div>

        <!-- Qty Input for Keyring -->
        <div id="keyring-input-group" class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
          <div class="flex items-center space-x-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <i data-lucide="hash" class="w-4 h-4"></i>
            </span>
            <div>
              <h4 class="text-xs font-bold text-slate-800">제작 수량 (Q)</h4>
              <p class="text-[9px] text-slate-450">제작할 키링의 개수</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="changeUpcycleQty(-10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">-10</button>
            <button onclick="changeUpcycleQty(-1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
            <input type="number" id="qty-upcycle" value="0" min="0" max="1000" oninput="updateUpcycleModalUI()" 
                   class="w-12 text-center text-xs font-extrabold text-slate-800 bg-transparent border-b border-slate-300 focus:outline-none focus:border-emerald-500">
            <button onclick="changeUpcycleQty(1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            <button onclick="changeUpcycleQty(10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">+10</button>
          </div>
        </div>

        <!-- Inputs for Banner Upcycling -->
        <div id="banner-input-group" class="hidden space-y-3">
          <!-- Total Goods Qty (N) -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">총 제작 굿즈 수량 (N)</h4>
                <p class="text-[9px] text-slate-450">캠핑의자 등 제작 개수</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="changeBannerQty('N', -10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">-10</button>
              <button onclick="changeBannerQty('N', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <input type="number" id="qty-banner-n" value="0" min="0" max="5000" oninput="updateUpcycleModalUI()" 
                     class="w-12 text-center text-xs font-extrabold text-slate-800 bg-transparent border-b border-slate-300 focus:outline-none focus:border-emerald-500">
              <button onclick="changeBannerQty('N', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
              <button onclick="changeBannerQty('N', 10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">+10</button>
            </div>
          </div>

          <!-- Goods per Banner (Y) -->
          <div class="flex items-center justify-between bg-slate-55 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="maximize" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">현수막 1장당 제작 개수 (Y)</h4>
                <p class="text-[9px] text-slate-450">현수막 1장에서 나오는 굿즈 수량</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="changeBannerQty('Y', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <input type="number" id="qty-banner-y" value="0" min="0" max="100" oninput="updateUpcycleModalUI()" 
                     class="w-12 text-center text-xs font-extrabold text-slate-800 bg-transparent border-b border-slate-300 focus:outline-none focus:border-emerald-500">
              <button onclick="changeBannerQty('Y', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            </div>
          </div>

          <!-- Formula Info Display -->
          <div class="text-[9px] text-slate-450 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
            <ul class="list-disc pl-3.5 space-y-0.5">
              <li>사용된 폐현수막 수량 ($Q$): <span id="banner-calc-q" class="font-bold text-slate-700">0</span> 장</li>
              <li>소각 탄소 배출 원단위: <strong>6.28 kg CO2eq / 장</strong></li>
            </ul>
          </div>
        </div>

        <!-- Result Summary Board -->
        <div id="upcycle-result-container" class="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex justify-between items-center transition-all duration-300">
          <div>
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Expected CO2 Reduction</span>
            <span id="upcycle-result-label" class="text-[10px] text-slate-450 font-medium">실시간 예상 탄소 감축 결과</span>
          </div>
          <div class="text-right">
            <span id="upcycle-carbon-summary" class="text-lg font-black text-slate-500 leading-none">0 gCO2eq</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeUpcycleSimulatorModal()" class="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors">취소</button>
        <button id="btn-submit-upcycle" disabled onclick="submitUpcycleSimulation()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 완료
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR PAPER BOOTH SIMULATOR (종이 전시부스)
       ========================================== -->
  <div id="paperBoothSimulatorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="layers" class="w-5 h-5 text-emerald-600"></i>
            나의 친환경 종이 전시부스 실천
          </h3>
          <p class="text-[10px] text-slate-500">기존 MDF 부스 대신 친환경 허니컴보드 종이부스를 도입하여 대량의 탄소를 저감해 보세요.</p>
        </div>
        <button onclick="closePaperBoothSimulatorModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">참여자 닉네임 (선택)</label>
          <input type="text" id="booth-username" placeholder="이름 또는 닉네임을 입력하세요 (선택)" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium font-bold font-bold">
        </div>

        <!-- Input Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="layout" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-xs font-bold text-slate-800">도입 부스 면적</h4>
                <p class="text-[9px] text-slate-450 font-bold">허니컴보드 부스 총 면적</p>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <button onclick="changeBoothQty(-100)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">-100</button>
              <button onclick="changeBoothQty(-10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">-10</button>
              <input type="number" id="qty-paper-booth" value="0" min="0" max="10000" oninput="updateBoothModalUI()"
                     class="w-16 text-center text-xs font-extrabold text-slate-800 bg-white border border-slate-200 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <span class="text-[10px] font-bold text-slate-500 ml-0.5">㎡</span>
              <button onclick="changeBoothQty(10)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">+10</button>
              <button onclick="changeBoothQty(100)" class="w-8 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-655 hover:bg-slate-50 active:scale-95 transition-all text-[9px] font-black">+100</button>
            </div>
          </div>
        </div>

        <!-- Info Description Block -->
        <div class="text-[9px] text-slate-450 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
          <ul class="list-disc pl-3.5 space-y-0.5">
            <li>기존 MDF 부스 배출량 baseline: <span id="booth-baseline-calc" class="font-bold text-slate-700">0</span> kg CO2eq</li>
            <li>허니컴보드 종이부스 배출량 project: <span id="booth-project-calc" class="font-bold text-slate-700">0</span> kg CO2eq</li>
            <li><strong>순 탄소 감축 효과: 10.125 kg CO2eq / ㎡</strong></li>
          </ul>
        </div>

        <!-- Result Summary Board -->
        <div id="booth-result-container" class="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex justify-between items-center transition-all duration-300">
          <div>
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Expected CO2 Reduction</span>
            <span id="booth-result-label" class="text-[10px] text-slate-450 font-medium">실시간 예상 탄소 감축 결과</span>
          </div>
          <div class="text-right">
            <span id="booth-carbon-summary" class="text-lg font-black text-slate-500 leading-none">0 gCO2eq</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closePaperBoothSimulatorModal()" class="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors">취소</button>
        <button id="btn-submit-booth" disabled onclick="submitBoothSimulation()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 완료
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR VENUE ECOLOGY CERTIFICATES
       ========================================== -->
  <div id="venueEcologyModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="shield-check" class="w-5 h-5 text-emerald-600"></i>
            친환경 행사장 인증 및 탄소상쇄 등록
          </h3>
          <p class="text-[10px] text-slate-500">행사장이 보유한 친환경 인증과 행사 탄소 상쇄 실적을 제출해 주세요.</p>
        </div>
        <button onclick="closeVenueEcologyModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        
        <!-- Section 1 -->
        <div class="space-y-2">
          <span class="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-max">1단계. 공간/장소(Venue) 친환경 인증 라인업</span>
          
          <div class="space-y-2">
            <!-- ① G-SEED -->
            <label class="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150/70 hover:bg-slate-100/50 cursor-pointer transition-colors">
              <input type="checkbox" id="cert-gseed" class="mt-0.5 rounded border-slate-200 text-emerald-650 focus:ring-emerald-500">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-slate-900">G-SEED (녹색건축인증)</span>
                <p class="text-[10px] text-slate-500 font-medium leading-tight">국토교통부와 환경부가 부여하는 대한민국 표준 친환경 건축물 인증입니다.</p>
              </div>
            </label>

            <!-- ② LEED -->
            <label class="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150/70 hover:bg-slate-100/50 cursor-pointer transition-colors">
              <input type="checkbox" id="cert-leed" class="mt-0.5 rounded border-slate-200 text-emerald-650 focus:ring-emerald-500">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-slate-900">LEED (인증)</span>
                <p class="text-[10px] text-slate-500 font-medium leading-tight">미국 그린빌딩협회(USGBC)가 발급하는 세계에서 가장 권위 있는 글로벌 친환경 건축 인증입니다.</p>
              </div>
            </label>

            <!-- ③ EarthCheck -->
            <label class="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150/70 hover:bg-slate-100/50 cursor-pointer transition-colors">
              <input type="checkbox" id="cert-earthcheck" class="mt-0.5 rounded border-slate-200 text-emerald-650 focus:ring-emerald-500">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-slate-900">EarthCheck (어스체크)</span>
                <p class="text-[10px] text-slate-500 font-medium leading-tight">세계적인 관광·마이스(MICE)·서비스 산업 특화 친환경 인증입니다.</p>
              </div>
            </label>

            <!-- ④ ISO 14001 -->
            <label class="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150/70 hover:bg-slate-100/50 cursor-pointer transition-colors">
              <input type="checkbox" id="cert-iso14001" class="mt-0.5 rounded border-slate-200 text-emerald-650 focus:ring-emerald-500">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-slate-900">ISO 14001 (환경경영시스템)</span>
                <p class="text-[10px] text-slate-500 font-medium leading-tight">기관의 운영 프로세스 전체가 친환경 국제 표준에 부합함을 증명하는 인증입니다.</p>
              </div>
            </label>

            <!-- ⑤ ISO 20121 -->
            <label class="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150/70 hover:bg-slate-100/50 cursor-pointer transition-colors">
              <input type="checkbox" id="cert-iso20121" class="mt-0.5 rounded border-slate-200 text-emerald-650 focus:ring-emerald-500">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-slate-900">ISO 20121 (이벤트 지속가능성 경영)</span>
                <p class="text-[10px] text-slate-500 font-medium leading-tight">행사 행정 시스템 자체가 친환경 표준에 맞추어 매니지먼트되는지 검증하는 마이스 특화 인증입니다.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Section 2 -->
        <div class="space-y-2">
          <span class="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-max">2단계. 당기 행사 운영 정산 시스템</span>
          
          <div class="space-y-2">
            <!-- ⑥ 사회공헌형 산림탄소상쇄제도 -->
            <label class="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150/70 hover:bg-slate-100/50 cursor-pointer transition-colors">
              <input type="checkbox" id="cert-forest" class="mt-0.5 rounded border-slate-200 text-blue-655 focus:ring-blue-500">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-slate-900">사회공헌형 산림탄소상쇄제도 (행사형)</span>
                <p class="text-[10px] text-slate-500 font-medium leading-tight">산림청이 주관하여 행사에서 발생한 탄소를 정산하고 상쇄했을 때 정부 공인 마크를 주는 제도입니다.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Section 3: PDF Upload -->
        <div class="space-y-1.5 border-t border-slate-100 pt-3">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">인증서 PDF 파일 업로드 (필수)</span>
          
          <div class="flex items-center justify-center w-full">
            <label for="pdf-upload" class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50/70 hover:border-emerald-500 transition-colors">
              <div class="flex flex-col items-center justify-center pt-3 pb-3">
                <i data-lucide="file-up" id="upload-icon" class="w-6 h-6 text-slate-400 mb-1"></i>
                <p class="text-[10px] text-slate-500 font-bold mb-0.5" id="upload-filename">클릭하여 PDF 인증서 업로드</p>
                <p class="text-[9px] text-slate-400">PDF 파일만 가능 (최대 10MB)</p>
              </div>
              <input id="pdf-upload" type="file" accept=".pdf" class="hidden" onchange="handleFileChange(event)">
            </label>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeVenueEcologyModal()" class="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl transition-colors">취소</button>
        <button id="btn-submit-venue-ecology" disabled onclick="submitVenueEcology()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          제출하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR SIGNAGE SIMULATOR (디지털 페이퍼리스 & 사이니지)
       ========================================== -->
  <div id="signageSimulatorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="monitor" class="w-5 h-5 text-emerald-600"></i>
            페이퍼리스 & 사이니지 탄소 계산기
          </h3>
          <p class="text-[10px] text-slate-500">종이를 줄이고 디지털 사이니지로 전환 시 감축되는 탄소량을 산정합니다.</p>
        </div>
        <button onclick="closeSignageSimulatorModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">참여자 닉네임 (선택)</label>
          <input type="text" id="signage-username" placeholder="이름 또는 닉네임을 입력하세요 (선택)" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium font-sans">
        </div>

        <!-- 1. Paper reduction by type -->
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
          <div class="flex items-center space-x-2.5 pb-1 border-b border-slate-200/60">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <i data-lucide="file-text" class="w-4 h-4"></i>
            </span>
            <div>
              <h4 class="text-xs font-bold text-slate-800">줄인 종이 인쇄물 (복수 입력 가능)</h4>
              <p class="text-[9px] text-slate-450">대체한 종이 종류별 수량을 입력해 주세요.</p>
            </div>
          </div>
          
          <!-- A4 일반지 -->
          <div class="flex items-center justify-between text-xs">
            <div>
              <span class="font-bold text-slate-700">A4 일반지</span>
              <span class="text-[9px] text-slate-450 block">장당 5g / 감축 -5.6g</span>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="changeSignagePaperQty('a4', -50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 font-bold text-[9px]">-50</button>
              <button onclick="changeSignagePaperQty('a4', -10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <input type="number" id="qty-signage-paper-a4" value="0" oninput="updateSignageModalUI()" class="w-10 text-center font-extrabold text-slate-800 bg-transparent focus:outline-none border-b border-slate-200">
              <button onclick="changeSignagePaperQty('a4', 10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50"><i data-lucide="plus" class="w-3 h-3"></i></button>
              <button onclick="changeSignagePaperQty('a4', 50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 font-bold text-[9px]">+50</button>
            </div>
          </div>

          <!-- 브로슈어/리플렛 -->
          <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <div>
              <span class="font-bold text-slate-700">브로슈어/리플렛</span>
              <span class="text-[9px] text-slate-450 block">장당 15g / 감축 -16.8g</span>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="changeSignagePaperQty('brochure', -50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 font-bold text-[9px]">-50</button>
              <button onclick="changeSignagePaperQty('brochure', -10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <input type="number" id="qty-signage-paper-brochure" value="0" oninput="updateSignageModalUI()" class="w-10 text-center font-extrabold text-slate-800 bg-transparent focus:outline-none border-b border-slate-200">
              <button onclick="changeSignagePaperQty('brochure', 10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50"><i data-lucide="plus" class="w-3 h-3"></i></button>
              <button onclick="changeSignagePaperQty('brochure', 50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 font-bold text-[9px]">+50</button>
            </div>
          </div>

          <!-- 포스터/대형 -->
          <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <div>
              <span class="font-bold text-slate-700">포스터/대형</span>
              <span class="text-[9px] text-slate-450 block">장당 30g / 감축 -33.6g</span>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="changeSignagePaperQty('poster', -50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 font-bold text-[9px]">-50</button>
              <button onclick="changeSignagePaperQty('poster', -10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <input type="number" id="qty-signage-paper-poster" value="0" oninput="updateSignageModalUI()" class="w-10 text-center font-extrabold text-slate-800 bg-transparent focus:outline-none border-b border-slate-200">
              <button onclick="changeSignagePaperQty('poster', 10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50"><i data-lucide="plus" class="w-3 h-3"></i></button>
              <button onclick="changeSignagePaperQty('poster', 50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-50 font-bold text-[9px]">+50</button>
            </div>
          </div>
        </div>

        <!-- 2. q_view (NFC/QR views) -->
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <i data-lucide="qr-code" class="w-4 h-4"></i>
            </span>
            <div>
              <h4 class="text-xs font-bold text-slate-800">모바일 컨텐츠 조회수</h4>
              <p class="text-[9px] text-slate-450">NFC/QR을 통한 문서 조회 (회)</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button onclick="changeSignageQty('views', -50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all font-bold text-xs">-50</button>
            <button onclick="changeSignageQty('views', -10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
            <input type="number" id="qty-signage-views" value="0" oninput="updateSignageModalUI()" class="w-12 text-center text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none border-b border-slate-200 focus:border-emerald-500">
            <button onclick="changeSignageQty('views', 10)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            <button onclick="changeSignageQty('views', 50)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all font-bold text-xs">+50</button>
          </div>
        </div>

        <!-- 3. t_signage (Signage hours) -->
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <i data-lucide="clock" class="w-4 h-4"></i>
            </span>
            <div>
              <h4 class="text-xs font-bold text-slate-800">사이니지 가동시간</h4>
              <p class="text-[9px] text-slate-450">디스플레이 운영 시간 (시간)</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button onclick="changeSignageQty('hours', -5)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all font-bold text-xs">-5</button>
            <button onclick="changeSignageQty('hours', -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="minus" class="w-3 h-3"></i></button>
            <input type="number" id="qty-signage-hours" value="0" oninput="updateSignageModalUI()" class="w-10 text-center text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none border-b border-slate-200 focus:border-emerald-500">
            <button onclick="changeSignageQty('hours', 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"><i data-lucide="plus" class="w-3 h-3"></i></button>
            <button onclick="changeSignageQty('hours', 5)" class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all font-bold text-xs">+5</button>
          </div>
        </div>

        <!-- 4. is_renewable (Switch) -->
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <i data-lucide="zap" class="w-4 h-4"></i>
            </span>
            <div>
              <h4 class="text-xs font-bold text-slate-800">신재생에너지 100% 사용</h4>
              <p class="text-[9px] text-slate-450">녹색프리미엄 등 재생에너지 조달 여부</p>
            </div>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="signage-renewable" onchange="updateSignageModalUI()" class="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500">
          </div>
        </div>

        <!-- Details breakdown -->
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[10px] space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">기존 종이 배출량 (+)</span>
            <span id="signage-breakdown-paper" class="font-bold text-slate-700">0.00 kgCO2eq</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">디지털 기기/조회 배출량 (-)</span>
            <span id="signage-breakdown-digital" class="font-bold text-red-650">0.00 kgCO2eq</span>
          </div>
        </div>

        <!-- Result Summary Board -->
        <div class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/70 flex justify-between items-center transition-all duration-300">
          <div>
            <span class="text-[9px] font-bold text-emerald-700 uppercase tracking-widest block">Expected CO2 Net Reduction</span>
            <span class="text-[10px] text-slate-400 font-medium">실시간 예상 순 감축 결과</span>
          </div>
          <div class="text-right">
            <span id="signage-carbon-summary" class="text-lg font-black text-emerald-700 leading-none">0 gCO2eq</span>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeSignageSimulatorModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button id="btn-submit-signage" onclick="submitSignageSimulation()" class="bg-[#0f4c3a] hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 등록하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR BARRIER FREE CHECKLIST (배리어프리)
       ========================================== -->
  <div id="barrierFreeModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="accessibility" class="w-5 h-5 text-blue-600"></i>
            무장애 행사 실천 가이드라인
          </h3>
          <p class="text-[10px] text-slate-500">행사장 내 물리적 장벽과 정보 접근성 장벽을 허무는 배리어프리 실천 항목을 등록해 주세요.</p>
        </div>
        <button onclick="closeBarrierFreeModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">참여자 닉네임 (선택)</label>
          <input type="text" id="barrier-free-username" placeholder="이름 또는 닉네임을 입력하세요 (선택)" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium font-sans">
        </div>

        <!-- Checkbox Options -->
        <div class="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">우리 행사의 배리어프리 실천 항목</span>
          
          <!-- Option 1: Ramp -->
          <label class="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer select-none">
            <input type="checkbox" id="bf-ramp" onchange="checkBarrierFreeSubmitStatus()" class="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500">
            <div class="flex-grow">
              <h4 class="text-xs font-bold text-slate-800">무장애 이동 동선</h4>
              <p class="text-[9px] text-slate-450 leading-tight mt-0.5">행사장 턱 제거, 슬로프 및 경사로 설치로 휠체어/유아차 이동 자유화</p>
            </div>
          </label>

          <!-- Option 2: Desk -->
          <label class="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer select-none">
            <input type="checkbox" id="bf-desk" onchange="checkBarrierFreeSubmitStatus()" class="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500">
            <div class="flex-grow">
              <h4 class="text-xs font-bold text-slate-800">저단 등록 데스크 운영</h4>
              <p class="text-[9px] text-slate-450 leading-tight mt-0.5">휠체어 사용자 눈높이에 맞춘 별도의 낮은 등록 및 상담 데스크 운영</p>
            </div>
          </label>

          <!-- Option 3: Facility -->
          <label class="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer select-none">
            <input type="checkbox" id="bf-facility" onchange="checkBarrierFreeSubmitStatus()" class="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500">
            <div class="flex-grow">
              <h4 class="text-xs font-bold text-slate-800">장애인 편의시설 확보</h4>
              <p class="text-[9px] text-slate-450 leading-tight mt-0.5">장애인 화장실 및 세션장 내 전용 휠체어석 보장 및 안내 동선 확보</p>
            </div>
          </label>

          <!-- Option 4: Sign Language -->
          <label class="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer select-none">
            <input type="checkbox" id="bf-sign" onchange="checkBarrierFreeSubmitStatus()" class="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500">
            <div class="flex-grow">
              <h4 class="text-xs font-bold text-slate-800">수어 통역 및 실시간 자막</h4>
              <p class="text-[9px] text-slate-450 leading-tight mt-0.5">전문 수어 통역사 상시 대기 및 주요 세션 스크린 실시간 텍스트 자막 송출</p>
            </div>
          </label>

          <!-- Option 5: Easy Read -->
          <label class="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer select-none">
            <input type="checkbox" id="bf-easy" onchange="checkBarrierFreeSubmitStatus()" class="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500">
            <div class="flex-grow">
              <h4 class="text-xs font-bold text-slate-800">쉬운 언어 (Easy Read) 안내서</h4>
              <p class="text-[9px] text-slate-450 leading-tight mt-0.5">발달장애인 및 노년층을 위해 핵심 내용을 직관적인 단어와 그림으로 재구성한 안내서 배포</p>
            </div>
          </label>

          <!-- Option 6: Braille & QR -->
          <label class="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer select-none">
            <input type="checkbox" id="bf-braille" onchange="checkBarrierFreeSubmitStatus()" class="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500">
            <div class="flex-grow">
              <h4 class="text-xs font-bold text-slate-800">점자/음성안내 QR 코드 배치</h4>
              <p class="text-[9px] text-slate-450 leading-tight mt-0.5">주요 시설물 점자 표기 및 모바일로 즉시 읽을 수 있는 음성 해설 QR 연동</p>
            </div>
          </label>

          <!-- Option 7: Helper -->
          <label class="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer select-none">
            <input type="checkbox" id="bf-helper" onchange="checkBarrierFreeSubmitStatus()" class="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500">
            <div class="flex-grow">
              <h4 class="text-xs font-bold text-slate-800">이동 보조 스태프 및 안내견 보장</h4>
              <p class="text-[9px] text-slate-450 leading-tight mt-0.5">휠체어 이동 보조 전담 요원 상주 및 시각장애인 보조견 동반 출입 및 편의 보장</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeBarrierFreeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button id="btn-submit-barrier-free" disabled onclick="submitBarrierFree()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 등록하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR LOCAL FOOD (로컬푸드 구매 탄소감축 계산기)
       ========================================== -->
  <div id="localFoodModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="leaf" class="w-5 h-5 text-emerald-600"></i>
            로컬푸드 구매 탄소감축 계산기
          </h3>
          <p class="text-[10px] text-slate-500">소상공인 매장에서 로컬푸드를 구매한 내역을 등록하여 탄소감축을 실천하세요.</p>
        </div>
        <button onclick="closeLocalFoodModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname/Submitter Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">구매자명 (선택)</label>
          <input type="text" id="local-food-username" placeholder="이름 또는 기관명을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium">
        </div>

        <!-- Store Name Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">구매 매장 / 소상공인 업체명 (필수)</label>
          <input type="text" id="local-food-store" oninput="calculateLocalFood()" placeholder="예: 동문시장 올레 농산물, 삼다 청과" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium">
        </div>

        <!-- Purchase Amount Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">구매 금액 (원 - 필수)</label>
          <div class="relative">
            <input type="number" id="local-food-amount" oninput="calculateLocalFood()" min="0" placeholder="예: 50000" 
                   class="w-full text-sm font-extrabold text-slate-800 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all pr-14">
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">원</span>
          </div>
        </div>

        <!-- Live Calculation Box -->
        <div class="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-medium text-slate-500">기본 식품 탄소배출량:</span>
            <span id="local-food-basic-emission" class="font-bold text-slate-700">0.00 kgCO2eq</span>
          </div>
          <div class="flex justify-between items-center border-t border-indigo-100/50 pt-2">
            <span class="font-bold text-indigo-900 flex items-center gap-1">
              <i data-lucide="leaf" class="w-3.5 h-3.5 text-emerald-600"></i> 로컬푸드 탄소감축량 (50%):
            </span>
            <span id="local-food-reduction" class="text-sm font-black text-emerald-600">0.00 kgCO2eq</span>
          </div>
        </div>

        <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-[10px] text-emerald-800 space-y-1">
          <div class="flex items-center gap-1.5 font-bold">
            <i data-lucide="info" class="w-3.5 h-3.5 text-emerald-600"></i>
            산정 기준 참고
          </div>
          <p class="text-[9px] text-slate-650 leading-relaxed">
            로컬푸드 구매에 따른 푸드 마일리지 절감 및 물류 수송 과정 탄소 감축(지출액 1만원당 0.00034445 tCO2eq 감축) 공식을 반영한 결과입니다.
          </p>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button id="btn-cancel-submit-local-food" class="hidden px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all mr-auto active:scale-98" onclick="cancelLocalFoodSubmit()">
          등록 취소
        </button>
        <button onclick="closeLocalFoodModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button id="btn-submit-local-food" disabled onclick="submitLocalFood()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실천 등록하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR LOCAL ECONOMY (지역경제 기여)
       ========================================== -->
  <div id="localEconomyModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="trending-up" class="w-5 h-5 text-blue-600"></i>
            지역경제 기여 실적 등록
          </h3>
          <p class="text-[10px] text-slate-500">대회를 통해 창출된 지역경제 파급효과 금액 및 상세내용을 입력해 주세요.</p>
        </div>
        <button onclick="closeLocalEconomyModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">담당자/기관명 (선택)</label>
          <input type="text" id="local-economy-username" placeholder="이름 또는 기관명을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Economic Value Amount Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">추정 경제적 창출 가치 (만원)</label>
          <div class="relative">
            <input type="number" id="local-economy-amount" step="1" min="0" placeholder="금액을 입력하세요" value=""
                   class="w-full text-sm font-extrabold text-slate-800 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all pr-14">
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">만 원</span>
          </div>
        </div>

        <!-- Details / Note Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">기여 분야 / 세부 내역</label>
          <textarea id="local-economy-details" rows="3" placeholder="예: 도외 참관단 숙박, 로컬 식음료 이용, 지역 골목상권 및 대중교통 소비 파급효과"
                    class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium resize-none"></textarea>
        </div>

        <div class="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 text-[10px] text-blue-800 space-y-1">
          <div class="flex items-center gap-1.5 font-bold">
            <i data-lucide="info" class="w-3.5 h-3.5 text-blue-600"></i>
            산정 기준 참고
          </div>
          <p class="text-[9px] text-slate-600 leading-relaxed">
            비즈니스 참관객의 숙박비, 식비, 교통비 및 지역 소상공인 연계 부스 매출액을 종합 합산한 실적입니다.
          </p>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeLocalEconomyModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button onclick="submitLocalEconomy()" class="bg-[#0f2042] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          실적 등록하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR INCLUSION PROGRAM (포용 프로그램)
       ========================================== -->
  <div id="inclusionModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5 max-h-[90vh]">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="smile" class="w-5 h-5 text-blue-600"></i>
            사회적 포용 프로그램 등록
          </h3>
          <p class="text-[10px] text-slate-500">진행한 프로그램명과 참가 인원수를 등록해 주세요. 추가 버튼을 통해 여러 활동을 등록할 수 있습니다.</p>
        </div>
        <button onclick="closeInclusionModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 overflow-y-auto pr-1">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">등록자 / 기관명 (선택)</label>
          <input type="text" id="inclusion-username" placeholder="이름 또는 기관명을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Dynamic Program Item List Container -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">포용 프로그램 목록</span>
            <button type="button" onclick="addInclusionProgramRow()" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors">
              <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
              프로그램 추가
            </button>
          </div>
          
          <div id="inclusion-program-list" class="space-y-2.5">
            <!-- Rows injected by JavaScript -->
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeInclusionModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button onclick="submitInclusionPrograms()" class="bg-[#0f2042] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          프로그램 등록 완료
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR ESG EDUCATION (ESG 교육 · 체험)
       ========================================== -->
  <div id="esgEducationModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5 max-h-[90vh]">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="graduation-cap" class="w-5 h-5 text-blue-600"></i>
            ESG 교육·체험 프로그램 등록
          </h3>
          <p class="text-[10px] text-slate-500">실시한 ESG 교육/체험 프로그램과 참가 인원수를 등록해 주세요. 추가 버튼을 통해 여러 활동을 추가할 수 있습니다.</p>
        </div>
        <button onclick="closeEsgEducationModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 overflow-y-auto pr-1">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">등록자 / 기관명 (선택)</label>
          <input type="text" id="esg-edu-username" placeholder="이름 또는 기관명을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Dynamic Program Item List Container -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">ESG 교육·체험 프로그램 목록</span>
            <button type="button" onclick="addEsgEduProgramRow()" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors">
              <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
              프로그램 추가
            </button>
          </div>
          
          <div id="esg-edu-program-list" class="space-y-2.5">
            <!-- Rows injected by JavaScript -->
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeEsgEducationModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button onclick="submitEsgEducation()" class="bg-[#0f2042] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          프로그램 등록 완료
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR SUPPORTERS (서포터즈 사진/PDF 첨부)
       ========================================== -->
  <div id="supportersModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="camera" class="w-5 h-5 text-blue-600"></i>
            서포터즈 활동 파일 제출
          </h3>
          <p class="text-[10px] text-slate-500">로컬 청년 크리에이터 서포터즈의 활동 사진 또는 PDF 보고서를 업로드해 주세요.</p>
        </div>
        <button onclick="closeSupportersModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname / Supporter Team -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">서포터즈 닉네임 / 팀명</label>
          <input type="text" id="supporters-username" placeholder="이름 또는 팀명을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Activity Title / Role -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">활동 역할 / 주요 내용</label>
          <input type="text" id="supporters-role" placeholder="예: 현장 기획 및 미디어 영상/사진 촬영 서포트" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- File Attachment Section (Photo JPG/PNG/WEBP or PDF) -->
        <div class="space-y-1.5 border-t border-slate-100 pt-3">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">첨부파일 (사진 또는 PDF)</span>
          
          <div class="flex items-center justify-center w-full">
            <label for="supporters-file-upload" class="flex flex-col items-center justify-center w-full min-h-[100px] p-3 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50/70 hover:border-blue-500 transition-colors">
              <div id="supporters-preview-container" class="flex flex-col items-center justify-center text-center">
                <i data-lucide="upload-cloud" id="supporters-upload-icon" class="w-7 h-7 text-slate-400 mb-1"></i>
                <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="supporters-filename">클릭하여 사진 또는 PDF 첨부</p>
                <p class="text-[9px] text-slate-400">이미지(JPG, PNG, WEBP) 및 PDF 가능 (최대 15MB)</p>
              </div>
              <input id="supporters-file-upload" type="file" accept="image/*,.pdf" class="hidden" onchange="handleSupportersFileChange(event)">
            </label>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeSupportersModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button id="btn-submit-supporters" disabled onclick="submitSupporters()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          파일 제출하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR DONATION CHALLENGE (기부 챌린지 · 판매 및 기부금 등록)
       ========================================== -->
  <div id="donationModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="gift" class="w-5 h-5 text-blue-600"></i>
            기부 챌린지 및 판매 실적 등록
          </h3>
          <p class="text-[10px] text-slate-500">대회를 통해 창출된 굿즈 판매 금액 및 기부 매칭 실적을 등록해 주세요.</p>
        </div>
        <button onclick="closeDonationModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">기획자 / 기관명 (선택)</label>
          <input type="text" id="donation-username" placeholder="이름 또는 기관명을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Sales / Donation Amount Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">총 판매 및 기부 금액 (만원)</label>
          <div class="relative">
            <input type="number" id="donation-amount" step="1" min="0" placeholder="금액을 입력하세요" value=""
                   class="w-full text-sm font-extrabold text-slate-800 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all pr-14">
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">만 원</span>
          </div>
        </div>

        <!-- Target / Recipient Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">기부처 / 수혜 대상</label>
          <input type="text" id="donation-target" placeholder="예: 지역 아동복지 시설, 도내 생태 보존 재단" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Details Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">챌린지 세부 설명</label>
          <textarea id="donation-details" rows="2" placeholder="예: 걷기 미션 완료 매칭 기부금 및 플리마켓 굿즈 판매 수익금 기탁"
                    class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium resize-none"></textarea>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeDonationModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button onclick="submitDonation()" class="bg-[#0f2042] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          기부 실적 등록하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR KNOWLEDGE SHARING (지식 나눔 · 재능 기부 강연)
       ========================================== -->
  <div id="knowledgeSharingModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5 max-h-[90vh]">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="heart-handshake" class="w-5 h-5 text-blue-600"></i>
            지식 나눔 · 재능 기부 강연 등록
          </h3>
          <p class="text-[10px] text-slate-500">실시한 강연명, 연사 정보 및 수강 인원수를 등록해 주세요. 추가 버튼으로 여러 강연을 추가할 수 있습니다.</p>
        </div>
        <button onclick="closeKnowledgeSharingModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 overflow-y-auto pr-1">
        <!-- Nickname Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">등록자 / 기관명 (선택)</label>
          <input type="text" id="knowledge-username" placeholder="이름 또는 기관명을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium">
        </div>

        <!-- Dynamic Program Item List Container -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">강연 목록</span>
            <button type="button" onclick="addKnowledgeRow()" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors">
              <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
              강연 추가
            </button>
          </div>
          
          <div id="knowledge-program-list" class="space-y-2.5">
            <!-- Rows injected by JavaScript -->
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeKnowledgeSharingModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button onclick="submitKnowledgeSharing()" class="bg-[#0f2042] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          강연 등록 완료
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR ISO 20121 CERTIFICATE UPLOAD (ISO 20121 국제 인증서 제출)
       ========================================== -->
  <div id="iso20121Modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="award" class="w-5 h-5 text-indigo-600"></i>
            ISO 20121 국제 인증서 파일 제출
          </h3>
          <p class="text-[10px] text-slate-500">지속가능이벤트경영시스템(ISO 20121) 공식 인증서 사본(PDF/이미지)을 업로드해 주세요.</p>
        </div>
        <button onclick="closeIso20121Modal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Submitter / Organization -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">제출 기관 / 담당자 (선택)</label>
          <input type="text" id="iso20121-username" placeholder="기관명 또는 담당자 이름을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium">
        </div>

        <!-- Certificate Authority / Reg No -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">인증 기관 및 발급 번호 (선택)</label>
          <input type="text" id="iso20121-cert-org" placeholder="예: 한국표준협회 (KSA) / Cert No. 2026-ISO-08" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium">
        </div>

        <!-- File Attachment Section (PDF or Image) -->
        <div class="space-y-1.5 border-t border-slate-100 pt-3">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">인증서 첨부파일 (PDF 또는 이미지)</span>
          
          <div class="flex items-center justify-center w-full">
            <label for="iso20121-file-upload" class="flex flex-col items-center justify-center w-full min-h-[110px] p-3 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50/70 hover:border-indigo-500 transition-colors">
              <div id="iso20121-preview-container" class="flex flex-col items-center justify-center text-center">
                <i data-lucide="file-check-2" id="iso20121-upload-icon" class="w-7 h-7 text-indigo-500 mb-1"></i>
                <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="iso20121-filename">클릭하여 인증서 파일(PDF, JPG, PNG) 첨부</p>
                <p class="text-[9px] text-slate-400">PDF 문서 및 이미지 파일 지원 (최대 20MB)</p>
              </div>
              <input id="iso20121-file-upload" type="file" accept="image/*,.pdf" class="hidden" onchange="handleIso20121FileChange(event)">
            </label>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button id="btn-cancel-submit-iso20121" class="hidden px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all mr-auto active:scale-98" onclick="cancelIso20121Submit()">
          등록 취소
        </button>
        <button onclick="closeIso20121Modal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button id="btn-submit-iso20121" disabled onclick="submitIso20121()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          인증서 제출하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR ESG REPORT PDF ATTACHMENT (ESG 성과 보고서 PDF 첨부)
       ========================================== -->
  <div id="esgReportModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="file-text" class="w-5 h-5 text-indigo-600"></i>
            ESG 성과 보고서 PDF 첨부
          </h3>
          <p class="text-[10px] text-slate-500">GRI 표준 및 외부 전문 검증을 거친 ESG 성과 보고서(PDF)를 등록하세요.</p>
        </div>
        <button onclick="closeEsgReportModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Submitter / Organization -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">제출 기관 / 담당자 (선택)</label>
          <input type="text" id="esg-report-username" placeholder="기관명 또는 담당자 이름을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium">
        </div>

        <!-- Report Title / Year -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">보고서 제목 / 발간 연도 (선택)</label>
          <input type="text" id="esg-report-title" placeholder="예: 2026 지속가능경영 ESG 성과 보고서" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium">
        </div>

        <!-- File Attachment Section (PDF) -->
        <div class="space-y-1.5 border-t border-slate-100 pt-3">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">성과 보고서 첨부파일 (PDF)</span>
          
          <div class="flex items-center justify-center w-full">
            <label for="esg-report-file-upload" class="flex flex-col items-center justify-center w-full min-h-[110px] p-3 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50/70 hover:border-indigo-500 transition-colors">
              <div id="esg-report-preview-container" class="flex flex-col items-center justify-center text-center">
                <i data-lucide="file-up" id="esg-report-upload-icon" class="w-7 h-7 text-indigo-500 mb-1"></i>
                <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="esg-report-filename">클릭하여 ESG 성과 보고서(PDF) 첨부</p>
                <p class="text-[9px] text-slate-400">PDF 문서 파일 지원 (최대 30MB)</p>
              </div>
              <input id="esg-report-file-upload" type="file" accept=".pdf" class="hidden" onchange="handleEsgReportFileChange(event)">
            </label>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button id="btn-cancel-submit-esg-report" class="hidden px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all mr-auto active:scale-98" onclick="cancelEsgReportSubmit()">
          등록 취소
        </button>
        <button onclick="closeEsgReportModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button id="btn-submit-esg-report" disabled onclick="submitEsgReport()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          보고서 등록하기
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================
       MODAL POPUP FOR ESG ADVISORY COMMITTEE (ESG 자문위원회 장소, 일시, 사진 첨부)
       ========================================== -->
  <div id="advisoryModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center hidden transition-opacity duration-300 opacity-0 px-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300 flex flex-col space-y-5 max-h-[90vh]">
      
      <!-- Header -->
      <div class="flex justify-between items-start pb-2 border-b border-slate-100">
        <div class="space-y-0.5">
          <h3 class="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <i data-lucide="users-2" class="w-5 h-5 text-indigo-600"></i>
            ESG 자문위원회 회의 기록 & 사진 첨부
          </h3>
          <p class="text-[10px] text-slate-500">자문위원회 회의 장소, 개최 일시 및 현장 사진을 첨부해 주세요.</p>
        </div>
        <button onclick="closeAdvisoryModal()" class="text-slate-400 hover:text-slate-600 transition-colors pt-1">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 overflow-y-auto pr-1">
        <!-- Submitter / Advisory Member -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">작성자 / 자문위원 (선택)</label>
          <input type="text" id="advisory-username" placeholder="성명 또는 위원회 직책을 입력하세요" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium">
        </div>

        <!-- Meeting Location -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">회의 장소 (필수)</label>
          <input type="text" id="advisory-location" oninput="checkAdvisorySubmitStatus()" placeholder="예: 서울 MICE 컨벤션센터 3층 대회의실" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium">
        </div>

        <!-- Meeting Date & Time -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">회의 일시 (필수)</label>
          <input type="text" id="advisory-datetime" oninput="checkAdvisorySubmitStatus()" placeholder="예: 2026년 8월 15일(금) 14:00 ~ 16:00" 
                 class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium">
        </div>

        <!-- Meeting Agenda / Summary (Optional) -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">주요 안건 / 자문 내용 (선택)</label>
          <textarea id="advisory-summary" rows="2" placeholder="예: ESG 지속가능 이벤트 가이드라인 심의 및 탄소 감축 이행안 평가"
                    class="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium resize-none"></textarea>
        </div>

        <!-- File Attachment Section (Meeting Photo) -->
        <div class="space-y-1.5 border-t border-slate-100 pt-3">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">회의 현장 사진 첨부</span>
          
          <div class="flex items-center justify-center w-full">
            <label for="advisory-file-upload" class="flex flex-col items-center justify-center w-full min-h-[110px] p-3 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50/70 hover:border-indigo-500 transition-colors">
              <div id="advisory-preview-container" class="flex flex-col items-center justify-center text-center">
                <i data-lucide="camera" id="advisory-upload-icon" class="w-7 h-7 text-indigo-500 mb-1"></i>
                <p class="text-[11px] text-slate-600 font-bold mb-0.5" id="advisory-filename">클릭하여 회의 사진(JPG, PNG, WEBP) 첨부</p>
                <p class="text-[9px] text-slate-400">이미지 파일 지원 (최대 20MB)</p>
              </div>
              <input id="advisory-file-upload" type="file" accept="image/*" class="hidden" onchange="handleAdvisoryFileChange(event)">
            </label>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button id="btn-cancel-submit-advisory" class="hidden px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all mr-auto active:scale-98" onclick="cancelAdvisorySubmit()">
          등록 취소
        </button>
        <button onclick="closeAdvisoryModal()" class="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-98">
          취소
        </button>
        <button id="btn-submit-advisory" disabled onclick="submitAdvisory()" class="bg-slate-300 text-slate-500 cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          회의 기록 등록하기
        </button>
      </div>
    </div>
  </div>

  <!-- Setup Lucide and Modal scripts -->

  <script>
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
          const pineVal = (easeProgress * (end - start) + start) / 18;
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
        closeBarrierFreeModal();
        closeLocalEconomyModal();
        closeInclusionModal();
        closeEsgEducationModal();
        closeSupportersModal();
        closeDonationModal();
        closeKnowledgeSharingModal();
        closeIso20121Modal();
        closeEsgReportModal();
        closeAdvisoryModal();
      }
    });
  
