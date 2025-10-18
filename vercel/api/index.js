const https = require('https');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { number } = req.query;

    if (!number) {
      return res.status(400).json({ error: 'Number parameter required' });
    }

    if (!/^\d{10}$/.test(number)) {
      return res.status(400).json({ error: 'Invalid number format' });
    }

    const protectedQuery = 'SELECT * FROM protected_numbers WHERE number = $1';
    const protectedResult = await pool.query(protectedQuery, [number]);

    if (protectedResult.rows.length > 0) {
      return res.json({
        protected: true,
        message: 'This number is protected',
        mobile: number,
        name: 'Protected',
        status: 'This number is protected and cannot be searched'
      });
    }

    const apiUrl = `https://decryptkarnrwalebkl.wasmer.app/?key=lodalelobaby&term=${number}`;

    const data = await new Promise((resolve, reject) => {
      https.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (parseError) {
            reject(new Error('Invalid JSON response from external API'));
          }
        });
      }).on('error', (error) => {
        reject(new Error('API unavailable'));
      });
    });

    res.json(data);

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
