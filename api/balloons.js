// Vercel Serverless Function to proxy WindBorne balloon data
// This bypasses CORS by fetching from server-side

const https = require('https');

module.exports = async (req, res) => {
  // Enable CORS for our frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the file number from query parameter
  const { file } = req.query;
  
  if (!file) {
    return res.status(400).json({ error: 'Missing file parameter' });
  }

  // Validate file number (00-23)
  const fileNum = parseInt(file);
  if (isNaN(fileNum) || fileNum < 0 || fileNum > 23) {
    return res.status(400).json({ error: 'Invalid file number. Must be 00-23.' });
  }

  const fileNumber = String(fileNum).padStart(2, '0');
  const windborneUrl = `https://a.windbornesystems.com/treasure/${fileNumber}.json`;

  try {
    // Fetch from WindBorne API using native https module
    const data = await new Promise((resolve, reject) => {
      https.get(windborneUrl, (response) => {
        let data = '';
        
        // Check status code
        if (response.statusCode !== 200) {
          reject(new Error(`WindBorne API returned ${response.statusCode}`));
          return;
        }
        
        // Collect data chunks
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        // Parse JSON when complete
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error('Invalid JSON from WindBorne API'));
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    
    // Return the data with CORS headers
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching ${fileNumber}.json:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch balloon data',
      details: error.message 
    });
  }
};

