import pool from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const [rows] = await pool.execute('SELECT id, email, password, role FROM users WHERE email = ?', ['admin@ecopoint.com']) as any
  const user = Array.isArray(rows) ? rows[0] : rows
  if (!user) {
    console.log('Admin not found')
    process.exit(1)
  }
  console.log('Found user:', { id: user.id, email: user.email, role: user.role })
  const ok = await bcrypt.compare('admin123', user.password)
  console.log('Password match for admin123:', ok)
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
