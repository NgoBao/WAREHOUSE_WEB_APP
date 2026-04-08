require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db"); // connect sqlite
const { runMigrations } = require("./config/migrations");

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

// Add/upgrade audit columns + triggers (for existing DBs)
runMigrations().catch((err) => {
  console.error("DB migrations failed:", err.message);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Warehouse API Running..."));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// 404
app.use((req, res) => res.status(404).json({ message: "Not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));