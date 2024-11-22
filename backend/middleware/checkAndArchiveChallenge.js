const pool = require("../db/connect");
const queries = require("../db/queries");

const checkChallengeAndArchive = async (req, res, next) => {
  try {
    const result = await pool.query(queries.checkAndArchiveChallenge);

    if (result.rowCount > 0) {
      console.log(`${result.rowCount} Challenges archiviert.`);
    }

    next(); // Weiter zur Route
  } catch (error) {
    console.error("Fehler beim Überprüfen des Endzeitpunkts:", error.message);
    res
      .status(500)
      .json({ message: "Interner Serverfehler bei der Endzeitprüfung" });
  }
};

module.exports = checkChallengeAndArchive;
