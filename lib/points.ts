import { PoolConnection } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

export function calculatePoints(weight: number, pointPerKg: number): number {
  if (weight <= 0 || weight > 1000) {
    throw new Error("Invalid weight. Must be strictly positive and max 1000.");
  }
  if (pointPerKg <= 0) {
    throw new Error("Invalid point per kg. Must be strictly positive.");
  }
  return Math.floor(weight * pointPerKg);
}

export async function addPoints(userId: string, amount: number, note: string, conn: PoolConnection) {
  if (amount <= 0) throw new Error("Amount must be positive");
  
  await conn.execute(`UPDATE users SET points = points + ? WHERE id = ?`, [amount, userId]);
  
  const txId = uuidv4();
  await conn.execute(
    `INSERT INTO point_transactions (id, user_id, point_in, point_out, note, created_at) VALUES (?, ?, ?, 0, ?, NOW())`,
    [txId, userId, amount, note]
  );
}

export async function deductPoints(userId: string, amount: number, note: string, conn: PoolConnection) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const [rows]: any = await conn.execute(`SELECT points FROM users WHERE id = ? FOR UPDATE`, [userId]);
  if (!rows || rows.length === 0) throw new Error("User not found");
  
  const currentPoints = Number(rows[0].points);
  if (currentPoints < amount) {
    throw new Error("Insufficient points");
  }

  await conn.execute(`UPDATE users SET points = points - ? WHERE id = ?`, [amount, userId]);
  
  const txId = uuidv4();
  await conn.execute(
    `INSERT INTO point_transactions (id, user_id, point_in, point_out, note, created_at) VALUES (?, ?, 0, ?, ?, NOW())`,
    [txId, userId, amount, note]
  );
}
