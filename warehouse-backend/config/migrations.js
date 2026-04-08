const db = require("./db");

function getColumns(table) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(new Set((rows || []).map((r) => r.name)));
    });
  });
}

function run(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function ensureColumns(table, columnDefs) {
  const cols = await getColumns(table);
  for (const def of columnDefs) {
    const name = def.split(/\s+/)[0];
    if (!cols.has(name)) {
      await run(`ALTER TABLE ${table} ADD COLUMN ${def}`);
    }
  }
}

async function ensureAuditInsertTrigger(table) {
  // SQLite cannot always add columns with CURRENT_TIMESTAMP defaults via ALTER TABLE.
  // This trigger ensures created_at/modified_at are set for inserts across both new and upgraded DBs.
  await run(`
    CREATE TRIGGER IF NOT EXISTS trg_${table}_audit_insert
    AFTER INSERT ON ${table}
    FOR EACH ROW
    WHEN NEW.created_at IS NULL OR NEW.modified_at IS NULL
    BEGIN
      UPDATE ${table}
      SET
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        modified_at = COALESCE(modified_at, CURRENT_TIMESTAMP)
      WHERE rowid = NEW.rowid;
    END;
  `);
}

async function ensureModifiedAtTrigger(table) {
  // Keeps modified_at updated without requiring every UPDATE statement to touch it.
  await run(`
    CREATE TRIGGER IF NOT EXISTS trg_${table}_modified_at
    AFTER UPDATE ON ${table}
    FOR EACH ROW
    WHEN NEW.modified_at = OLD.modified_at
    BEGIN
      UPDATE ${table}
      SET modified_at = CURRENT_TIMESTAMP
      WHERE rowid = NEW.rowid;
    END;
  `);
}

async function runMigrations() {
  // NOTE: tables must exist before we can ALTER them, so call this after create*Table().
  // IMPORTANT: ALTER TABLE ... ADD COLUMN does not allow non-constant defaults (e.g. CURRENT_TIMESTAMP)
  // in many SQLite builds. We add plain DATETIME columns here and rely on triggers/backfill.
  const auditCols = ["created_at DATETIME", "modified_at DATETIME", "deleted_at DATETIME"];

  const tables = [
    "users",
    "suppliers",
    "customers",
    "products",
    "purchase_orders",
    "purchase_items",
    "sales_orders",
    "sales_items",
  ];

  for (const t of tables) {
    await ensureColumns(t, auditCols);
    await ensureAuditInsertTrigger(t);
    await ensureModifiedAtTrigger(t);
    await run(`
      UPDATE ${t}
      SET
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        modified_at = COALESCE(modified_at, CURRENT_TIMESTAMP)
    `);
  }
}

module.exports = { runMigrations };

