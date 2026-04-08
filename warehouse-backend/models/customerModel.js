const db = require("../config/db");

const createCustomerTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
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

const listCustomers = (cb) => {
  db.all(`SELECT * FROM customers WHERE deleted_at IS NULL ORDER BY id DESC`, [], cb);
};

const getCustomer = (id, cb) => {
  db.get(`SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL`, [id], cb);
};

const createCustomer = (data, cb) => {
  const { name, phone = null, email = null, address = null } = data;

  db.run(
    `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
    [name, phone, email, address],
    function (err) {
      cb(err, this?.lastID);
    }
  );
};

const updateCustomer = (id, data, cb) => {
  const { name, phone = null, email = null, address = null } = data;

  db.run(
    `UPDATE customers
     SET name = ?, phone = ?, email = ?, address = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [name, phone, email, address, id],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const deleteCustomer = (id, cb) => {
  db.run(`UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`, [id], function (err) {
    cb(err, this?.changes);
  });
};

module.exports = {
  createCustomerTable,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};