const db = require("../config/db");

const createPurchaseItemTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (purchase_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
};

const addPurchaseItem = (purchase_id, product_id, quantity, price, cb) => {
  db.run(
    `INSERT INTO purchase_items (purchase_id, product_id, quantity, price)
     VALUES (?, ?, ?, ?)`,
    [purchase_id, product_id, quantity, price],
    function (err) {
      cb(err, this?.lastID);
    }
  );
};

const listPurchaseItems = (purchase_id, cb) => {
  db.all(
    `
    SELECT pi.*, p.name AS product_name
    FROM purchase_items pi
    JOIN products p ON pi.product_id = p.id
    WHERE pi.purchase_id = ? AND pi.deleted_at IS NULL
    ORDER BY pi.id
    `,
    [purchase_id],
    cb
  );
};

module.exports = {
  createPurchaseItemTable,
  addPurchaseItem,
  listPurchaseItems,
};