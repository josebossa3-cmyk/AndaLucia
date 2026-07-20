const { Sequelize } = require("sequelize");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL no esta configurada. Las rutas con base de datos fallaran.");
}

const sequelize = new Sequelize(databaseUrl || "postgres://missing:missing@localhost:5432/missing", {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "production" ? false : false,
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production" || databaseUrl?.includes("sslmode=require")
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX || 2),
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
