const bcrypt = require("bcryptjs");
const {
  listUsers,
  findById,
  findByEmail,
  insertUser,
  updateUserRole,
  deleteUser,
  countActiveAdmins,
} = require("../models/userModel");

const ALLOWED_ROLES = new Set(["admin", "staff"]);

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

const create = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  findByEmail(email, async (err, existing) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    insertUser(name, email, hashed, "staff", (err2, id) => {
      if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
      findById(id, (err3, user) => {
        if (err3) return res.status(500).json({ message: "DB error", err: err3.message });
        return res.status(201).json({ message: "Staff user created", user });
      });
    });
  });
};

const setRole = (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "role required" });
  if (!ALLOWED_ROLES.has(role)) return res.status(400).json({ message: "Invalid role" });

  findById(req.params.id, (err, target) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!target) return res.status(404).json({ message: "User not found" });

    const demotingLastAdmin = target.role === "admin" && role !== "admin";

    const apply = () => {
      updateUserRole(req.params.id, role, (err3, changes) => {
        if (err3) return res.status(500).json({ message: "DB error", err: err3.message });
        if (!changes) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Role updated" });
      });
    };

    if (demotingLastAdmin) {
      return countActiveAdmins((err2, n) => {
        if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
        if (n <= 1) return res.status(400).json({ message: "Cannot demote the last admin" });
        apply();
      });
    }

    apply();
  });
};

const remove = (req, res) => {
  const id = String(req.params.id);
  if (id === String(req.user.id)) return res.status(400).json({ message: "Cannot delete your own account" });

  findById(id, (err, target) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.role === "admin") {
      return countActiveAdmins((err2, n) => {
        if (err2) return res.status(500).json({ message: "DB error", err: err2.message });
        if (n <= 1) return res.status(400).json({ message: "Cannot delete the last admin" });
        deleteUser(id, (err3, changes) => {
          if (err3) return res.status(500).json({ message: "DB error", err: err3.message });
          if (!changes) return res.status(404).json({ message: "User not found" });
          res.json({ message: "User deleted" });
        });
      });
    }

    deleteUser(id, (err3, changes) => {
      if (err3) return res.status(500).json({ message: "DB error", err: err3.message });
      if (!changes) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted" });
    });
  });
};

module.exports = { getAll, getOne, create, setRole, remove };
