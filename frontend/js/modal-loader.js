/**
 * Modal Loader - Fetches modal HTML components and injects them into the page
 * This replaces inline modal HTML in index.html, reducing file size from 3,700+ to ~500 lines
 */
(function() {
  'use strict';

  const MODAL_FILES = [
    'detail',
    'eco_simulator',
    'transport_simulator',
    'local_transport',
    'energy_simulator',
    'upcycle_simulator',
    'paper_booth_simulator',
    'waste_recycling',
    'venue_ecology',
    'signage_simulator',
    'barrier_free',
    'safety_labor',
    'local_food',
    'local_economy',
    'inclusion',
    'esg_education',
    'supporters',
    'donation',
    'knowledge_sharing',
    'iso20121',
    'esg_report',
    'advisory',
    'stakeholder_feedback',
    'advisory_minutes',
    'esg_disclosure',
    'pdf_report_preview',
    'esg_presets',
    'emission_factor_settings',
    'freight_simulator',
    'fnb_simulator'
  ];

  // Map modal file names to element IDs
  const MODAL_ID_MAP = {
    'detail': 'detailModal',
    'eco_simulator': 'ecoSimulatorModal',
    'transport_simulator': 'transportSimulatorModal',
    'local_transport': 'localTransportModal',
    'energy_simulator': 'energySimulatorModal',
    'upcycle_simulator': 'upcycleSimulatorModal',
    'paper_booth_simulator': 'paperBoothSimulatorModal',
    'waste_recycling': 'wasteRecyclingModal',
    'venue_ecology': 'venueEcologyModal',
    'signage_simulator': 'signageSimulatorModal',
    'barrier_free': 'barrierFreeModal',
    'safety_labor': 'safetyLaborModal',
    'local_food': 'localFoodModal',
    'local_economy': 'localEconomyModal',
    'inclusion': 'inclusionModal',
    'esg_education': 'esgEducationModal',
    'supporters': 'supportersModal',
    'donation': 'donationModal',
    'knowledge_sharing': 'knowledgeSharingModal',
    'iso20121': 'iso20121Modal',
    'esg_report': 'esgReportModal',
    'advisory': 'advisoryModal',
    'stakeholder_feedback': 'stakeholderFeedbackModal',
    'advisory_minutes': 'advisoryMinutesModal',
    'esg_disclosure': 'esgDisclosureModal',
    'pdf_report_preview': 'pdfReportModal',
    'esg_presets': 'esgPresetsModal',
    'emission_factor_settings': 'emissionFactorSettingsModal',
    'freight_simulator': 'freightSimulatorModal',
    'fnb_simulator': 'fnbSimulatorModal'
  };

  // Determine base path for components (works on both localhost and GitHub Pages)
  function getBasePath() {
    const path = window.location.pathname;
    // If served from a subdirectory (e.g., /mice/ on GitHub Pages)
    if (path.includes('/mice/')) {
      return path.substring(0, path.lastIndexOf('/mice/') + 6);
    }
    // Default: relative to current page
    return './';
  }

  async function loadAllModals() {
    const container = document.getElementById('modal-container');
    if (!container) {
      console.warn('[Modal Loader] #modal-container not found. Modals may be inline.');
      return;
    }

    const basePath = getBasePath();
    const modalDir = basePath + 'components/modals/';

    // Filter out modals that are already present in the DOM
    const filesToFetch = MODAL_FILES.filter(name => {
      const id = MODAL_ID_MAP[name];
      return id ? !document.getElementById(id) : true;
    });

    if (filesToFetch.length === 0) {
      console.log('[Modal Loader] All modals are already present in DOM.');
      return;
    }

    try {
      // Fetch modal HTML files in parallel (with cache-busting)
      const fetchPromises = filesToFetch.map(name => {
        const url = modalDir + name + '.html?v=' + Date.now();
        return fetch(url)
          .then(response => {
            if (!response.ok) {
              console.warn(`[Modal Loader] Failed to load ${name}.html (${response.status})`);
              return '';
            }
            return response.text();
          })
          .catch(err => {
            console.warn(`[Modal Loader] Error loading ${name}.html:`, err);
            return '';
          });
      });

      const fragments = await Promise.all(fetchPromises);

      // Inject all modals at once
      container.innerHTML = fragments.join('\n');

      // Re-initialize Lucide icons for dynamically loaded content
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }

      console.log(`[Modal Loader] Successfully loaded ${MODAL_FILES.length} modals`);
    } catch (err) {
      console.error('[Modal Loader] Critical error loading modals:', err);
    }
  }

  // ==========================================
  // Global Modal Close Management (ESC Key & Backdrop Click & Toggle)
  // ==========================================
  function closeModal(modal) {
    if (!modal) return;
    const modalId = modal.id;
    if (modalId) {
      const fnName = 'close' + modalId.charAt(0).toUpperCase() + modalId.slice(1);
      if (typeof window[fnName] === 'function') {
        try {
          window[fnName]();
          return;
        } catch (err) {
          console.warn('Error calling ' + fnName + ':', err);
        }
      }
    }
    // Generic fallback animation & hide
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    const inner = modal.querySelector('div');
    if (inner) {
      inner.classList.add('scale-95');
    }
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.add('hidden');
    }, 250);
  }

  function closeAnyOpenModal() {
    const modals = document.querySelectorAll('.fixed.inset-0, [id$="Modal"]');
    modals.forEach(modal => {
      const isVisible = !modal.classList.contains('hidden') &&
                        modal.style.display !== 'none' &&
                        window.getComputedStyle(modal).display !== 'none';
      if (isVisible) {
        closeModal(modal);
      }
    });
  }

  window.closeModal = closeModal;
  window.closeAnyOpenModal = closeAnyOpenModal;

  // 1. ESC Key: close active modal on ESC key press
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      closeAnyOpenModal();
    }
  }, true);

  // 2. Backdrop Click: close modal when clicking outside dialog (on darkened backdrop)
  let mouseDownTarget = null;

  document.addEventListener('mousedown', function(e) {
    mouseDownTarget = e.target;
  }, true);

  document.addEventListener('click', function(e) {
    const openModals = Array.from(document.querySelectorAll('.fixed.inset-0')).filter(m => {
      return !m.classList.contains('hidden') && m.style.display !== 'none' && window.getComputedStyle(m).display !== 'none';
    });

    if (openModals.length === 0) return;

    openModals.forEach(modal => {
      const dialog = modal.querySelector('.bg-white') || modal.firstElementChild;
      const clickedOutside = dialog ? (!dialog.contains(e.target) && !dialog.contains(mouseDownTarget)) : (e.target === modal);
      if (clickedOutside) {
        closeModal(modal);
      }
    });
    mouseDownTarget = null;
  }, true);

  // 3. Card Toggle: If card or opener is clicked while its modal is already open, toggle it closed
  function setupModalToggles() {
    Object.values(MODAL_ID_MAP).forEach(id => {
      const openFnName = 'open' + id.charAt(0).toUpperCase() + id.slice(1);
      const closeFnName = 'close' + id.charAt(0).toUpperCase() + id.slice(1);
      const originalOpen = window[openFnName];
      if (typeof originalOpen === 'function' && !originalOpen._wrappedToggle) {
        window[openFnName] = function(...args) {
          const modal = document.getElementById(id);
          if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none' && !modal.classList.contains('opacity-0')) {
            if (typeof window[closeFnName] === 'function') {
              window[closeFnName]();
              return;
            }
          }
          return originalOpen.apply(this, args);
        };
        window[openFnName]._wrappedToggle = true;
      }
    });
  }

  // Hook toggle setup after app.js functions are registered
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadAllModals();
      setTimeout(setupModalToggles, 150);
    });
  } else {
    loadAllModals();
    setTimeout(setupModalToggles, 150);
  }
  window.addEventListener('load', () => {
    setTimeout(setupModalToggles, 100);
  });
})();
