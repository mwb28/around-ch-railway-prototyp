//  Authentifizierung der Sportlehrpersonen
const registerUser = `INSERT INTO sportlehrperson 
  (nachname, vorname, email, password_gehashed, schul_id, needs_password_change, userrole) 
  VALUES ($1, $2, $3, $4, $5, $6,$7) RETURNING *`;
const getUserByEmail = `SELECT * 
FROM sportlehrperson 
WHERE email = $1`;
const updatePasswordAndRemoveFlag = `UPDATE sportlehrperson 
  SET password_gehashed = $1, 
  needs_password_change = false 
  WHERE email = $2`;
const insertinvalidatedToken = `INSERT  INTO invalidated_tokens (token) 
  VALUES ($1) RETURNING *`;
const getSchulIdAndRoleFromSportlId = `SELECT schul_id, userrole 
  FROM sportlehrperson 
  WHERE sportl_id = $1`;
const getInvalidatedToken = `SELECT * 
FROM invalidated_tokens 
WHERE token = $1`;

// Userinfos
const getUserInfo = `SELECT * 
FROM sportlehrperson 
WHERE sportl_id = $1`;
// Registeren der Sporklassen
const registerSportclass = `INSERT INTO sportklasse (name,jahrgang, schul_id, sportl_id) 
  VALUES ($1, $2, $3, $4) RETURNING *`;
const allSportClasses = `SELECT * 
  FROM sportklasse sk 
  WHERE sk.sportl_id = $1 ORDER BY sk.name`;
const checkSportclass = `SELECT * 
FROM sportklasse 
WHERE name = $1 
AND schul_id = $2 
AND sportl_id = $3`;
const getSportklasseId = `SELECT sportkl_id 
  FROM sportklasse 
  WHERE sportkl_id = $1`;
const notUsedSportclasses = `SELECT * 
FROM sportklasse sk
WHERE sk.sportl_id = $1
AND sk.sportkl_id NOT IN (
    SELECT DISTINCT kci.sportkl_id
    FROM klassen_challenge_instanz kci
    WHERE kci.sportkl_id IS NOT NULL
)`;
const deleteSportclasses = `
    DELETE FROM sportklasse
    WHERE sportkl_id = ANY($1) AND sportl_id = $2`;
//Heruasforderungen
const allActiveChallenges = `SELECT 
  c.challenge_id,
  c.startzeitpunkt,
  c.endzeitpunkt,
  c.abgeschlossen,
  cv.challengevl_id,
  cv.name_der_challenge, 
  cv.total_meter,
  cv.geojson_daten 
FROM challenge c
JOIN challenge_vorlage cv 
  ON c.challengevl_id = cv.challengevl_id 
WHERE c.abgeschlossen = false
AND c.endzeitpunkt > NOW()`;

const getAllUserChallengesOfsameChallengeId = ` SELECT 
kci.instanz_id, 
kci.meter_absolviert, 
kci.status,
kci.sportkl_id, 
sk.name AS sprtklasse_name,
s.schulname,
cv.name_der_challenge
FROM klassen_challenge_instanz kci 
  JOIN sportklasse sk 
    ON kci.sportkl_id = sk.sportkl_id 
  JOIN schule s 
    ON sk.schul_id = s.schul_id 
  JOIN challenge c 
    ON kci.challenge_id = c.challenge_id
  JOIN challenge_vorlage cv 
    ON c.challengevl_id = cv.challengevl_id
  WHERE kci.challenge_id = $1 
  `;
// Einzel Challenge anzeigen
const challengeQuery = "SELECT * FROM challenge WHERE challenge_id = $1";
// Einzel Challenge mit meter und geojson anzeigen
const getSingleChallenge = `  SELECT 
    c.challenge_id,
    c.startzeitpunkt,
    c.endzeitpunkt, 
    cv.total_meter,
    cv.geojson_daten
  FROM 
    challenge c 
  JOIN 
    challenge_vorlage cv ON c.challengevl_id = cv.challengevl_id
  WHERE 
    c.challenge_id = $1`;
const completedChallenge = `SELECT 
kci.meter_absolviert, 
cv.total_meter
FROM klassen_challenge_instanz kci
JOIN challenge c 
  ON kci.challenge_id = c.challenge_id
JOIN challenge_vorlage cv 
  ON c.challengevl_id = cv.challengevl_id
WHERE kci.instanz_id = $1
`;

const updateChallengeCompleted = `
UPDATE klassen_challenge_instanz
SET status = 'completed'
WHERE instanz_id = $1
`;
const getAllTemplateChallenges = `SELECT 
    cv.challengevl_id,    
    cv.name_der_challenge,
    cv.total_meter
    FROM challenge_vorlage cv`;
const allUserChallenges = `SELECT 
    c.challenge_id,
    cv.name_der_challenge,
    kci.instanz_id,
    kci.meter_absolviert,
    sk_own.name AS eigene_sportklasse,
    (
        SELECT STRING_AGG(DISTINCT sk_other.name, ', ')
        FROM klassen_challenge_instanz kci_other
        JOIN sportklasse sk_other ON kci_other.sportkl_id = sk_other.sportkl_id
        WHERE kci_other.challenge_id = c.challenge_id
          AND sk_other.sportl_id <> $1
    ) AS andere_sportklassen,
    c.startzeitpunkt,
    c.endzeitpunkt,
    cv.total_meter
FROM 
    challenge c
JOIN 
    challenge_vorlage cv ON c.challengevl_id = cv.challengevl_id
JOIN 
    klassen_challenge_instanz kci ON kci.challenge_id = c.challenge_id AND kci.status = 'in_progress'
JOIN 
    sportklasse sk_own ON kci.sportkl_id = sk_own.sportkl_id AND sk_own.sportl_id = $1
WHERE 
    c.abgeschlossen = false
ORDER BY 
    eigene_sportklasse
`;
// Prueefen ob Klasse schon an Challenge teilnimmt
const checkClassParticipation = `
    SELECT * 
    FROM klassen_challenge_instanz 
    WHERE sportkl_id = $1 AND challenge_id = $2
  `;

const createChallenge = `INSERT INTO challenge 
  (startzeitpunkt, endzeitpunkt, abgeschlossen, challengevl_id, sportl_id) 
  VALUES ($1, $2, $3, $4, $5) RETURNING *`;

const createInstanceOfChallenge = `INSERT INTO klassen_challenge_instanz 
  (meter_absolviert, status, sportkl_id, challenge_id) 
  VALUES ($1, $2, $3, $4) RETURNING *`;

//Akitivitaeten
const addActivity = `INSERT INTO sportlicheleistung 
      (sportart, meter, uhrzeit, datum, dauer, anzahl_m, anzahl_w, anzahl_d, instanz_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)RETURNING *`;
// const addChallengeEnemy =
//   "INSERT INTO nimmtteilan (sportkl_id, challenge_id, gegner_sportkl_id) VALUES ($1, $2, $3)";
const updateChallengeInstance =
  "UPDATE klassen_challenge_instanz SET meter_absolviert = meter_absolviert + $1 WHERE instanz_id = $2";
const checkAndArchiveChallenge = `
  UPDATE challenge c
      SET abgeschlossen = true
      WHERE c.abgeschlossen = false
        AND (
          NOT EXISTS (
            SELECT 1
            FROM klassen_challenge_instanz kci
            WHERE kci.challenge_id = c.challenge_id
              AND kci.status != 'completed'
          )
        OR
          c.endzeitpunkt <= NOW()
        )
`;
const allArchivedChallenges = ` SELECT 
c.challenge_id,
c.startzeitpunkt,
c.endzeitpunkt,
c.abgeschlossen,
c.challengevl_id,
cv.name_der_challenge,
cv.total_meter,
kci.instanz_id,
kci.meter_absolviert,
kci.status,
kci.sportkl_id,
sk.name AS klasse_name,
s.schulname
FROM 
challenge c
JOIN 
  klassen_challenge_instanz kci ON c.challenge_id = kci.challenge_id
JOIN 
  challenge_vorlage cv ON c.challengevl_id = cv.challengevl_id
LEFT JOIN 
  sportklasse sk ON kci.sportkl_id = sk.sportkl_id
JOIN schule s 
    ON sk.schul_id = s.schul_id 
WHERE 
  c.abgeschlossen = true;
`;
const deleteChallenge = `DELETE FROM challenge WHERE challenge_id = $1`;
const deleteOrphanedInstances = `
    DELETE FROM klassen_challenge_instanz 
    WHERE challenge_id IS NULL AND meter_absolviert = 0;

    DELETE FROM sportlicheleistung 
    WHERE instanz_id IS NULL;
`;
const getUserStatistics = `SELECT
    SUM(sl.meter) AS totalmeter,
    SUM(sl.dauer) AS totaldauer
FROM sportlicheleistung sl
JOIN klassen_challenge_instanz kci ON sl.instanz_id = kci.instanz_id
JOIN sportklasse sk ON kci.sportkl_id = sk.sportkl_id
WHERE sk.sportl_id = $1`;

module.exports = {
  registerUser,
  getUserByEmail,
  updatePasswordAndRemoveFlag,
  getUserInfo,
  registerSportclass,
  allSportClasses,
  checkSportclass,
  getSportklasseId,
  notUsedSportclasses,
  deleteSportclasses,
  getSchulIdAndRoleFromSportlId,
  insertinvalidatedToken,
  getInvalidatedToken,
  allActiveChallenges,
  getAllUserChallengesOfsameChallengeId,
  getSingleChallenge,
  completedChallenge,
  updateChallengeCompleted,
  getAllTemplateChallenges,
  allUserChallenges,
  addActivity,
  createChallenge,
  checkClassParticipation,
  updateChallengeInstance,
  allArchivedChallenges,
  deleteChallenge,
  createInstanceOfChallenge,
  challengeQuery,
  getUserStatistics,
  deleteOrphanedInstances,
  checkAndArchiveChallenge,
};
