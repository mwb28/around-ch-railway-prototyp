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

    // Abfrage, um die Schul-ID und die Rolle des Benutzers zu erhalten
    const result = await pool.query(queries.getSchulIdAndRoleFromSportlId, [
      sportl_id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Nicht autorisiert: Benutzer nicht gefunden" });
    }

    const { schul_id, userrole } = result.rows[0];

    // Benutzerinformationen im Request speichern
    req.user = { sportl_id, schul_id, userrole };
    next();
  } catch (error) {
    console.error("Fehler beim Überprüfen des Tokens:", error.message);
    res.status(403).json({ message: "Nicht autorisiert: Ungültiger Token" });
  }
};

// Middleware zur Autorisierung basierend auf Benutzerrollen
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userrole)) {
      return res
        .status(403)
        .json({ message: "Nicht autorisiert: Benutzerrolle nicht erlaubt" });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
