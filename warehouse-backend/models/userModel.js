const db = require("../config/db");

const createUserTable = () => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','staff')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const findByEmail = (email, cb) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], cb);
};

const findById = (id, cb) => {
    db.get(
        `SELECT id, name, email, role, created_at FROM users WHERE id = ?`,
        [id],
        cb
    );
};

const listUsers = (cb) => {
    db.all(
        `SELECT id, name, email, role, created_at FROM users ORDER BY id DESC`,
        [],
        cb
    );
};

const insertUser = (name, email, hashedPassword, role, cb) => {
    db.run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, role],
        function (err) {
            cb(err, this?.lastID);
        }
    );
};

const updateUserRole = (id, role, cb) => {
    db.run(
        `UPDATE users SET role = ? WHERE id = ?`,
        [role, id],
        function (err) {
            cb(err, this?.changes);
        }
    );
};

const deleteUser = (id, cb) => {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
        cb(err, this?.changes);
    });
};

module.exports = {
    createUserTable,
    findByEmail,
    findById,
    listUsers,
    insertUser,
    updateUserRole,
    deleteUser,
};