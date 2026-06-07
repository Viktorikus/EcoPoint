import pool from '../lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

async function main() {
  const password = await bcrypt.hash('admin123', 10)
  await pool.execute(
    `INSERT IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'Admin EcoPoint', 'admin@ecopoint.com', password, 'ADMIN']
  )
  console.log('Admin created: admin@ecopoint.com')
}

main().catch(async (e) => {
  console.error(e)
  try {
    await pool.end()
  } catch (_) {}
  process.exit(1)
})
