const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Product } = require("../models");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo se permiten imagenes"));
      return;
    }

    cb(null, true);
  },
});

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "andalucia/productos",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "La imagen es requerida" });
  }

  const product = await Product.findByPk(req.body.productId);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Cloudinary no esta configurado" });
  }

  if (product.imagePublicId) {
    await cloudinary.uploader.destroy(product.imagePublicId).catch(() => null);
  }

  const result = await uploadToCloudinary(req.file);
  await product.update({
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
    imageAlt: req.body.imageAlt || product.name,
  });

  res.json({
    id: product.id,
    imageUrl: product.imageUrl,
    imagePublicId: product.imagePublicId,
    imageAlt: product.imageAlt,
  });
});

router.delete("/products/:id/image", async (req, res) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  if (product.imagePublicId) {
    await cloudinary.uploader.destroy(product.imagePublicId).catch(() => null);
  }

  await product.update({ imageUrl: null, imagePublicId: null, imageAlt: null });
  res.json({ success: true });
});

module.exports = router;
