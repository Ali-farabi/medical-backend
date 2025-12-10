const pool = require("../config/db");

class User {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create({ email, password, name, role = "user", avatar = null }) {
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, avatar) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [email, password, name, role, avatar]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query(
      "SELECT id, email, name, role, avatar, created_at FROM users ORDER BY created_at DESC"
    );
    return result.rows;
  }

  static async update(id, { name, avatar }) {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($2, name), 
           avatar = COALESCE($3, avatar)
       WHERE id = $1 
       RETURNING *`,
      [id, name, avatar]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = User;
