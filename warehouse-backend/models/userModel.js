const db = require("../config/db");

const createUserTable = () => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','staff')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    )
  `);
};

const findByEmail = (email, cb) => {
    db.get(`SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`, [email], cb);
};

const findById = (id, cb) => {
    db.get(
        `SELECT id, name, email, role, created_at, modified_at FROM users WHERE id = ? AND deleted_at IS NULL`,
        [id],
        cb
    );
};

const listUsers = (cb) => {
    db.all(
        `SELECT id, name, email, role, created_at, modified_at FROM users WHERE deleted_at IS NULL ORDER BY id DESC`,
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
        `UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL`,
        [role, id],
        function (err) {
            cb(err, this?.changes);
        }
    );
};

const countActiveAdmins = (cb) => {
    db.get(
        `SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND deleted_at IS NULL`,
        [],
        (err, row) => {
            cb(err, row?.c ?? 0);
        }
    );
};

const deleteUser = (id, cb) => {
    db.run(`UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`, [id], function (err) {
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
    countActiveAdmins,
};