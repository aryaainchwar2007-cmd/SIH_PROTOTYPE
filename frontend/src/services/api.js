// ==============================================================================
// Frontend Service Layer - SIH 2026 PS ID 191
// Clean API Abstraction returning Promises (Mock data today -> Real API tomorrow)
// ==============================================================================

import {
  KPI_METRICS,
  DISTRICT_PROFILES,
  VULNERABLE_HABITATIONS,
  CANDIDATE_RELOCATION_SITES,
  RED_ZONES,
  RECENT_SYSTEM_ALERTS,
  RISK_ANALYTICS_DATA
} from '../data/mockData';

// Simulated network latency
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // 1. KPI Summary
  async getKPIs() {
    await delay();
    return { ...KPI_METRICS };
  },

  // 2. Vulnerable Habitations with multi-criteria filtering
  async getHabitations(filters = {}) {
    await delay();
    let result = [...VULNERABLE_HABITATIONS];

    if (filters.district && filters.district !== 'All') {
      result = result.filter((h) => h.district.toLowerCase().includes(filters.district.toLowerCase()));
    }

    if (filters.riskTier && filters.riskTier !== 'All') {
      result = result.filter((h) => h.riskTier.toLowerCase() === filters.riskTier.toLowerCase());
    }

    if (filters.priority && filters.priority !== 'All') {
      result = result.filter((h) => String(h.priority) === String(filters.priority));
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((h) =>
        h.name.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.dominantHazards.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'riskScore') {
        result.sort((a, b) => b.riskScore - a.riskScore);
      } else if (filters.sortBy === 'population') {
        result.sort((a, b) => b.population - a.population);
      } else if (filters.sortBy === 'priority') {
        result.sort((a, b) => a.priority - b.priority);
      }
    }

    return result;
  },

  // 3. Habitation by ID
  async getHabitationById(id) {
    await delay();
    const habitation = VULNERABLE_HABITATIONS.find((h) => h.id === id);
    if (!habitation) throw new Error(`Habitation ${id} not found`);
    return { ...habitation };
  },

  // 4. Candidate Relocation Sites
  async getRelocationSites(filters = {}) {
    await delay();
    let result = [...CANDIDATE_RELOCATION_SITES];

    if (filters.district && filters.district !== 'All') {
      result = result.filter((s) => s.district.toLowerCase().includes(filters.district.toLowerCase()));
    }

    if (filters.minSuitability) {
      result = result.filter((s) => s.suitabilityScore >= Number(filters.minSuitability));
    }

    if (filters.minCapacity) {
      result = result.filter((s) => s.estimatedCapacity >= Number(filters.minCapacity));
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.overallRecommendation.toLowerCase().includes(q)
      );
    }

    return result;
  },

  // 5. Candidate Site by ID
  async getRelocationSiteById(id) {
    await delay();
    const site = CANDIDATE_RELOCATION_SITES.find((s) => s.id === id);
    if (!site) throw new Error(`Site ${id} not found`);
    return { ...site };
  },

  // 6. Red Zones Polygons
  async getRedZones() {
    await delay();
    return [...RED_ZONES];
  },

  // 7. District Profiles
  async getDistrictProfiles() {
    await delay();
    return [...DISTRICT_PROFILES];
  },

  // 8. System Alerts
  async getRecentAlerts() {
    await delay();
    return [...RECENT_SYSTEM_ALERTS];
  },

  // 9. Risk Analytics
  async getRiskAnalytics() {
    await delay();
    return { ...RISK_ANALYTICS_DATA };
  },

  // 10. Relocation Priority Queue
  async getPriorityQueue(tierFilter = 'All') {
    await delay();
    let habitations = [...VULNERABLE_HABITATIONS].sort((a, b) => a.priority - b.priority || b.riskScore - a.riskScore);
    if (tierFilter !== 'All') {
      habitations = habitations.filter((h) => String(h.priority) === String(tierFilter));
    }
    return habitations.map((h) => {
      const recommendedSite = CANDIDATE_RELOCATION_SITES.find((s) => s.id === h.recommendedSiteId);
      return {
        ...h,
        recommendedSite
      };
    });
  },

  // 11. What-If Simulation Engine (Frontend Sandbox prototype)
  async simulateWhatIf(params) {
    await delay(300);
    const {
      targetPopulation = 4000,
      riskThreshold = 75,
      maxDistanceKm = 15,
      minCapacity = 3000
    } = params;

    // Filter candidate sites based on distance and capacity
    const eligibleSites = CANDIDATE_RELOCATION_SITES.filter((site) => {
      return site.distanceFromRedZoneKm <= maxDistanceKm;
    });

    const highlySuitable = eligibleSites.filter((s) => s.suitabilityScore >= 85 && s.estimatedCapacity >= targetPopulation);
    const capacityDeficits = eligibleSites.filter((s) => s.estimatedCapacity < targetPopulation);
    const infrastructureNeeds = eligibleSites.filter((s) => s.capacityStatus === 'Moderate' || s.capacityStatus === 'Deficit Risk');

    return {
      simulationTimestamp: new Date().toISOString(),
      parametersUsed: { targetPopulation, riskThreshold, maxDistanceKm, minCapacity },
      totalEligibleFound: eligibleSites.length,
      highlySuitableCount: highlySuitable.length,
      capacityDeficitCount: capacityDeficits.length,
      infrastructureImprovementNeededCount: infrastructureNeeds.length,
      topRecommendedSite: highlySuitable[0] || eligibleSites[0] || null,
      evaluatedSites: eligibleSites.map((s) => ({
        ...s,
        simulatedHeadroom: s.estimatedCapacity - targetPopulation,
        simulatedUtilizationPercent: Math.round((targetPopulation / s.estimatedCapacity) * 100),
        absorptionFeasibility: s.estimatedCapacity >= targetPopulation ? 'Feasible' : 'Requires Split Relocation'
      }))
    };
  }
};
