const db = require("../config/db");
const { createSalesOrder, setSalesTotal, getSalesOrder, listSalesOrders, markSalesCompleted } =
  require("../models/salesOrderModel");
const { addSalesItem, listSalesItems } = require("../models/salesItemModel");
const { subtractStockIfEnough } = require("../models/productModel");

const create = (req, res) => {
  const { customer_id, items } = req.body || {};
  if (!customer_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "customer_id and items[] required" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    createSalesOrder(customer_id, (err, salesId) => {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ message: "DB error", err: err.message });
      }

      let total = 0;
      let remaining = items.length;
      let failed = false;

      items.forEach((it) => {
        const product_id = it.product_id;
        const quantity = Number(it.quantity);
        const price = Number(it.price);

        if (!product_id || !quantity || !price) {
          failed = true;
          db.run("ROLLBACK");
          return res.status(400).json({ message: "Each item needs product_id, quantity, price" });
        }

        total += quantity * price;

        addSalesItem(salesId, product_id, quantity, price, (err2) => {
          if (failed) return;
          if (err2) {
            failed = true;
            db.run("ROLLBACK");
            return res.status(500).json({ message: "DB error", err: err2.message });
          }

          remaining -= 1;
          if (remaining === 0) {
            setSalesTotal(salesId, total, (err3) => {
              if (err3) {
                db.run("ROLLBACK");
                return res.status(500).json({ message: "DB error", err: err3.message });
              }
              db.run("COMMIT");
              return res.status(201).json({ message: "Sales order created", id: salesId, total_amount: total });
            });
          }
        });
      });
    });
  });
};

// Complete sale: subtract inventory if enough and mark completed
const complete = (req, res) => {
  const salesId = req.params.id;

  getSalesOrder(salesId, (err, so) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!so) return res.status(404).json({ message: "Sales order not found" });
    if (so.status === "completed") return res.status(400).json({ message: "Already completed" });

    listSalesItems(salesId, (err2, items) => {
      if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
      if (!items || items.length === 0) return res.status(400).json({ message: "No items in sale" });

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        let remaining = items.length;
        let failed = false;

        items.forEach((it) => {
          subtractStockIfEnough(it.product_id, it.quantity, (err3) => {
            if (failed) return;

            if (err3) {
              failed = true;
              db.run("ROLLBACK");
              return res.status(400).json({ message: err3.message });
            }

            remaining -= 1;
            if (remaining === 0) {
              markSalesCompleted(salesId, (err4) => {
                if (err4) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ message: "DB error", err: err4.message });
                }
                db.run("COMMIT");
                return res.json({ message: "Sale completed and inventory updated" });
              });
            }
          });
        });
      });
    });
  });
};

const list = (req, res) => {
  listSalesOrders((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.json(rows);
  });
};

const detail = (req, res) => {
  const id = req.params.id;
  getSalesOrder(id, (err, so) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!so) return res.status(404).json({ message: "Sales order not found" });

    listSalesItems(id, (err2, items) => {
      if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
      res.json({ ...so, items });
    });
  });
};

module.exports = { create, complete, list, detail };