const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class PasswordResetModel {
  static async createToken(userId, code, ttlMinutes = 15) {
    const hash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const res = await pool.query(
      `INSERT INTO password_reset_tokens (user_id, code_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, expires_at, created_at`,
      [userId, hash, expiresAt]
    );
    return res.rows[0];
  }

  static async revokeTokens(userId) {
    await pool.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId]
    );
  }

  static async verifyCode(userId, code) {
    const res = await pool.query(
      `SELECT id, code_hash, expires_at
       FROM password_reset_tokens
       WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    const row = res.rows[0];
    if (!row) return { ok: false };

    const ok = await bcrypt.compare(code, row.code_hash);
    if (!ok) return { ok: false };

    await pool.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [row.id]
    );

    return { ok: true, expires_at: row.expires_at };
  }
}

module.exports = PasswordResetModel;
