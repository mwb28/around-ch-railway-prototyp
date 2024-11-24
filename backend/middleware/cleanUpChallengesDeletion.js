const pool = require("../db/connect");
const queries = require("../db/queries");

const cleanUpChallengesDeletion = async (req, res, next) => {
  try {
    const result = await pool.query(queries.cleanUpChallengesDeletion);

    if (result.rowCount > 0) {
      console.log(
        `${result.rowCount}Intanzen und dazu gehörige Sportliche Leistungen gelöscht.`
      );
    }

    next(); // Weiter zur Route
  } catch (error) {
    console.error("Fehler beim Löschen der Challenges:", error.message);
    res
      .status(500)
      .json({ message: "Interner Serverfehler beim Löschen der Challenges" });
  }
};
module.exports = cleanUpChallengesDeletion;
