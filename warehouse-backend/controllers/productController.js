const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../models/productModel");

const getAll = (req, res) => {
  listProducts((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.json(rows);
  });
};

const getOne = (req, res) => {
  getProduct(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!row) return res.status(404).json({ message: "Product not found" });
    res.json(row);
  });
};

const create = (req, res) => {
  const { name, price, cost } = req.body || {};
  if (!name || price == null || cost == null) {
    return res.status(400).json({ message: "name, price, cost required" });
  }
  createProduct(req.body, (err, id) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.status(201).json({ message: "Product created", id });
  });
};

const update = (req, res) => {
  const { name, price, cost } = req.body || {};
  if (!name || price == null || cost == null) {
    return res.status(400).json({ message: "name, price, cost required" });
  }
  updateProduct(req.params.id, req.body, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated" });
  });
};

const remove = (req, res) => {
  deleteProduct(req.params.id, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  });
};

module.exports = { getAll, getOne, create, update, remove };