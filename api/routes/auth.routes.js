const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AdminUser } = require("../models");
const requireAdmin = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son requeridos" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET no esta configurado" });
  }

  const admin = await AdminUser.findOne({ where: { email, isActive: true } });

  if (!admin) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  res.json({
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json(req.admin);
});

module.exports = router;
