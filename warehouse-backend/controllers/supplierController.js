const {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../models/supplierModel");

const getAll = (req, res) => {
  listSuppliers((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.json(rows);
  });
};

const getOne = (req, res) => {
  getSupplier(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!row) return res.status(404).json({ message: "Supplier not found" });
    res.json(row);
  });
};

const create = (req, res) => {
  if (!req.body?.name) return res.status(400).json({ message: "name required" });
  createSupplier(req.body, (err, id) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.status(201).json({ message: "Supplier created", id });
  });
};

const update = (req, res) => {
  if (!req.body?.name) return res.status(400).json({ message: "name required" });
  updateSupplier(req.params.id, req.body, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier updated" });
  });
};

const remove = (req, res) => {
  deleteSupplier(req.params.id, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier deleted" });
  });
};

module.exports = { getAll, getOne, create, update, remove };