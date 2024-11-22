const crypto = require("crypto");

function generateRandomToken(length) {
  // Zeichen für den Zeichensatz
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";

  // Generiere zufällige Bytes
  const randomBytes = crypto.randomBytes(length);

  // Wandele die zufälligen Bytes in Zeichen aus dem Zeichensatz um
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    token += charset[randomIndex];
  }

  return token;
}

module.exports = generateRandomToken;
