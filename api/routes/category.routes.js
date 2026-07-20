const express = require("express");
const { Category } = require("../models");
const slugify = require("../utils/slugify");

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await Category.findAll({ order: [["name", "ASC"]] });
  res.json(categories);
});

router.post("/", async (req, res) => {
  const { name, description = "", isActive = true } = req.body;

  if (!name) {
    return res.status(400).json({ error: "El nombre es requerido" });
  }

  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
    isActive,
  });

  res.status(201).json(category);
});

router.put("/:id", async (req, res) => {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({ error: "Categoria no encontrada" });
  }

  const { name, description, isActive } = req.body;
  await category.update({
    name: name ?? category.name,
    slug: name ? slugify(name) : category.slug,
    description: description ?? category.description,
    isActive: typeof isActive === "boolean" ? isActive : category.isActive,
  });

  res.json(category);
});

router.delete("/:id", async (req, res) => {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({ error: "Categoria no encontrada" });
  }

  await category.update({ isActive: false });
  res.json({ success: true });
});

module.exports = router;
