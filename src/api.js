// API functions for fetching WindBorne balloon data and weather data

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

// Weather data cache to avoid redundant API calls
const weatherCache = new Map();

/**
 * Get the base URL for our proxy API
 * In development: /api/balloons
 * In production: https://your-app.vercel.app/api/balloons
 */
function getProxyUrl() {
  // Check if we're running in development or production
  if (import.meta.env.DEV) {
    return '/api/balloons'; // Vite will proxy this
  }
  return '/api/balloons'; // In production, same path
}

/**
 * Fetch all balloon data from the past 24 hours
 * Uses our serverless function proxy to bypass CORS
 * @returns {Promise<{current: Array, historical: Array}>}
 */
export async function fetchAllBalloonData() {
  const filePromises = [];
  const baseUrl = getProxyUrl();
  
  // Fetch files 00.json through 23.json via our proxy
  for (let i = 0; i < 24; i++) {
    const url = `${baseUrl}?file=${i}`;
    filePromises.push(
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Proxy returned ${response.status} for file ${i}`);
          }
          return response.json();
        })
        .then(data => ({ hour: i, data }))
        .catch(error => {
          console.warn(`Error fetching file ${i}:`, error);
          return { hour: i, data: null };
        })
    );
  }

  const results = await Promise.allSettled(filePromises);
  
  // Separate current positions (00.json) from historical
  const current = [];
  const historical = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.data) {
      const positions = result.value.data;
      
      if (index === 0) {
        // Current positions (00.json)
        current.push(...positions);
      } else {
        // Historical positions (01.json - 23.json)
        historical.push(...positions);
      }
    }
  });

  console.log(`Fetched ${current.length} current positions and ${historical.length} historical positions`);
  
  return { current, historical };
}

/**
 * Fetch weather data for a given position
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeatherData(lat, lon) {
  // Create cache key (round to 1 decimal to cache nearby positions)
  const cacheKey = `${lat.toFixed(1)},${lon.toFixed(1)}`;
  
  // Check cache first
  if (weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey);
  }

  try {
    const url = `${OPEN_METEO_API}?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    const weather = data.current_weather;
    
    const weatherData = {
      temperature: weather.temperature,
      windSpeed: weather.windspeed,
      windDirection: weather.winddirection,
      weatherCode: weather.weathercode,
      description: getWeatherDescription(weather.weathercode)
    };
    
    // Cache the result
    weatherCache.set(cacheKey, weatherData);
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: null,
      windSpeed: null,
      windDirection: null,
      weatherCode: null,
      description: 'Weather data unavailable'
    };
  }
}

/**
 * Get weather description from WMO weather code
 * @param {number} code - WMO weather code
 * @returns {string} Weather description
 */
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail'
  };
  
  return weatherCodes[code] || 'Unknown';
}

/**
 * Clear weather cache (useful for periodic refreshes)
 */
export function clearWeatherCache() {
  weatherCache.clear();
}

