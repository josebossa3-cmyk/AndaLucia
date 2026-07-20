const express = require("express");
const { Category, Product } = require("../models");

const router = express.Router();

router.get("/health", async (req, res) => {
  res.json({ status: "ok" });
});

router.get("/products", async (req, res) => {
  const where = { isActive: true };

  if (req.query.featured === "true") {
    where.isFeatured = true;
  }

  const products = await Product.findAll({
    where,
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "slug"],
        where: req.query.category
          ? { slug: req.query.category, isActive: true }
          : { isActive: true },
      },
    ],
    order: [
      ["isFeatured", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

  res.json(products);
});

router.get("/products/:slug", async (req, res) => {
  const product = await Product.findOne({
    where: { slug: req.params.slug, isActive: true },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "slug"],
        where: { isActive: true },
      },
    ],
  });

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

router.get("/categories", async (req, res) => {
  const categories = await Category.findAll({
    where: { isActive: true },
    order: [["name", "ASC"]],
  });

  res.json(categories);
});

module.exports = router;
