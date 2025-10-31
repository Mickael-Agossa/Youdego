const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class WhatsappModel {
  static async createToken(userId, code) {
    const code_hash = await bcrypt.hash(code, 10);
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const res = await pool.query(
      `INSERT INTO whatsapp_tokens (user_id, code_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, expires_at`,
      [userId, code_hash, expires_at]
    );
    return res.rows[0];
  }

  static async verifyCode(userId, code) {
    const res = await pool.query(
      `SELECT id, code_hash, expires_at FROM whatsapp_tokens
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    const token = res.rows[0];
    if (!token) return { ok: false, reason: 'no_token' };

    const now = new Date();
    if (now > token.expires_at) return { ok: false, reason: 'expired' };

    const valid = await bcrypt.compare(code, token.code_hash);
    if (!valid) return { ok: false, reason: 'invalid' };

    const new_expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      'UPDATE whatsapp_tokens SET last_used_at = NOW(), expires_at = $1 WHERE id = $2',
      [new_expires, token.id]
    );

    return { ok: true, expires_at: new_expires };
  }

  static async revokeTokens(userId) {
    await pool.query('DELETE FROM whatsapp_tokens WHERE user_id = $1', [userId]);
  }
}

module.exports = WhatsappModel;
