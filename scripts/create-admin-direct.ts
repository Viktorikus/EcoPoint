import 'dotenv/config'
import * as mariadb from 'mariadb'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'admin@ecopoint.com'
  const name = 'Admin EcoPoint'
  const password = await bcrypt.hash('admin123', 10)

  const pool = mariadb.createPool(process.env.DATABASE_URL!)
  const conn = await pool.getConnection()
  try {
    const rows = await conn.query('SELECT id FROM `User` WHERE email = ?', [email])
    if (Array.isArray(rows) && rows.length > 0) {
      console.log('Admin already exists:', email)
      return
    }

    await conn.query('INSERT INTO `User` (id, name, email, password, role, createdAt) VALUES (UUID(), ?, ?, ?, ?, NOW())', [
      name,
      email,
      password,
      'ADMIN',
    ])

    console.log('Admin created:', email)
  } finally {
    try {
      await conn.end()
    } catch (_) {}
    try {
      await pool.end()
    } catch (_) {}
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
