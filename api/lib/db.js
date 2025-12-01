import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_URL, {
  ssl: true,
  fetch_options: { cache: 'no-store' }
});

export { sql };