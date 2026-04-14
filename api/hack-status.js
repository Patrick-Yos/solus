const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT active FROM config_data WHERE id = 1`;
      return res.json({ active: rows.length > 0 ? rows[0].active : false });
    } catch {
      return res.json({ active: false });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
