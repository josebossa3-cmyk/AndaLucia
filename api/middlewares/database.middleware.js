const { initializeDatabase } = require("../models");

let databaseReadyPromise;

async function ensureDatabase(req, res, next) {
  try {
    if (!databaseReadyPromise) {
      databaseReadyPromise = initializeDatabase();
    }

    await databaseReadyPromise;
    next();
  } catch (error) {
    databaseReadyPromise = undefined;
    res.status(500).json({ error: error.message || "Error de base de datos" });
  }
}

module.exports = ensureDatabase;
