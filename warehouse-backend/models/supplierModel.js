const db = require("../config/db");

const createSupplierTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    )
  `);
};

const listSuppliers = (cb) => {
  db.all(`SELECT * FROM suppliers WHERE deleted_at IS NULL ORDER BY id DESC`, [], cb);
};

const getSupplier = (id, cb) => {
  db.get(`SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL`, [id], cb);
};

const createSupplier = (data, cb) => {
  const { name, phone = null, email = null, address = null } = data;

  db.run(
    `INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
    [name, phone, email, address],
    function (err) {
      cb(err, this?.lastID);
    }
  );
};

const updateSupplier = (id, data, cb) => {
  const { name, phone = null, email = null, address = null } = data;

  db.run(
    `UPDATE suppliers
     SET name = ?, phone = ?, email = ?, address = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [name, phone, email, address, id],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const deleteSupplier = (id, cb) => {
  db.run(`UPDATE suppliers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`, [id], function (err) {
    cb(err, this?.changes);
  });
};

module.exports = {
  createSupplierTable,
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};