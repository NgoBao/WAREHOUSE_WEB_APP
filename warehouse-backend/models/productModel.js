const db = require("../config/db");

const createProductTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      description TEXT,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      quantity INTEGER DEFAULT 0,
      supplier_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    )
  `);
};

const listProducts = (cb) => {
  db.all(
    `
    SELECT p.*, s.name AS supplier_name
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.id DESC
    `,
    [],
    cb
  );
};

const getProduct = (id, cb) => {
  db.get(`SELECT * FROM products WHERE id = ? AND deleted_at IS NULL`, [id], cb);
};

const createProduct = (data, cb) => {
  const {
    name,
    sku = null,
    description = null,
    price,
    cost,
    quantity = 0,
    supplier_id = null,
  } = data;

  db.run(
    `INSERT INTO products (name, sku, description, price, cost, quantity, supplier_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, sku, description, price, cost, quantity, supplier_id],
    function (err) {
      cb(err, this?.lastID);
    }
  );
};

const updateProduct = (id, data, cb) => {
  const {
    name,
    sku = null,
    description = null,
    price,
    cost,
    quantity,
    supplier_id = null,
  } = data;

  db.run(
    `UPDATE products
     SET name = ?, sku = ?, description = ?, price = ?, cost = ?, quantity = ?, supplier_id = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [name, sku, description, price, cost, quantity, supplier_id, id],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const deleteProduct = (id, cb) => {
  db.run(`UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`, [id], function (err) {
    cb(err, this?.changes);
  });
};

const addStock = (productId, qty, cb) => {
  db.run(
    `UPDATE products SET quantity = quantity + ? WHERE id = ? AND deleted_at IS NULL`,
    [qty, productId],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const subtractStockIfEnough = (productId, qty, cb) => {
  db.get(`SELECT quantity FROM products WHERE id = ? AND deleted_at IS NULL`, [productId], (err, row) => {
    if (err) return cb(err);
    if (!row) return cb(new Error("Product not found"));
    if (row.quantity < qty) return cb(new Error("Insufficient stock"));

    db.run(
      `UPDATE products SET quantity = quantity - ? WHERE id = ? AND deleted_at IS NULL`,
      [qty, productId],
      function (err2) {
        cb(err2, this?.changes);
      }
    );
  });
};

module.exports = {
  createProductTable,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addStock,
  subtractStockIfEnough,
};