const { Sequelize } = require("sequelize");
const pg = require("pg");
require("dotenv").config();

let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl?.startsWith("jdbc:postgresql://")) {
  databaseUrl = databaseUrl.replace("jdbc:postgresql://", "postgres://");
}

if (!databaseUrl) {
  const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;

  if (DB_USER && DB_PASS && DB_HOST && DB_PORT && DB_NAME) {
    databaseUrl = `postgres://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  }
}

if (!databaseUrl) {
  console.warn("DATABASE_URL no esta configurada. Las rutas con base de datos fallaran.");
}

const sequelize = new Sequelize(databaseUrl || "postgres://missing:missing@localhost:5432/missing", {
  dialect: "postgres",
  dialectModule: pg,
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
