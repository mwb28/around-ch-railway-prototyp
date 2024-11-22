document.addEventListener("DOMContentLoaded", () => {
  loadArchivedChallenges();
});

async function loadArchivedChallenges() {
  const archiveChallengeCards = document.getElementById(
    "archiveChallengeCards"
  );

  try {
    // Archivierte Challenges abrufen
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/archived`
    );
    if (!response.ok) {
      throw new Error("Fehler beim Abrufen der archivierten Challenges.");
    }

    const challenges = await response.json();

    // Challenges anzeigen
    renderArchivedChallenges(challenges);
  } catch (error) {
    console.error("Fehler beim Laden der archivierten Challenges:", error);
    archiveChallengeCards.innerHTML = `<p class="error-message">Fehler beim Laden der archivierten Challenges.</p>`;
  }
}

function renderArchivedChallenges(challenges) {
  const archiveChallengeCards = document.getElementById(
    "archiveChallengeCards"
  );

  if (!challenges || challenges.length === 0) {
    archiveChallengeCards.innerHTML = `<p class="no-challenges-message">Keine archivierten Challenges gefunden.</p>`;
    return;
  }

  challenges.forEach((challenge) => {
    const {
      challenge_id,
      name_der_challenge,
      total_meter,
      image_url,
      teilnehmende_klassen,
    } = challenge;

    // Container für eine einzelne Challenge
    const card = document.createElement("div");
    card.className = "archive-challenge-card";

    // HTML-Inhalt der Challenge
    card.innerHTML = `
          <div class="archive-challenge-card-content">
            <div class="archive-challenge-image">
              <img src="${image_url}" alt="${name_der_challenge}" />
            </div>
            <div class="archive-challenge-details">
              <h3 class="challenge-name">${name_der_challenge}</h3>
              <p class="challenge-total-meter">Gesamtstrecke: ${total_meter} Meter</p>
              ${generateClassTable(teilnehmende_klassen)}
            </div>
          </div>
        `;

    archiveChallengeCards.appendChild(card);
  });
}

// Hilfsfunktion zum Erstellen der Tabelle
function generateClassTable(classes) {
  if (!classes || classes.length === 0) {
    return "<p class='no-classes-message'>Keine teilnehmenden Klassen gefunden.</p>";
  }

  // Tabellen-HTML erzeugen
  let tableHTML = `
        <table class="archive-class-table">
          <thead>
            <tr>
              <th>Klasse</th>
              <th>Schule</th>
              <th>Zurückgelegte Meter</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;

  classes.forEach((klass) => {
    tableHTML += `
          <tr>
            <td>${klass.klasse_name || "Unbekannt"}</td>
            <td>${klass.schulname || "Unbekannt"}</td>
            <td>${klass.meter_absolviert || "0"} m</td>
            <td>${klass.status || "Unbekannt"}</td>
          </tr>
        `;
  });

  tableHTML += `
          </tbody>
        </table>
      `;

  return tableHTML;
}
