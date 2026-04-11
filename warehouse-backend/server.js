require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db"); // connect sqlite
const { runMigrations } = require("./config/migrations");
const db = require("./config/db");
const { seed } = require("./seed");

// Create tables
const { createUserTable } = require("./models/userModel");
const { createSupplierTable } = require("./models/supplierModel");
const { createCustomerTable } = require("./models/customerModel");
const { createProductTable } = require("./models/productModel");
const { createPurchaseOrderTable } = require("./models/purchaseOrderModel");
const { createPurchaseItemTable } = require("./models/purchaseItemModel");
const { createSalesOrderTable } = require("./models/salesOrderModel");
const { createSalesItemTable } = require("./models/salesItemModel");

createUserTable();
createSupplierTable();
createCustomerTable();
createProductTable();
createPurchaseOrderTable();
createPurchaseItemTable();
createSalesOrderTable();
createSalesItemTable();

function countUsers() {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL`, [], (err, row) => {
      if (err) reject(err);
      else resolve(row.c);
    });
  });
}

(async function start() {
  try {
    await runMigrations();
  } catch (err) {
    console.error("DB migrations failed:", err.message);
  }

  try {
    const n = await countUsers();
    if (n === 0) {
      console.log("No users found — seeding demo data (admin@test.com / 123456)…");
      await seed();
    }
  } catch (err) {
    console.error("Auto-seed failed:", err.message);
    process.exit(1);
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => res.send("Warehouse API Running..."));

  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/suppliers", require("./routes/supplierRoutes"));
  app.use("/api/customers", require("./routes/customerRoutes"));
  app.use("/api/products", require("./routes/productRoutes"));
  app.use("/api/purchases", require("./routes/purchaseRoutes"));
  app.use("/api/sales", require("./routes/salesRoutes"));
  app.use("/api/dashboard", require("./routes/dashboardRoutes"));

  app.use((req, res) => res.status(404).json({ message: "Not found" }));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
