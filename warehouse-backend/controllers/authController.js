const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  findByEmail,
  insertUser,
  findById,
} = require("../models/userModel");

const register = (req, res) => {
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
        return res.status(201).json({ message: "User registered", user });
      });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  findByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ message: "DB error", err: err.message });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
};

const logout = (req, res) => {
  return res.json({ message: "Logged out please take off the token on the client side" });
}


module.exports = { register, login, logout };