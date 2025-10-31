const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
  static async createUser({
    fullname,
    email,
    phone,
    password,
    role = null,
    vehicle_plate = null,
    id_document_type = null,
    id_document_number = null,
    id_document_url = null,
    profile_photo_url = null,
    registration_status = 'pending'
  }) {
    const hashed = await bcrypt.hash(password, 10);
    const res = await pool.query(
      `INSERT INTO users 
       (fullname, email, phone, password, role, vehicle_plate, id_document_type, id_document_number, id_document_url, profile_photo_url, registration_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, fullname, email, phone, role, created_at, registration_status`,
      [
        fullname,
        email,
        phone,
        hashed,
        role,
        vehicle_plate,
        id_document_type,
        id_document_number,
        id_document_url,
        profile_photo_url,
        registration_status
      ]
    );
    return res.rows[0];
  }

  static async findByPhone(phone) {
    const res = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    return res.rows[0];
  }

  static async findByEmail(email) {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  static async findById(id) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async listLivreurs() {
    const res = await pool.query("SELECT id, fullname, phone, email, registration_status FROM users WHERE role='livreur'");
    return res.rows;
  }

  static async setWhatsappVerified(userId, value = true) {
    const res = await pool.query(
      'UPDATE users SET is_whatsapp_verified = $1 WHERE id = $2 RETURNING id, is_whatsapp_verified',
      [value, userId]
    );
    return res.rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);
    return { id: userId };
  }
}

module.exports = UserModel;
