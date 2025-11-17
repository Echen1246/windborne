// Interactive controls for filtering and toggling map layers

export class MapControls {
  constructor(onFilterChange) {
    this.onFilterChange = onFilterChange;
    
    // Default filter state
    this.filters = {
      altitudeMin: 0,
      altitudeMax: 25,
      timeRange: 24, // Hours to show (1-24)
      showHeatmap: true,
      showMarkers: true,
      regions: {
        northAmerica: true,
        southAmerica: true,
        europe: true,
        africa: true,
        asia: true,
        oceania: true,
        atlantic: true,
        pacific: true,
        indian: true,
        arctic: true,
        antarctic: true
      }
    };
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Altitude range slider
    const altMin = document.getElementById('altitude-min');
    const altMax = document.getElementById('altitude-max');
    if (altMin) {
      altMin.addEventListener('input', (e) => {
        this.filters.altitudeMin = parseFloat(e.target.value);
        document.getElementById('altitude-min-value').textContent = `${this.filters.altitudeMin} km`;
        this.notifyChange();
      });
    }
    if (altMax) {
      altMax.addEventListener('input', (e) => {
        this.filters.altitudeMax = parseFloat(e.target.value);
        document.getElementById('altitude-max-value').textContent = `${this.filters.altitudeMax} km`;
        this.notifyChange();
      });
    }
    
    // Time range slider
    const timeRange = document.getElementById('time-range');
    if (timeRange) {
      timeRange.addEventListener('input', (e) => {
        this.filters.timeRange = parseInt(e.target.value);
        document.getElementById('time-range-value').textContent = `${this.filters.timeRange}h`;
        this.notifyChange();
      });
    }
    
    // Layer toggles
    const heatmapToggle = document.getElementById('toggle-heatmap');
    const markersToggle = document.getElementById('toggle-markers');
    if (heatmapToggle) {
      heatmapToggle.addEventListener('change', (e) => {
        this.filters.showHeatmap = e.target.checked;
        this.notifyChange();
      });
    }
    if (markersToggle) {
      markersToggle.addEventListener('change', (e) => {
        this.filters.showMarkers = e.target.checked;
        this.notifyChange();
      });
    }
    
    // Region checkboxes
    Object.keys(this.filters.regions).forEach(region => {
      const checkbox = document.getElementById(`region-${region}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          this.filters.regions[region] = e.target.checked;
          this.notifyChange();
        });
      }
    });
    
    // Reset button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }
  
  notifyChange() {
    if (this.onFilterChange) {
      this.onFilterChange(this.filters);
    }
  }
  
  resetFilters() {
    this.filters = {
      altitudeMin: 0,
      altitudeMax: 25,
      timeRange: 24,
      showHeatmap: true,
      showMarkers: true,
      regions: {
        northAmerica: true,
        southAmerica: true,
        europe: true,
        africa: true,
        asia: true,
        oceania: true,
        atlantic: true,
        pacific: true,
        indian: true,
        arctic: true,
        antarctic: true
      }
    };
    
    // Update UI
    document.getElementById('altitude-min').value = 0;
    document.getElementById('altitude-max').value = 25;
    document.getElementById('time-range').value = 24;
    document.getElementById('altitude-min-value').textContent = '0 km';
    document.getElementById('altitude-max-value').textContent = '25 km';
    document.getElementById('time-range-value').textContent = '24h';
    document.getElementById('toggle-heatmap').checked = true;
    document.getElementById('toggle-markers').checked = true;
    
    Object.keys(this.filters.regions).forEach(region => {
      document.getElementById(`region-${region}`).checked = true;
    });
    
    this.notifyChange();
  }
  
  getFilters() {
    return this.filters;
  }
}

/**
 * Filter positions by altitude range
 */
export function filterByAltitude(positions, minAlt, maxAlt) {
  return positions.filter(pos => {
    const altitude = pos[2];
    return altitude >= minAlt && altitude <= maxAlt;
  });
}

/**
 * Filter positions by geographic region
 */
export function filterByRegion(positions, regions) {
  return positions.filter(pos => {
    const lat = pos[0];
    const lng = pos[1];
    
    // Check which region this position belongs to
    const region = getRegion(lat, lng);
    return regions[region];
  });
}

/**
 * Determine which region a position belongs to
 */
function getRegion(lat, lng) {
  // Arctic
  if (lat > 66.5) return 'arctic';
  // Antarctic
  if (lat < -66.5) return 'antarctic';
  
  // Continents (simplified boundaries)
  if (lat >= -10 && lat <= 70) {
    if (lng >= -170 && lng <= -30) return 'northAmerica';
    if (lng >= -20 && lng <= 50) return 'europe';
    if (lng >= -20 && lng <= 60 && lat < 35) return 'africa';
    if (lng >= 50 && lng <= 180) return 'asia';
    if (lng >= 110 && lng <= 180 && lat < 10) return 'oceania';
  }
  
  if (lat >= -60 && lat < -10 && lng >= -90 && lng <= -30) return 'southAmerica';
  if (lat >= -50 && lat < -10 && lng >= 110 && lng <= 180) return 'oceania';
  
  // Oceans
  if (lng >= -80 && lng <= 0) return 'atlantic';
  if (lng >= -180 && lng <= -80) return 'pacific';
  if ((lng >= 0 && lng <= 50) || (lng >= 110 && lng <= 180)) return 'indian';
  
  return 'pacific'; // Default to Pacific
}

