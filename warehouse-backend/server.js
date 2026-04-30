require("dotenv").config();
require("./config/db"); // connect sqlite
const { runMigrations } = require("./config/migrations");
const db = require("./config/db");
const { seed } = require("./seed");
const { createAllTables } = require("./databaseSchema");
const { buildApp } = require("./app");

function countUsers() {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL`, [], (err, row) => {
      if (err) reject(err);
      else resolve(row.c);
    });
  });
}

createAllTables((schemaErr) => {
  if (schemaErr) {
    console.error("Schema creation failed:", schemaErr.message);
    process.exit(1);
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

    const app = buildApp();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })();
});
