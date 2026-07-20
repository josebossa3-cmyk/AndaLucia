const express = require("express");
const { Category, Product } = require("../models");
const slugify = require("../utils/slugify");

const router = express.Router();

function productPayload(body, currentProduct = {}) {
  return {
    name: body.name ?? currentProduct.name,
    slug: body.name ? slugify(body.name) : currentProduct.slug,
    description: body.description ?? currentProduct.description,
    price: body.price ?? currentProduct.price ?? 0,
    stock: body.stock ?? currentProduct.stock ?? 0,
    material: body.material ?? currentProduct.material,
    imageUrl: body.imageUrl ?? currentProduct.imageUrl,
    imagePublicId: body.imagePublicId ?? currentProduct.imagePublicId,
    imageAlt: body.imageAlt ?? currentProduct.imageAlt,
    isFeatured:
      typeof body.isFeatured === "boolean" ? body.isFeatured : currentProduct.isFeatured ?? false,
    isActive: typeof body.isActive === "boolean" ? body.isActive : currentProduct.isActive ?? true,
    categoryId: body.categoryId ?? currentProduct.categoryId,
  };
}

router.get("/", async (req, res) => {
  const products = await Product.findAll({
    include: [{ model: Category, as: "category", attributes: ["id", "name", "slug"] }],
    order: [["createdAt", "DESC"]],
  });

  res.json(products);
});

router.post("/", async (req, res) => {
  const payload = productPayload(req.body);

  if (!payload.name || !payload.description || !payload.categoryId) {
    return res.status(400).json({ error: "Nombre, descripcion y categoria son requeridos" });
  }

  const category = await Category.findByPk(payload.categoryId);
  if (!category) {
    return res.status(400).json({ error: "Categoria invalida" });
  }

  const product = await Product.create(payload);
  res.status(201).json(product);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    include: [{ model: Category, as: "category", attributes: ["id", "name", "slug"] }],
  });

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

router.put("/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const payload = productPayload(req.body, product);
  await product.update(payload);
  res.json(product);
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  await product.update({ isActive: false });
  res.json({ success: true });
});

module.exports = router;
