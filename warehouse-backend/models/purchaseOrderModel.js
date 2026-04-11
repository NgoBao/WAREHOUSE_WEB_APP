const db = require("../config/db");

const createPurchaseOrderTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      total_amount REAL DEFAULT 0,
      status TEXT CHECK(status IN ('pending','received')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )
  `);
};

const createPurchaseOrder = (supplier_id, cb) => {
  db.run(
    `INSERT INTO purchase_orders (supplier_id) VALUES (?)`,
    [supplier_id],
    function (err) {
      cb(err, this?.lastID);
    }
  );
};

const setPurchaseTotal = (purchaseId, total, cb) => {
  db.run(
    `UPDATE purchase_orders SET total_amount = ? WHERE id = ?`,
    [total, purchaseId],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

const getPurchaseOrder = (id, cb) => {
  db.get(
    `
    SELECT po.*, s.name AS supplier_name
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.id = ? AND po.deleted_at IS NULL
    `,
    [id],
    cb
  );
};

const listPurchaseOrders = (cb) => {
  db.all(
    `
    SELECT po.*, s.name AS supplier_name
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.deleted_at IS NULL
    ORDER BY po.id DESC
    `,
    [],
    cb
  );
};

const markPurchaseReceived = (id, cb) => {
  db.run(
    `UPDATE purchase_orders SET status = 'received' WHERE id = ?`,
    [id],
    function (err) {
      cb(err, this?.changes);
    }
  );
};

module.exports = {
  createPurchaseOrderTable,
  createPurchaseOrder,
  setPurchaseTotal,
  getPurchaseOrder,
  listPurchaseOrders,
  markPurchaseReceived,
};