// Statistics calculation and rendering

/**
 * Calculate and display statistics
 * @param {Array} currentPositions - Current balloon positions
 */
export function calculateAndDisplayStats(currentPositions) {
  if (!currentPositions || currentPositions.length === 0) {
    console.warn('No current positions available for stats');
    return;
  }

  // Extract altitudes
  const altitudes = currentPositions.map(pos => pos[2]);
  
  // Calculate statistics
  const balloonCount = currentPositions.length;
  const maxAltitude = Math.max(...altitudes);
  const minAltitude = Math.min(...altitudes);
  const avgAltitude = altitudes.reduce((a, b) => a + b, 0) / altitudes.length;
  
  // Calculate geographic coverage
  const coverage = calculateCoverage(currentPositions);
  
  console.log('Stats calculated:', { balloonCount, maxAltitude, minAltitude, avgAltitude, coverage });
}

/**
 * Calculate geographic coverage
 * @param {Array} positions - Balloon positions
 * @returns {string} Coverage description
 */
function calculateCoverage(positions) {
  const hemispheres = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };
  
  positions.forEach(pos => {
    const lat = pos[0];
    const lon = pos[1];
    
    if (lat >= 0) hemispheres.north++;
    else hemispheres.south++;
    
    if (lon >= 0) hemispheres.east++;
    else hemispheres.west++;
  });
  
  const regions = [];
  if (hemispheres.north > 0) regions.push('N');
  if (hemispheres.south > 0) regions.push('S');
  if (hemispheres.east > 0) regions.push('E');
  if (hemispheres.west > 0) regions.push('W');
  
  return regions.length === 4 ? 'Global' : regions.join(', ');
}

/**
 * Show loading state
 */
export function showLoading() {
  console.log('Loading balloon data...');
}

/**
 * Show error message
 * @param {string} message - Error message
 */
export function showError(message) {
  console.error('Error:', message);
}

