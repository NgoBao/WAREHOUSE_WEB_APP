const db = require("../config/db");

const createSalesOrderTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      total_amount REAL DEFAULT 0,
      status TEXT CHECK(status IN ('pending','completed')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
};

const createSalesOrder = (customer_id, cb) => {
  db.run(
    `INSERT INTO sales_orders (customer_id) VALUES (?)`,
    [customer_id],
    function (err) {
      cb(err, this?.lastID);
    }
  );
};

const setSalesTotal = (salesId, total, cb) => {
  db.run(
    `UPDATE sales_orders SET total_amount = ? WHERE id = ?`,
    [total, salesId],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const getSalesOrder = (id, cb) => {
  db.get(
    `
    SELECT so.*, c.name AS customer_name
    FROM sales_orders so
    JOIN customers c ON so.customer_id = c.id
    WHERE so.id = ? AND so.deleted_at IS NULL
    `,
    [id],
    cb
  );
};

const listSalesOrders = (cb) => {
  db.all(
    `
    SELECT so.*, c.name AS customer_name
    FROM sales_orders so
    JOIN customers c ON so.customer_id = c.id
    WHERE so.deleted_at IS NULL
    ORDER BY so.id DESC
    `,
    [],
    cb
  );
};

const markSalesCompleted = (id, cb) => {
  db.run(
    `UPDATE sales_orders SET status = 'completed' WHERE id = ?`,
    [id],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

module.exports = {
  createSalesOrderTable,
  createSalesOrder,
  setSalesTotal,
  getSalesOrder,
  listSalesOrders,
  markSalesCompleted,
};