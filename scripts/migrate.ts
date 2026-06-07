import pool from '../lib/db'

async function migrate() {
  try {
    await pool.execute(`ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1`)
    console.log('Migration done')
  } catch (err: any) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column is_active already exists, skipping migration.')
    } else {
      console.error(err)
    }
  }
  process.exit(0)
}
migrate()
