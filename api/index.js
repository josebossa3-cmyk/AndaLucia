const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const ensureDatabase = require("../server/middlewares/database.middleware");
const requireAdmin = require("../server/middlewares/auth.middleware");
const publicRoutes = require("../server/routes/public.routes");
const authRoutes = require("../server/routes/auth.routes");
const productRoutes = require("../server/routes/product.routes");
const categoryRoutes = require("../server/routes/category.routes");
const uploadRoutes = require("../server/routes/upload.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", ensureDatabase, publicRoutes);
app.use("/api/admin/auth", ensureDatabase, authRoutes);
app.use("/api/admin/products", ensureDatabase, requireAdmin, productRoutes);
app.use("/api/admin/categories", ensureDatabase, requireAdmin, categoryRoutes);
app.use("/api/admin/uploads", ensureDatabase, requireAdmin, uploadRoutes);

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ error: error.message || "Error interno" });
});

if (process.env.VERCEL !== "1") {
  const staticDir = path.join(__dirname, "..");
  app.use(express.static(staticDir));
  app.get("/admin", (req, res) => res.sendFile(path.join(staticDir, "admin.html")));
  app.get("*", (req, res) => res.sendFile(path.join(staticDir, "index.html")));

  const port = Number(process.env.PORT || process.env.SERVER_PORT || 3000);
  app.listen(port, () => {
    console.log(`Andalucia Joyeria corriendo en http://localhost:${port}`);
  });
}

module.exports = app;
