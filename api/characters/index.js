import { sql } from '../lib/db';
import { authenticate } from '../lib/auth';

export default authenticate(async (req, res) => {
  const user_id = req.user.id;

  if (req.method === 'GET') {
    const characters = await sql('SELECT * FROM characters WHERE user_id = $1', [user_id]);
    return res.json(characters);
  }

  if (req.method === 'POST') {
    const { name, archetype, career } = req.body;
    
    const result = await sql(`
      INSERT INTO characters (user_id, name, archetype, career)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [user_id, name, archetype, career]);

    // Auto-populate basic skills for new character
    await sql(`
      INSERT INTO character_skills (character_id, skill_id, is_known, modifier_level)
      SELECT $1, id, false, 1 FROM skills WHERE tier = 'basic'
    `, [result[0].id]);

    return res.status(201).json(result[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
});