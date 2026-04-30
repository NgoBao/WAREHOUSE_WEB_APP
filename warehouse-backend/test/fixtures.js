const bcrypt = require("bcryptjs");
const db = require("../config/db");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Minimal rows for API integration tests (fast; not the full demo seed).
 * Password for both users: password123
 */
async function insertMinimalFixtures() {
  const hash = await bcrypt.hash("password123", 4);

  await run(`DELETE FROM sales_items`);
  await run(`DELETE FROM sales_orders`);
  await run(`DELETE FROM purchase_items`);
  await run(`DELETE FROM purchase_orders`);
  await run(`DELETE FROM products`);
  await run(`DELETE FROM customers`);
  await run(`DELETE FROM suppliers`);
  await run(`DELETE FROM users`);

  await run(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ["Admin User", "admin@test.com", hash, "admin"]
  );
  await run(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ["Staff User", "staff@test.com", hash, "staff"]
  );

  await run(`INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)`, [
    "Fixture Supplier",
    "4045550100",
    "supplier-fixture@test.com",
    "Test City",
  ]);

  await run(`INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`, [
    "Fixture Customer",
    "6785550100",
    "customer-fixture@test.com",
    "Test Addr",
  ]);

  await run(
    `INSERT INTO products (name, sku, description, price, cost, quantity, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ["Fixture Product", "FIX-001", "For automated tests", 99.99, 50.0, 5, 1]
  );
}

module.exports = { insertMinimalFixtures };