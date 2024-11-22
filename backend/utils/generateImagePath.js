// Hilfsfunktion zur Generierung der Bild-URL
function generateImageUrl(name_der_challenge) {
  if (!name_der_challenge) return null;
  const formattedName = name_der_challenge.toLowerCase().replace(/\s+/g, "_");
  return `/assets/images/${formattedName}.jpg`;
}

module.exports = { generateImageUrl };
