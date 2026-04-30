const db = require("./config/db");
const { createUserTable } = require("./models/userModel");
const { createSupplierTable } = require("./models/supplierModel");
const { createCustomerTable } = require("./models/customerModel");
const { createProductTable } = require("./models/productModel");
const { createPurchaseOrderTable } = require("./models/purchaseOrderModel");
const { createPurchaseItemTable } = require("./models/purchaseItemModel");
const { createSalesOrderTable } = require("./models/salesOrderModel");
const { createSalesItemTable } = require("./models/salesItemModel");

/**
 * Create all tables in order on the shared DB connection.
 * @param {(err?: Error) => void} [callback] — called after all CREATE statements have been queued and executed.
 */
function createAllTables(callback) {
  const done = typeof callback === "function" ? callback : () => {};

  db.serialize(() => {
    createUserTable();
    createSupplierTable();
    createCustomerTable();
    createProductTable();
    createPurchaseOrderTable();
    createPurchaseItemTable();
    createSalesOrderTable();
    createSalesItemTable();
    db.run("SELECT 1 AS _schema_ready", (err) => done(err));
  });
}

/** @returns {Promise<void>} */
function createAllTablesAsync() {
  return new Promise((resolve, reject) => {
    createAllTables((err) => (err ? reject(err) : resolve()));
  });
}

module.exports = { createAllTables, createAllTablesAsync };
