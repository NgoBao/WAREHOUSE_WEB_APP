const express = require("express");
const cors = require("cors");

/**
 * Express application (no listen). Used by server.js and integration tests.
 */
function buildApp() {
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

  return app;
}

module.exports = { buildApp };
