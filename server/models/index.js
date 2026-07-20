const sequelize = require("../config/database");
const AdminUser = require("./AdminUser");
const Category = require("./Category");
const Product = require("./Product");

Category.hasMany(Product, {
  as: "products",
  foreignKey: { name: "categoryId", allowNull: false },
});

Product.belongsTo(Category, {
  as: "category",
  foreignKey: { name: "categoryId", allowNull: false },
});

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no esta configurada");
  }

  await sequelize.authenticate();

  if (process.env.DB_SYNC === "true") {
    // Solo crea las tablas que falten. Si ya existen, no modifica nada.
    await sequelize.sync();
  }
}

module.exports = {
  sequelize,
  AdminUser,
  Category,
  Product,
  initializeDatabase,
};
