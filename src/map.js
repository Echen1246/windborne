// MapBox map initialization and rendering

import mapboxgl from 'mapbox-gl';
import { fetchWeatherData } from './api.js';

let map;
let currentPopup = null;

/**
 * Initialize MapBox map
 * @param {string} accessToken - MapBox access token
 */
export function initializeMap(accessToken) {
  mapboxgl.accessToken = accessToken;
  
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12', // Colorful with terrain
    center: [0, 20], // Center on global view
    zoom: 1.5,
    projection: 'globe' // Beautiful 3D globe view!
  });

  // Enable atmosphere effect for globe
  map.on('style.load', () => {
    map.setFog({
      color: 'rgb(186, 210, 235)', // Light blue
      'high-color': 'rgb(36, 92, 223)', // Dark blue
      'horizon-blend': 0.02,
      'space-color': 'rgb(11, 11, 25)', // Dark space
      'star-intensity': 0.6
    });
  });

  map.on('load', () => {
    console.log('Map loaded successfully with globe projection');
  });

  return map;
}

/**
 * Create GeoJSON FeatureCollection from position array
 * @param {Array} positions - Array of [lat, lng, altitude]
 * @returns {Object} GeoJSON FeatureCollection
 */
function createGeoJSONFromPositions(positions) {
  const features = positions.map((pos, index) => ({
    type: 'Feature',
    properties: {
      altitude: pos[2],
      index: index
    },
    geometry: {
      type: 'Point',
      coordinates: [pos[1], pos[0]] // [longitude, latitude]
    }
  }));

  return {
    type: 'FeatureCollection',
    features: features
  };
}

/**
 * Render heatmap layer showing 24-hour balloon density
 * @param {Array} historicalPositions - All positions from past 24 hours
 */
export function renderHeatmap(historicalPositions) {
  const geojson = createGeoJSONFromPositions(historicalPositions);
  
  // Remove existing heatmap if present
  if (map.getSource('heatmap-source')) {
    map.removeLayer('balloon-heatmap');
    map.removeSource('heatmap-source');
  }

  map.addSource('heatmap-source', {
    type: 'geojson',
    data: geojson
  });

  map.addLayer({
    id: 'balloon-heatmap',
    type: 'heatmap',
    source: 'heatmap-source',
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 0.5,
        9, 1.0
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 15,
        9, 30
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(233, 213, 255, 0)',
        0.2, 'rgba(233, 213, 255, 0.6)',
        0.4, 'rgba(192, 132, 252, 0.7)',
        0.6, 'rgba(168, 85, 247, 0.8)',
        0.8, 'rgba(147, 51, 234, 0.85)',
        1, 'rgba(107, 33, 168, 0.9)'
      ],
      'heatmap-opacity': 0.7
    }
  });

  console.log(`Rendered heatmap with ${historicalPositions.length} points`);
}

/**
 * Render current balloon position markers
 * @param {Array} currentPositions - Current balloon positions
 */
export function renderMarkers(currentPositions) {
  const geojson = createGeoJSONFromPositions(currentPositions);
  
  // Remove existing markers if present
  if (map.getSource('markers-source')) {
    if (map.getLayer('balloon-markers')) {
      map.off('click', 'balloon-markers', handleMarkerClick);
      map.off('mouseenter', 'balloon-markers', handleMarkerMouseEnter);
      map.off('mouseleave', 'balloon-markers', handleMarkerMouseLeave);
      map.removeLayer('balloon-markers');
    }
    map.removeSource('markers-source');
  }

  map.addSource('markers-source', {
    type: 'geojson',
    data: geojson
  });

  map.addLayer({
    id: 'balloon-markers',
    type: 'circle',
    source: 'markers-source',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 5,
        5, 7,
        10, 12
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'altitude'],
        0, '#3b82f6',     // Low altitude - blue
        10, '#22c55e',    // Mid altitude - green
        15, '#eab308',    // Higher altitude - yellow
        20, '#ef4444',    // High altitude - red
        25, '#dc2626'     // Very high altitude - dark red
      ],
      'circle-opacity': 1.0,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-opacity': 1.0
    }
  });

  // Add click handler
  map.on('click', 'balloon-markers', handleMarkerClick);
  
  // Change cursor on hover
  map.on('mouseenter', 'balloon-markers', handleMarkerMouseEnter);
  map.on('mouseleave', 'balloon-markers', handleMarkerMouseLeave);

  console.log(`Rendered ${currentPositions.length} balloon markers`);
}

/**
 * Handle marker click event
 */
async function handleMarkerClick(e) {
  const coordinates = e.features[0].geometry.coordinates.slice();
  const altitude = e.features[0].properties.altitude;
  const lat = coordinates[1];
  const lon = coordinates[0];

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // Close existing popup if any
  if (currentPopup) {
    currentPopup.remove();
  }

  // Create loading popup
  currentPopup = new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(`
      <div class="popup-content">
        <h3>Balloon Position</h3>
        <p><strong>Latitude:</strong> ${lat.toFixed(4)}°</p>
        <p><strong>Longitude:</strong> ${lon.toFixed(4)}°</p>
        <p><strong>Altitude:</strong> ${altitude.toFixed(2)} km</p>
        <div class="weather-loading">Loading weather data...</div>
      </div>
    `)
    .addTo(map);

  // Fetch and display weather data
  try {
    const weather = await fetchWeatherData(lat, lon);
    
    const windDir = getWindDirection(weather.windDirection);
    
    currentPopup.setHTML(`
      <div class="popup-content">
        <h3>Balloon Position</h3>
        <p><strong>Latitude:</strong> ${lat.toFixed(4)}°</p>
        <p><strong>Longitude:</strong> ${lon.toFixed(4)}°</p>
        <p><strong>Altitude:</strong> ${altitude.toFixed(2)} km</p>
        <hr>
        <h4>Weather Conditions</h4>
        ${weather.temperature !== null ? `
          <p><strong>Temperature:</strong> ${weather.temperature}°C</p>
          <p><strong>Wind:</strong> ${weather.windSpeed} km/h ${windDir}</p>
          <p><strong>Conditions:</strong> ${weather.description}</p>
        ` : `
          <p>Weather data unavailable</p>
        `}
      </div>
    `);
  } catch (error) {
    console.error('Error loading weather data:', error);
  }
}

/**
 * Convert wind direction in degrees to compass direction
 */
function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) return '';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Handle mouse enter on marker
 */
function handleMarkerMouseEnter() {
  map.getCanvas().style.cursor = 'pointer';
}

/**
 * Handle mouse leave on marker
 */
function handleMarkerMouseLeave() {
  map.getCanvas().style.cursor = '';
}

/**
 * Toggle heatmap visibility
 */
export function toggleHeatmapVisibility(visible) {
  if (map && map.getLayer('balloon-heatmap')) {
    map.setLayoutProperty(
      'balloon-heatmap',
      'visibility',
      visible ? 'visible' : 'none'
    );
  }
}

/**
 * Toggle markers visibility
 */
export function toggleMarkersVisibility(visible) {
  if (map && map.getLayer('balloon-markers')) {
    map.setLayoutProperty(
      'balloon-markers',
      'visibility',
      visible ? 'visible' : 'none'
    );
  }
}

/**
 * Update heatmap colors dynamically
 * @param {Array} colors - Array of RGBA color strings
 */
export function updateHeatmapColors(colors) {
  if (map && map.getLayer('balloon-heatmap')) {
    map.setPaintProperty('balloon-heatmap', 'heatmap-color', [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, colors[0],
      0.2, colors[1],
      0.4, colors[2],
      0.6, colors[3],
      0.8, colors[4],
      1, colors[5]
    ]);
  }
}

/**
 * Get map instance
 */
export function getMap() {
  return map;
}

