const db = require("../config/db");

const createCustomerTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT
    )
  `);
};

const listCustomers = (cb) => {
  db.all(`SELECT * FROM customers ORDER BY id DESC`, [], cb);
};

const getCustomer = (id, cb) => {
  db.get(`SELECT * FROM customers WHERE id = ?`, [id], cb);
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
     WHERE id = ?`,
    [name, phone, email, address, id],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const deleteCustomer = (id, cb) => {
  db.run(`DELETE FROM customers WHERE id = ?`, [id], function (err) {
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