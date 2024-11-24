require("dotenv").config({ path: "./.env" });
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const xlsx = require("xlsx");
const path = require("path");

// Initialisiere PostgreSQL-Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // notwendig, damit SSL-Verbindung akzeptiert wird (für Railway)
  },
});

// Benutzerdaten aus Excel lesen und in die Datenbank einfuegen
async function insertUsersFromExcel() {
  const saltRounds = 10;
  let client;

  try {
    // Lese Excel-Datei
    const filePath = path.join(__dirname, "./users.xlsx");
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const userData = xlsx.utils.sheet_to_json(worksheet);

    // Fuege schul_id zu Benutzerdaten hinzu
    // for (const user of userData) {
    //   const schulId = getSchoolIdFromEmail(user.email);
    //   if (schulId === null) {
    //     throw new Error(
    //       `Konnte schul_id fuer Benutzer ${user.email} nicht bestimmen`
    //     );
    //   }
    //   user.schul_id = schulId;
    // }

    // Schreibe aktualisierte Daten zurueck in die Excel-Datei
    const updatedWorksheet = xlsx.utils.json_to_sheet(userData);
    workbook.Sheets[sheetName] = updatedWorksheet;
    xlsx.writeFile(workbook, filePath);
    console.log("Excel-Datei wurde aktualisiert.");

    // Fuege Benutzerdaten in die Datenbank ein
    client = await pool.connect();
    await client.query("BEGIN");

    for (const user of userData) {
      try {
        // Hashe das Passwort
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Fuege Benutzer in die Tabelle ein
        await client.query(
          `INSERT INTO sportlehrperson (nachname, vorname, email, password_gehashed, schul_id, needs_password_change, userrole)
           VALUES ($1, $2, $3, $4, $5, $6,$7)`,
          [
            user.name,
            user.vorname,
            user.email,
            hashedPassword,
            user.schul_id,
            user.needs_password_change,
            user.userrole,
          ]
        );

        console.log(`Benutzer erfolgreich eingefuegt: ${user.email}`);
      } catch (insertError) {
        console.error(
          `Fehler beim Einfuegen des Benutzers: ${user.email}`,
          insertError
        );
        await client.query("ROLLBACK");
        client.release();
        return;
      }
    }

    await client.query("COMMIT");
  } catch (dbError) {
    console.error("Datenbankfehler", dbError);
  } finally {
    // Gebe den Client frei
    if (client) {
      client.release();
    }
  }
}

// Bestimme schul_id anhand der E-Mail
function getSchoolIdFromEmail(email) {
  const emailLower = email.toLowerCase();

  for (const [keyword, schulId] of Object.entries(schoolIdMapping)) {
    if (emailLower.includes(keyword)) {
      return schulId;
    }
  }

  // Gibt null zurueck, wenn keine Schule gefunden wird
  console.error(`Konnte schul_id fuer E-Mail nicht bestimmen: ${email}`);
  return null;
}

// Mapping von Schluesselwoertern zu schul_id
// prettier-ignore
const schoolIdMapping = {
    "kirchenfeld": 1,
    "neufeld": 2,
    "lerbermatt": 3,
    "hofwil": 4,
    "biel-seeland": 5,
    "bienne et du jura bernois": 6,
    "burgdorf": 7,
    "oberaargau": 8,
    "interlaken": 9,
    "thun": 10,
    "bme": 11,
    "muristalden": 12,
    "nms bern": 13,
    "freies gymnasium bern": 14,
    "feusi": 15,
    "fachmittelschule neufeld": 16,
    "fachmittelschule lerbermatt": 17,
    "fachmittelschule biel-seeland": 18,
    "fachmittelschule oberaargau": 19,
    "fachmittelschule thun": 20,
    "ecole de culture générale de bienne": 21,
    "fachmittelschule nms bern": 22
};

// Exportiere die Funktion
module.exports = insertUsersFromExcel;
