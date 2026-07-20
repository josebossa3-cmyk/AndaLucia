const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const ensureDatabase = require("./middlewares/database.middleware");
const requireAdmin = require("./middlewares/auth.middleware");
const publicRoutes = require("./routes/public.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const uploadRoutes = require("./routes/upload.routes");

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
  const publicDir = path.join(__dirname, "..", "public");
  app.use(express.static(publicDir));
  app.get("/admin", (req, res) => res.sendFile(path.join(publicDir, "admin.html")));
  app.get("*", (req, res) => res.sendFile(path.join(publicDir, "index.html")));

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Andalucia Joyeria corriendo en http://localhost:${port}`);
  });
}

module.exports = app;
