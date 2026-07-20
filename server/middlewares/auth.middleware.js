const jwt = require("jsonwebtoken");
const { AdminUser } = require("../models");

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET no esta configurado" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findOne({
      where: { id: payload.id, isActive: true },
      attributes: ["id", "name", "email", "isActive"],
    });

    if (!admin) {
      return res.status(401).json({ error: "Sesion invalida" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: "Sesion invalida" });
  }
}

module.exports = requireAdmin;
