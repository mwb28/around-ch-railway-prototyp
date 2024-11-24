/**
 authcontroller:
- loginUser: Login eines Benutzers, Fehlerbehandlung und Generierung eines JWT-Tokens
- changePassword: Passwort ändern und needs_password_change-Flag entfernen
- logoutUser:Benutzer ausloggen und Token ungültig machen
- checkToken: Middleware zur Überprüfung, ob das Token ungültig gemacht wurde
- fogotPassword: Passwort vergessen
- resetPassword: Passwort zurücksetzen

 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/connect");
const queries = require("../db/queries");
const getRandomToken = require("../utils/generateRandomToken");

// Login eines Benutzers, Fehlerbehandlung und Generierung eines JWT-Tokens
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const trimmedEmail = email.trim().toLowerCase(); // Email trimmen und in Kleinbuchstaben umwandeln

    // Überprüfen, ob die E-Mail in der Datenbank existiert
    const user = await pool.query(queries.getUserByEmail, [trimmedEmail]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "E-Mail nicht gefunden" });
    }

    const userData = user.rows[0];
    // Passwortüberprüfung mit bcrypt
    const validPassword = await bcrypt.compare(
      password,
      userData.password_gehashed
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Falsches Passwort" });
    }

    // Falls der Benutzer das initiale Passwort ändern muss
    if (userData.needs_password_change) {
      return res.status(200).json({
        message: "Anfängliches Passwort muss geändert werden",
        needsPasswordChange: true,
      });
    }

    // JWT-Token generieren, um den Benutzer zu authentifizieren
    const token = jwt.sign({ id: userData.sportl_id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    //console.log("Generated authToken:", token);

    // JWT als HTTP-Only-Cookie setzen, um es vor JavaScript-Zugriff zu schützen
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    const username = `${userData.vorname} ${userData.nachname}`;
    res.status(200).json({ message: "Login erfolgreich", username: username });
  } catch (error) {
    console.error("Fehler beim Einloggen:", error.message);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// Passwort ändern und needs_password_change-Flag entfernen
const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword, repeatPassword } = req.body;
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await pool.query(queries.getUserByEmail, [trimmedEmail]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "E-Mail nicht gefunden" });
    }
    const userData = user.rows[0];
    const validPassword = await bcrypt.compare(
      oldPassword,
      userData.password_gehashed
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Falsches Passwort" });
    }
    if (newPassword !== repeatPassword) {
      return res
        .status(400)
        .json({ message: "Passwörter stimmen nicht überein" });
    }
    const isSamePassword = await bcrypt.compare(
      newPassword,
      userData.password_gehashed
    );
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "Neues Passwort muss sich vom alten unterscheiden" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(queries.updatePasswordAndRemoveFlag, [
      hashedPassword,
      trimmedEmail,
    ]);
    res.status(200).json({ message: "Passwort erfolgreich geändert" });
  } catch (error) {
    console.error("Fehler beim Ändern des Passworts:", error.message);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// Benutzer ausloggen und Token ungültig machen
const logoutUser = async (req, res) => {
  const token = req.cookies.authToken;

  try {
    await pool.query(queries.insertinvalidatedToken, [token]);
    res.clearCookie("authToken");
    res.set("Cache-Control", "no-store");
    res.status(200).json({ message: "Erfolgreich ausgeloggt" });
  } catch (error) {
    console.error("Fehler beim Ausloggen:", error.message);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// Middleware zur Überprüfung, ob das Token ungültig gemacht wurde
const checkToken = async (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Kein Token bereitgestellt" });
  }

  try {
    const result = await pool.query(queries.checkInvalidatedToken, [token]);
    if (result.rows.length > 0) {
      return res.status(401).json({ message: "Token ist ungültig" });
    }
    next();
  } catch (error) {
    console.error("Fehler beim Überprüfen des Tokens:", error.message);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// Passwort vergessen
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const trimmedEmail = email.trim().toLowerCase();

    const user = await pool.query(queries.getUserByEmail, [trimmedEmail]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "E-Mail nicht gefunden" });
    }

    const resetToken = getRandomToken(8);
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    s;

    const expiresAt = new Date(Date.now() + 3600000); // Token-Ablaufzeit in 1 Stunde
    await pool.query(queries.saveResetToken, [
      resetTokenHash,
      trimmedEmail,
      expiresAt,
    ]);

    // Hinweis: E-Mail senden ist ein zukünftiges Feature
    res
      .status(200)
      .json({ message: "Passwort-Zurücksetzungs-Token wurde gesendet" });
  } catch (error) {
    console.error("Fehler bei Passwort vergessen:", error.message);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// Passwort zurücksetzen
const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  try {
    const trimmedEmail = email.trim().toLowerCase();

    // Überprüfen, ob ein Reset-Token für die E-Mail existiert und gültig ist
    const result = await pool.query(queries.getResetTokenByEmail, [
      trimmedEmail,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Ungültiger oder abgelaufener Zurücksetzungstoken" });
    }

    const { reset_token: storedTokenHash, expires_at: expiresAt } =
      result.rows[0];

    // Überprüfen, ob der Token abgelaufen ist
    if (new Date() > expiresAt) {
      return res
        .status(400)
        .json({ message: "Zurücksetzungstoken ist abgelaufen" });
    }

    // Token-Vergleich zwischen eingegebenem und gespeichertem Hash
    const validToken = await bcrypt.compare(resetToken, storedTokenHash);
    if (!validToken) {
      return res
        .status(400)
        .json({ message: "Ungültiger oder abgelaufener Zurücksetzungstoken" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(queries.updatePassword, [hashedPassword, trimmedEmail]);

    res.status(200).json({ message: "Passwort erfolgreich zurückgesetzt" });
  } catch (error) {
    console.error("Fehler bei Passwort zurücksetzen:", error.message);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

module.exports = {
  loginUser,
  changePassword,
  logoutUser,
  forgotPassword,
  resetPassword,
  checkToken,
};
