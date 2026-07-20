const bcrypt = require("bcryptjs");
require("dotenv").config();

const { AdminUser, initializeDatabase, sequelize } = require("../models");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD son requeridos");
  }

  await initializeDatabase();
  await sequelize.sync({ alter: true });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const [admin, created] = await AdminUser.findOrCreate({
    where: { email: ADMIN_EMAIL },
    defaults: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      isActive: true,
    },
  });

  if (!created) {
    await admin.update({ name: ADMIN_NAME, passwordHash, isActive: true });
  }

  console.log(created ? "Admin creado correctamente." : "Admin actualizado correctamente.");
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close().catch(() => null);
  });
