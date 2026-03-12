const db = require("../config/db");

const createSupplierTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT
    )
  `);
};

const listSuppliers = (cb) => {
  db.all(`SELECT * FROM suppliers ORDER BY id DESC`, [], cb);
};

const getSupplier = (id, cb) => {
  db.get(`SELECT * FROM suppliers WHERE id = ?`, [id], cb);
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
     WHERE id = ?`,
    [name, phone, email, address, id],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const deleteSupplier = (id, cb) => {
  db.run(`DELETE FROM suppliers WHERE id = ?`, [id], function (err) {
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