import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'ecopoint',
  waitForConnections: true,
  connectionLimit: 10,
});

async function seedAll() {
  try {
    const conn = await pool.getConnection();

    console.log("Cleaning up database...");
    await conn.query('DELETE FROM point_transactions');
    await conn.query('DELETE FROM waste_deposits');
    await conn.query('DELETE FROM pickup_requests');
    await conn.query('DELETE FROM waste_reports');
    await conn.query('DELETE FROM rewards');
    await conn.query('DELETE FROM waste_categories');
    await conn.query('DELETE FROM users');

    console.log("Seeding Waste Categories...");
    const categories = [
      { id: crypto.randomUUID(), name: 'Plastik', point: 20, price: 2000 },
      { id: crypto.randomUUID(), name: 'Kertas', point: 15, price: 1500 },
      { id: crypto.randomUUID(), name: 'Kardus', point: 15, price: 1500 },
      { id: crypto.randomUUID(), name: 'Kaleng', point: 25, price: 3000 },
      { id: crypto.randomUUID(), name: 'Botol Kaca', point: 10, price: 1000 },
    ];
    for (const cat of categories) {
      await conn.query('INSERT INTO waste_categories (id, name, point_per_kg, price_per_kg) VALUES (?, ?, ?, ?)', [cat.id, cat.name, cat.point, cat.price]);
    }

    console.log("Seeding Rewards...");
    const rewards = [
      { id: crypto.randomUUID(), name: 'Pulsa 10K', cat: 'pulsa', point: 100, stock: 50 },
      { id: crypto.randomUUID(), name: 'Pulsa 25K', cat: 'pulsa', point: 250, stock: 30 },
      { id: crypto.randomUUID(), name: 'Voucher Kopi', cat: 'voucher', point: 150, stock: 20 },
      { id: crypto.randomUUID(), name: 'Tumbler', cat: 'merchandise', point: 300, stock: 10 },
      { id: crypto.randomUUID(), name: 'Tote Bag', cat: 'merchandise', point: 200, stock: 15 },
    ];
    for (const rew of rewards) {
      await conn.query('INSERT INTO rewards (id, name, category, point_required, stock) VALUES (?, ?, ?, ?, ?)', [rew.id, rew.name, rew.cat, rew.point, rew.stock]);
    }

    console.log("Seeding Users...");
    const users = [
      { id: crypto.randomUUID(), email: 'admin@ecopoint.com', pass: 'Adm1n@EcoPoint2025', name: 'Super Admin', role: 'ADMIN', points: 0 },
      { id: crypto.randomUUID(), email: 'petugas@ecopoint.com', pass: 'Petugas@EcoPoint2025', name: 'Petugas Utama', role: 'PETUGAS', points: 0 },
      { id: crypto.randomUUID(), email: 'user1@ecopoint.com', pass: 'User1@EcoPoint2025', name: 'Budi Santoso', role: 'USER', points: 0 },
      { id: crypto.randomUUID(), email: 'user2@ecopoint.com', pass: 'User2@EcoPoint2025', name: 'Siti Rahma', role: 'USER', points: 0 },
    ];
    for (const u of users) {
      const hashed = await bcrypt.hash(u.pass, 10);
      await conn.query('INSERT INTO users (id, name, email, password, role, points, level, is_active) VALUES (?, ?, ?, ?, ?, ?, 1, 1)', [u.id, u.name, u.email, hashed, u.role, u.points]);
    }

    const user1 = users[2];
    const user2 = users[3];

    console.log("Seeding Waste Deposits & Transactions...");
    const deposits = [
      { id: crypto.randomUUID(), user_id: user1.id, category_id: categories[0].id, weight: 2.5, point: Math.round(2.5 * categories[0].point), status: 'VERIFIED' },
      { id: crypto.randomUUID(), user_id: user1.id, category_id: categories[1].id, weight: 1.0, point: Math.round(1.0 * categories[1].point), status: 'PENDING' },
      { id: crypto.randomUUID(), user_id: user2.id, category_id: categories[2].id, weight: 5.0, point: Math.round(5.0 * categories[2].point), status: 'VERIFIED' },
      { id: crypto.randomUUID(), user_id: user2.id, category_id: categories[3].id, weight: 0.5, point: Math.round(0.5 * categories[3].point), status: 'REJECTED' },
    ];

    for (const d of deposits) {
      const date = new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000);
      await conn.query('INSERT INTO waste_deposits (id, user_id, category_id, weight, point, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [d.id, d.user_id, d.category_id, d.weight, d.point, d.status, date]);

      if (d.status === 'VERIFIED') {
        await conn.query('UPDATE users SET points = points + ? WHERE id = ?', [d.point, d.user_id]);
        await conn.query('INSERT INTO point_transactions (id, user_id, point_in, point_out, note, created_at) VALUES (?, ?, ?, 0, ?, ?)', [crypto.randomUUID(), d.user_id, d.point, `Verifikasi setoran sampah #${d.id.substring(0, 8)}`, date]);
      }
    }

    console.log("Seeding Pickup Requests...");
    const pickups = [
      { id: crypto.randomUUID(), user_id: user1.id, address: 'Jl. Melati No 12, Jakarta', scheduled_at: new Date(Date.now() + 86400000), status: 'WAITING', notes: 'Pagar warna hitam' },
      { id: crypto.randomUUID(), user_id: user2.id, address: 'Jl. Mawar No 5, Bandung', scheduled_at: new Date(Date.now() - 86400000), status: 'DONE', notes: 'Di depan pos satpam' },
      { id: crypto.randomUUID(), user_id: user1.id, address: 'Jl. Kenanga No 1, Jakarta', scheduled_at: new Date(Date.now() + 172800000), status: 'SCHEDULED', notes: '' },
    ];
    for (const p of pickups) {
      await conn.query('INSERT INTO pickup_requests (id, user_id, address, scheduled_at, status, notes) VALUES (?, ?, ?, ?, ?, ?)', [p.id, p.user_id, p.address, p.scheduled_at, p.status, p.notes]);
    }

    console.log("Seeding Waste Reports...");
    const reports = [
      { id: crypto.randomUUID(), user_id: user1.id, location: 'Taman Kota Sektor B', description: 'Ada tumpukan sampah plastik di dekat bangku taman.', status: 'REPORTED', photo: 'dummy-photo-1.jpg' },
      { id: crypto.randomUUID(), user_id: user2.id, location: 'Sungai Ciliwung Jembatan Merah', description: 'Sampah tersumbat di bawah jembatan, bau menyengat.', status: 'ON_PROGRESS', photo: 'dummy-photo-2.jpg' },
      { id: crypto.randomUUID(), user_id: user1.id, location: 'Jalan Sudirman trotoar', description: 'Banyak botol bekas berserakan.', status: 'COMPLETED', photo: 'dummy-photo-3.jpg' },
    ];
    for (const r of reports) {
      const date = new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000);
      await conn.query('INSERT INTO waste_reports (id, user_id, photo, location, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [r.id, r.user_id, r.photo, r.location, r.description, r.status, date]);
    }

    conn.release();
    console.log("Seed data created successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
  process.exit(0);
}

seedAll();
