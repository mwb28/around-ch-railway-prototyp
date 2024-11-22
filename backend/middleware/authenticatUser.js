const jwt = require("jsonwebtoken");
const pool = require("../db/connect");
const queries = require("../db/queries");

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Nicht autorisiert: Kein Token bereitgestellt" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sportl_id = decoded.id;
    const result = await pool.query(queries.getSchulIdFromSportlId, [
      sportl_id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Nicht autorisiert: Benutzer nicht gefunden" });
    }
    req.user = { sportl_id, schul_id: result.rows[0].schul_id };
    next();
  } catch (error) {
    console.error("Fehler beim Überprüfen des Tokens:", error.message);
    res.status(403).json({ message: "Nicht autorisiert: Ungültiger Token" });
  }
};
module.exports = authenticateUser;
