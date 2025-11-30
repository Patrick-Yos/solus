import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM chat_messages WHERE timestamp > NOW() - INTERVAL \'24 hours\' ORDER BY timestamp ASC'
      );
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    const { username, text } = req.body;
    if (!username || !text) {
      return res.status(400).json({ error: 'Missing username or text' });
    }
    
    try {
      const { rows } = await pool.query(
        'INSERT INTO chat_messages (username, text) VALUES ($1, $2) RETURNING *',
        [username, text]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
