const db = require("../config/db");

const createSalesItemTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sales_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (sales_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
};

const addSalesItem = (sales_id, product_id, quantity, price, cb) => {
  db.run(
    `INSERT INTO sales_items (sales_id, product_id, quantity, price)
     VALUES (?, ?, ?, ?)`,
    [sales_id, product_id, quantity, price],
    function (err) {
      cb(err, this?.lastID);
    }
  );
};

const listSalesItems = (sales_id, cb) => {
  db.all(
    `
    SELECT si.*, p.name AS product_name
    FROM sales_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.sales_id = ? AND si.deleted_at IS NULL
    ORDER BY si.id
    `,
    [sales_id],
    cb
  );
};

module.exports = {
  createSalesItemTable,
  addSalesItem,
  listSalesItems,
};