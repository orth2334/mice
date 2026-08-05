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
    'esg_presets'
  ];

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

    // Map modal file names to element IDs
    const MODAL_ID_MAP = {
      'detail': 'detailModal',
      'eco_simulator': 'ecoSimulatorModal',
      'transport_simulator': 'transportSimulatorModal',
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
      'esg_presets': 'esgPresetsModal'
    };

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
      // Fetch modal HTML files in parallel
      const fetchPromises = filesToFetch.map(name => {
        const url = modalDir + name + '.html';
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

  // Load modals as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllModals);
  } else {
    // DOM already loaded
    loadAllModals();
  }
})();
