/*
Admin und User Controller
- get all users
- get single user
- update user
- delete user
- ev. update pwassword
- integratinon von sportklasseController?

*/

const pool = require("../db/connect");
const queries = require("../db/queries");
// get curret user info
const userInfo = async (req, res) => {
  const { sportl_id } = req.user;
  try {
    const user = await pool.query(queries.getUserInfo, [sportl_id]);
    res
      .status(200)
      .json({ name: user.rows[0].vorname + " " + user.rows[0].nachname });
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerinformationen:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};
const newUser = async (req, res) => {
  const {
    nachname,
    vorname,
    email,
    password,
    schul_id,
    needs_password_change,
    userrole,
  } = req.body;
  const saltRounds = 10;
  const password_gehashed = await bcrypt.hash(password, saltRounds);
  try {
    const newUser = await pool.query(queries.registerUser, [
      nachname,
      vorname,
      email,
      password_gehashed,
      schul_id,
      needs_password_change || true,
      userrole || "user",
    ]);
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("Fehler beim Registrieren des Benutzers:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};
const checkUserStatus = (req, res) => {
  res.status(200).json({
    message: "Benutzer ist eingeloggt",
    user: req.user,
  });
};

// Registriere eine neue Sportklasse
const registerSportclass = async (req, res) => {
  const { name, jahrgang } = req.body;
  const { sportl_id, schul_id } = req.user;

  try {
    const existingSportclass = await pool.query(queries.checkSportclass, [
      name,
      schul_id,
      sportl_id,
    ]);
    if (existingSportclass.rows.length > 0) {
      return res.status(400).json({ message: "Sportklasse existiert bereits" });
    }

    const newSportklasse = await pool.query(queries.registerSportclass, [
      name,
      jahrgang,
      schul_id,
      sportl_id,
    ]);
    res.status(201).json(newSportklasse.rows[0]);
  } catch (error) {
    console.error("Fehler beim Registrieren der Sportklasse:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};
const getAllSportClasses = async (req, res) => {
  const { sportl_id } = req.user;
  try {
    const sportClasses = await pool.query(queries.allSportClasses, [sportl_id]);

    res.status(200).json(sportClasses.rows);
  } catch (error) {
    console.error("Fehler beim Abrufen der Sportklassen:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};
const getAllUnusedSportClasses = async (req, res) => {
  const { sportl_id } = req.user;
  try {
    const unusedSportClasses = await pool.query(queries.notUsedSportclasses, [
      sportl_id,
    ]);
    res.status(200).json(unusedSportClasses.rows);
  } catch (error) {
    console.error("Fehler beim Abrufen der ungenutzten Sportklassen:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};
const deleteSportClasses = async (req, res) => {
  const { sportkl_ids } = req.body;
  const { sportl_id } = req.user;

  // Wenn keine IDs bereitgestellt werden, beende die Funktion frühzeitig
  if (!sportkl_ids || sportkl_ids.length === 0) {
    return res.status(400).json({ message: "Keine IDs bereitgestellt" });
  }

  try {
    const result = await pool.query(queries.deleteSportclasses, [
      sportkl_ids,
      sportl_id,
    ]);

    res.status(200).json({
      message: "Sportklassen erfolgreich gelöscht",
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Fehler beim Löschen der Sportklassen:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

const userStatistics = async (req, res) => {
  const { sportl_id } = req.user;
  try {
    const userStats = await pool.query(queries.getUserStatistics, [sportl_id]);
    res.status(200).json(userStats.rows);
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerstatistiken:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

module.exports = {
  userInfo,
  newUser,
  checkUserStatus,
  registerSportclass,
  getAllSportClasses,
  getAllUnusedSportClasses,
  deleteSportClasses,
  userStatistics,
};
