const db = require("../config/db");
const { createPurchaseOrder, setPurchaseTotal, getPurchaseOrder, listPurchaseOrders, markPurchaseReceived } =
  require("../models/purchaseOrderModel");
const { addPurchaseItem, listPurchaseItems } = require("../models/purchaseItemModel");
const { addStock } = require("../models/productModel");

function getProductCost(productId, cb) {
  db.get(
    `SELECT cost FROM products WHERE id = ? AND deleted_at IS NULL`,
    [productId],
    (err, row) => {
      if (err) return cb(err);
      if (!row) return cb(new Error("Product not found"));
      const cost = Number(row.cost);
      if (Number.isNaN(cost)) return cb(new Error("Product cost is invalid"));
      cb(null, cost);
    }
  );
}

const create = (req, res) => {
  const { supplier_id, items } = req.body || {};
  if (!supplier_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "supplier_id and items[] required" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    createPurchaseOrder(supplier_id, (err, purchaseId) => {
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
        const priceRaw = it.price;

        if (!product_id || !quantity) {
          failed = true;
          db.run("ROLLBACK");
          return res.status(400).json({ message: "Each item needs product_id and quantity" });
        }

        const finalizeLine = (unitPrice) => {
          if (failed) return;
          if (Number.isNaN(unitPrice) || unitPrice < 0) {
            failed = true;
            db.run("ROLLBACK");
            return res.status(400).json({ message: "Invalid unit price" });
          }

          total += quantity * unitPrice;

          addPurchaseItem(purchaseId, product_id, quantity, unitPrice, (err2) => {
            if (failed) return;
            if (err2) {
              failed = true;
              db.run("ROLLBACK");
              return res.status(500).json({ message: "DB error", err: err2.message });
            }

            remaining -= 1;
            if (remaining === 0) {
              setPurchaseTotal(purchaseId, total, (err3) => {
                if (err3) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ message: "DB error", err: err3.message });
                }
                db.run("COMMIT");
                return res.status(201).json({ message: "Purchase created", id: purchaseId, total_amount: total });
              });
            }
          });
        };

        // If client omits price, default to product cost (source of truth).
        if (priceRaw === undefined || priceRaw === null || priceRaw === "") {
          return getProductCost(product_id, (errCost, cost) => {
            if (failed) return;
            if (errCost) {
              failed = true;
              db.run("ROLLBACK");
              return res.status(400).json({ message: errCost.message });
            }
            finalizeLine(cost);
          });
        }

        finalizeLine(Number(priceRaw));
      });
    });
  });
};

// Receive purchase: increase product.quantity and mark status received
const receive = (req, res) => {
  const purchaseId = req.params.id;

  getPurchaseOrder(purchaseId, (err, po) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!po) return res.status(404).json({ message: "Purchase order not found" });
    if (po.status === "received") return res.status(400).json({ message: "Already received" });

    listPurchaseItems(purchaseId, (err2, items) => {
      if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
      if (!items || items.length === 0) return res.status(400).json({ message: "No items in purchase" });

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        let remaining = items.length;
        let failed = false;

        items.forEach((it) => {
          addStock(it.product_id, it.quantity, (err3) => {
            if (failed) return;
            if (err3) {
              failed = true;
              db.run("ROLLBACK");
              return res.status(500).json({ message: "DB error", err: err3.message });
            }

            remaining -= 1;
            if (remaining === 0) {
              markPurchaseReceived(purchaseId, (err4) => {
                if (err4) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ message: "DB error", err: err4.message });
                }
                db.run("COMMIT");
                return res.json({ message: "Purchase received and inventory updated" });
              });
            }
          });
        });
      });
    });
  });
};

const list = (req, res) => {
  listPurchaseOrders((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.json(rows);
  });
};

const detail = (req, res) => {
  const id = req.params.id;
  getPurchaseOrder(id, (err, po) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!po) return res.status(404).json({ message: "Purchase order not found" });

    listPurchaseItems(id, (err2, items) => {
      if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
      res.json({ ...po, items });
    });
  });
};

module.exports = { create, receive, list, detail };