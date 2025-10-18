const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const { number } = body;

    if (!number) {
      return res.status(400).json({ error: 'Number is required' });
    }

    if (!/^\d{10}$/.test(number)) {
      return res.status(400).json({ error: 'Invalid number format. Must be 10 digits.' });
    }

    const checkQuery = 'SELECT * FROM protected_numbers WHERE number = $1';
    const checkResult = await pool.query(checkQuery, [number]);

    if (checkResult.rows.length > 0) {
      return res.json({ 
        success: true, 
        message: 'This number is already protected!',
        alreadyProtected: true
      });
    }

    const insertQuery = 'INSERT INTO protected_numbers (number, protected_at, status) VALUES ($1, NOW(), $2) RETURNING *';
    const insertResult = await pool.query(insertQuery, [number, 'protected']);

    res.json({ 
      success: true, 
      message: 'Number successfully protected!',
      data: insertResult.rows[0]
    });

  } catch (error) {
    console.error('Protect API Error:', error);
    res.status(500).json({ error: 'Failed to protect number. Please try again.' });
  }
};
