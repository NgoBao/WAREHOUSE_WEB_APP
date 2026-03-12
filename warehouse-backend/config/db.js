const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./warehouse.db", (err) => {
  if (err) console.error("SQLite connect error:", err.message);
  else console.log("Connected to SQLite database (warehouse.db)");
});

// Helpful: enforce foreign keys in SQLite
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

module.exports = db;