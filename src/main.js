// Main application entry point

import './style.css';
import { fetchAllBalloonData, clearWeatherCache } from './api.js';
import { initializeMap, renderHeatmap, renderMarkers, toggleHeatmapVisibility, toggleMarkersVisibility, updateHeatmapColors } from './map.js';
import { calculateAndDisplayStats, showLoading, showError } from './stats.js';
import { MapControls, filterByAltitude, filterByRegion } from './controls.js';
import { colorSchemes, getColorScheme } from './colorSchemes.js';

// Get MapBox API key from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('MapBox token not found. Please set VITE_MAPBOX_TOKEN in .env file');
  showError('MapBox API key not configured');
}

// Store raw data for filtering
let rawBalloonData = {
  current: [],
  historical: []
};

// Initialize the application
async function init() {
  try {
    // Initialize map
    const map = initializeMap(MAPBOX_TOKEN);
    
    // Wait for map to load
    map.on('load', async () => {
      await loadAndRenderData();
    });
  } catch (error) {
    console.error('Error initializing application:', error);
    showError('Failed to initialize application');
  }
}

/**
 * Load and render all data
 */
async function loadAndRenderData() {
  try {
    showLoading();
    
    // Fetch all balloon data
    console.log('Fetching balloon data...');
    const { current, historical } = await fetchAllBalloonData();
    
    if (current.length === 0) {
      throw new Error('No balloon data available');
    }
    
    // Store raw data
    rawBalloonData = { current, historical };
    
    // Apply filters and render
    applyFiltersAndRender();
    
    console.log('All data loaded and rendered successfully');
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Failed to load balloon data');
  }
}

/**
 * Apply current filters and re-render map
 */
function applyFiltersAndRender() {
  const filters = mapControls.getFilters();
  
  // Filter current positions
  let filteredCurrent = [...rawBalloonData.current];
  filteredCurrent = filterByAltitude(filteredCurrent, filters.altitudeMin, filters.altitudeMax);
  filteredCurrent = filterByRegion(filteredCurrent, filters.regions);
  
  // Filter historical data based on time range
  let filteredHistorical = [...rawBalloonData.historical];
  
  // Time range filtering: reduce historical data based on slider
  // If timeRange < 24, only use proportional amount of historical data
  if (filters.timeRange < 24) {
    const ratio = filters.timeRange / 24;
    const targetLength = Math.floor(rawBalloonData.historical.length * ratio);
    filteredHistorical = filteredHistorical.slice(0, targetLength);
  }
  
  filteredHistorical = filterByAltitude(filteredHistorical, filters.altitudeMin, filters.altitudeMax);
  filteredHistorical = filterByRegion(filteredHistorical, filters.regions);
  
  // Render based on layer toggles
  console.log('Rendering with filters...');
  
  if (filters.showHeatmap) {
    renderHeatmap(filteredHistorical);
    toggleHeatmapVisibility(true);
  } else {
    toggleHeatmapVisibility(false);
  }
  
  if (filters.showMarkers) {
    renderMarkers(filteredCurrent);
    toggleMarkersVisibility(true);
  } else {
    toggleMarkersVisibility(false);
  }
  
  // Update statistics with filtered data
  calculateAndDisplayStats(filteredCurrent);
  
  console.log(`Filtered to ${filteredCurrent.length} current and ${filteredHistorical.length} historical positions`);
}

/**
 * Refresh data (for periodic updates)
 */
async function refreshData() {
  console.log('Refreshing data...');
  
  try {
    // Clear weather cache to get fresh data
    clearWeatherCache();
    
    // Reload all data
    await loadAndRenderData();
    
    console.log('Data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
}

// Set up hourly auto-refresh (every 60 minutes)
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
setInterval(refreshData, REFRESH_INTERVAL);

console.log(`Auto-refresh enabled: every ${REFRESH_INTERVAL / 60000} minutes`);

// Toggle controls panel
const controlsPanel = document.getElementById('controls-panel');
const controlsToggleButton = document.getElementById('controls-toggle');
const toggleIcon = controlsToggleButton.querySelector('.toggle-icon');

controlsToggleButton.addEventListener('click', () => {
  controlsPanel.classList.toggle('collapsed');
  // Change arrow direction
  if (controlsPanel.classList.contains('collapsed')) {
    toggleIcon.textContent = '▶';
  } else {
    toggleIcon.textContent = '◀';
  }
});

// Initialize map controls
const mapControls = new MapControls((filters) => {
  // Re-render when filters change
  if (rawBalloonData.current.length > 0) {
    applyFiltersAndRender();
  }
});

// Color scheme picker
const colorPickerModal = document.getElementById('color-picker-modal');
const heatmapColorToggle = document.getElementById('heatmap-color-toggle');
const heatmapGradient = document.getElementById('heatmap-gradient');

heatmapColorToggle.addEventListener('click', () => {
  colorPickerModal.classList.toggle('hidden');
});

// Handle color scheme selection
document.querySelectorAll('.color-scheme-option').forEach(option => {
  option.addEventListener('click', () => {
    const scheme = option.dataset.scheme;
    const colorScheme = getColorScheme(scheme);
    
    // Update legend gradient
    const gradientColors = colorScheme.colors.join(', ');
    heatmapGradient.style.background = `linear-gradient(to right, ${gradientColors})`;
    
    // Update actual heatmap on map
    updateHeatmapColors(colorScheme.rgba);
    
    // Close modal
    colorPickerModal.classList.add('hidden');
  });
});

// Close color picker when clicking outside
document.addEventListener('click', (e) => {
  if (!colorPickerModal.contains(e.target) && !heatmapColorToggle.contains(e.target)) {
    colorPickerModal.classList.add('hidden');
  }
});

// Start the application
init();
