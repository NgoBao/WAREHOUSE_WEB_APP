const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../models/customerModel");

const getAll = (req, res) => {
  listCustomers((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.json(rows);
  });
};

const getOne = (req, res) => {
  getCustomer(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!row) return res.status(404).json({ message: "Customer not found" });
    res.json(row);
  });
};

const create = (req, res) => {
  if (!req.body?.name) return res.status(400).json({ message: "name required" });
  createCustomer(req.body, (err, id) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.status(201).json({ message: "Customer created", id });
  });
};

const update = (req, res) => {
  if (!req.body?.name) return res.status(400).json({ message: "name required" });
  updateCustomer(req.params.id, req.body, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer updated" });
  });
};

const remove = (req, res) => {
  deleteCustomer(req.params.id, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted" });
  });
};

module.exports = { getAll, getOne, create, update, remove };