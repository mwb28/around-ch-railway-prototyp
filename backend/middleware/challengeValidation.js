const pool = require("../db/connect");
const queries = require("../db/queries");

const validateChallengeParticipation = async (req, res, next) => {
  const { sportkl_id, challenge_id } = req.body;

  try {
    const challengeResult = await pool.query(queries.challengeQuery, [
      challenge_id,
    ]);
    const challenge = challengeResult.rows[0];

    if (!challenge) {
      return res.status(404).json({ message: "Challenge nicht gefunden" });
    }

    if (challenge.abgeschlossen) {
      return res
        .status(400)
        .json({ message: "Herausforderung bereits abgeschlossen" });
    }

    if (
      challenge.endzeitpunkt &&
      new Date(challenge.endzeitpunkt) < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Herausforderung bereits abgelaufen" });
    }

    // Prüfen, ob die Klasse bereits teilnimmt
    const existingEntry = await pool.query(queries.checkClassParticipation, [
      sportkl_id,
      challenge_id,
    ]);

    if (existingEntry.rows.length > 0) {
      return res.status(409).json({
        message: "Diese Sportklasse nimmt bereits an der Challenge teil.",
      });
    }

    req.challenge = challenge;
    next();
  } catch (error) {
    console.error("Fehler bei der Challenge-Validierung:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

module.exports = { validateChallengeParticipation };
