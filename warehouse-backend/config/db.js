const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbFile = process.env.WAREHOUSE_DB_PATH || path.join(__dirname, "..", "warehouse.db");
const isMemory = dbFile === ":memory:";
const quiet = process.env.NODE_ENV === "test" || isMemory;

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error("SQLite connect error:", err.message);
  else if (!quiet) console.log(`Connected to SQLite database (${isMemory ? ":memory:" : dbFile})`);
});

// Helpful: enforce foreign keys in SQLite
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

module.exports = db;
