// API & Backend Network Client
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
 
