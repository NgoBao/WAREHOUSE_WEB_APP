const db = require("../config/db");

/** Counts + low stock for staff (no revenue aggregates). */
const staffSummary = (req, res) => {
  const result = {};

  db.get(`SELECT COUNT(*) AS totalProducts FROM products`, [], (err, row) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    result.totalProducts = row.totalProducts;

    db.get(
      `SELECT COUNT(*) AS pendingPurchases FROM purchase_orders WHERE status='pending' AND deleted_at IS NULL`,
      [],
      (err2, row2) => {
        if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
        result.pendingPurchases = row2.pendingPurchases;

        db.get(
          `SELECT COUNT(*) AS pendingSales FROM sales_orders WHERE status='pending' AND deleted_at IS NULL`,
          [],
          (err3, row3) => {
            if (err3) return res.status(500).json({ message: "DB error", err: err3.message });
            result.pendingSales = row3.pendingSales;

            db.all(
              `SELECT id, name, sku, quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC LIMIT 10`,
              [],
              (err4, rows4) => {
                if (err4) return res.status(500).json({ message: "DB error", err: err4.message });
                result.lowStock = rows4;
                res.json(result);
              }
            );
          }
        );
      }
    );
  });
};

const summary = (req, res) => {
  const result = {};

  db.get(`SELECT COUNT(*) AS totalProducts FROM products`, [], (err, row) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    result.totalProducts = row.totalProducts;

    db.get(`SELECT COUNT(*) AS totalSuppliers FROM suppliers`, [], (err2, row2) => {
      if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
      result.totalSuppliers = row2.totalSuppliers;

      db.get(`SELECT COUNT(*) AS totalCustomers FROM customers`, [], (err3, row3) => {
        if (err3) return res.status(500).json({ message: "DB error", err: err3.message });
        result.totalCustomers = row3.totalCustomers;

        db.get(`SELECT IFNULL(SUM(total_amount),0) AS totalSales FROM sales_orders WHERE status='completed'`, [], (err4, row4) => {
          if (err4) return res.status(500).json({ message: "DB error", err: err4.message });
          result.totalSales = row4.totalSales;

          db.all(`SELECT id, name, sku, quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC LIMIT 10`, [], (err5, rows5) => {
            if (err5) return res.status(500).json({ message: "DB error", err: err5.message });
            result.lowStock = rows5;

            res.json(result);
          });
        });
      });
    });
  });
};

module.exports = { summary, staffSummary };