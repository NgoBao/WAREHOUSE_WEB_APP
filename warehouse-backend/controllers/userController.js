const { listUsers, findById, updateUserRole, deleteUser } = require("../models/userModel");

const getAll = (req, res) => {
  listUsers((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    res.json(rows);
  });
};

const getOne = (req, res) => {
  findById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!row) return res.status(404).json({ message: "User not found" });
    res.json(row);
  });
};

const setRole = (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "role required" });

  updateUserRole(req.params.id, role, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Role updated" });
  });
};

const remove = (req, res) => {
  deleteUser(req.params.id, (err, changes) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!changes) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  });
};

module.exports = { getAll, getOne, setRole, remove };