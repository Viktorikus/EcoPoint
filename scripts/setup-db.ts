import pool from '../lib/db'
import { initDB } from '../lib/db-init'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

async function main() {
  await initDB()

  const password = await bcrypt.hash('admin123', 10)
  await pool.execute(
    `INSERT IGNORE INTO users (id, name, email, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'Admin EcoPoint', 'admin@ecopoint.com', password, 'ADMIN']
  )
  console.log('Admin created: admin@ecopoint.com / admin123')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
