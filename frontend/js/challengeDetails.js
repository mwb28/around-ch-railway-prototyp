// challengeDetails.js
document.addEventListener("DOMContentLoaded", () => {
  loadChallengeDetail();
});

async function loadChallengeDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get("challengeId");

  if (!challengeId) {
    console.error("Challenge ID nicht in der URL gefunden.");
    return;
  }

  try {
    // Teilnehmer und Fortschritt laden
    const participantsResponse = await fetch(
      `${window.backendUrl}/api/v1/challenges/pendingInstanzes/${challengeId}`
    );

    // Streckendaten und zusätzliche Details zur Challenge laden
    const challengeResponse = await fetch(
      `${window.backendUrl}/api/v1/challenges/active/single/${challengeId}`
    );
    if (!challengeResponse.ok || !participantsResponse.ok) {
      throw new Error("Fehler beim Laden der Challenge-Daten.");
    }
    const participants = await participantsResponse.json();
    const challengeDetails = await challengeResponse.json();

    // Challenge-Route und Teilnehmerdaten kombinieren
    const challengeData = { ...challengeDetails, participants };

    renderChallengeDetail(participants, challengeId);
    initializeMap(challengeData, challengeId); // Karte initialisieren mit Challenge-Daten
  } catch (error) {
    console.error("Fehler beim Laden der Challenge-Daten:", error);
    document.querySelector(".challenge-details").innerHTML =
      "<p>Fehler beim Laden der Challenge-Daten.</p>";
  }
}
// Tabelle mit Teilnehmerdaten rendern
function renderChallengeDetail(participants, challengeId) {
  const challengeDetails = document.querySelector(".challenge-details");
  challengeDetails.innerHTML = "";

  if (Array.isArray(participants) && participants.length > 0) {
    const challengeName = participants[0].name_der_challenge || "Challenge";
    challengeDetails.innerHTML = `<h3>${challengeName} Nr. ${challengeId}</h3>`;

    let tableHTML = `
                      <table class="challenge-table">
                        <thead>
                          <tr>
                            <th>Sportklasse</th>
                            <th>Schule</th>
                            <th>Zurückgelegte Meter</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                    `;

    participants.forEach((instance) => {
      let statusAnzeige = "Unbekannt";
      if (instance.status === "in_progress") {
        statusAnzeige = "Im Gange";
      } else if (instance.status === "completed") {
        statusAnzeige = "Beendet";
      }
      tableHTML += `
                        <tr>
                          <td>${instance.sportklasse || "Unbekannt"}</td>
                          <td>${instance.schule || "Unbekannt"}</td>
                          <td>${instance.meter_absolviert || "0"} m</td>
                          <td>${statusAnzeige || "Unbekannt"}</td>
                        </tr>
                      `;
    });

    tableHTML += `</tbody></table>`;
    challengeDetails.innerHTML += tableHTML;
  } else {
    challengeDetails.innerHTML =
      "<p>Keine Daten für diese Challenge gefunden.</p>";
  }
}

// Karte initialisieren und Teilnehmerfortschritt darstellen
async function initializeMap(challenge, challengeId) {
  // Kartengrenzen auf die Schweiz beschränken
  const switzerlandBounds = [
    [45.818, 5.956], // Südwestlicher Punkt der Schweiz
    [47.808, 10.492], // Nordöstlicher Punkt der Schweiz
  ];

  const map = L.map("map").setView([47.1, 7.2], 12);
  map.setMaxBounds(switzerlandBounds);
  map.fitBounds(switzerlandBounds);

  // OpenStreetMap-Kacheln laden
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    minZoom: 7,
    maxZoom: 15,
  }).addTo(map);

  // Prüfen, ob GeoJSON-Daten für die Challenge vorhanden sind
  if (challenge.geojson_daten) {
    // Umriss der Challenge-Route als GeoJSON hinzufügen
    const geoJsonLayer = L.geoJSON(challenge.geojson_daten, {
      style: function (feature) {
        return { color: "blue", weight: 2, opacity: 0.6 };
      },
    }).addTo(map);

    map.fitBounds(geoJsonLayer.getBounds());

    // Extrahieren der Koordinaten aus dem Umriss
    const coordinates =
      challenge.geojson_daten.features[0].geometry.coordinates;
    const totalPoints = coordinates.length;

    // GeoJSON-Linie erstellen und Gesamtlänge der Route berechnen
    // const totalLength = challenge.total_meter;
    // console.log("Gesamtlänge der Route:", totalLength);

    const participants = challenge.participants;
    const colors = ["red", "green", "black", "orange", "purple"];

    // Teilnehmerdaten auf der Karte anzeigen

    participants.forEach((participant, index) => {
      const color = colors[index % colors.length];
      const distanceCovered = participant.meter_absolviert;
      let traveledDistance = 0;
      let newIndex = 0;

      while (traveledDistance < distanceCovered && newIndex < totalPoints - 1) {
        const from = turf.point(coordinates[newIndex]);
        const to = turf.point(coordinates[newIndex + 1]);
        const segmentDistance = turf.distance(from, to, { units: "meters" });
        traveledDistance += segmentDistance;
        newIndex++;
      }

      const offsetFactor = 0.0004;
      const offsetIndex = index;
      const offsetDirection = offsetIndex % 2 === 0 ? 1 : -1;
      const latOffset = offsetDirection * offsetIndex * offsetFactor;
      const lngOffset = offsetDirection * offsetIndex * offsetFactor;

      for (let i = 0; i < newIndex; i++) {
        const previousLatLng = [
          coordinates[i][1] + latOffset,
          coordinates[i][0] + lngOffset,
        ];
        const newLatLng = [
          coordinates[i + 1][1] + latOffset,
          coordinates[i + 1][0] + lngOffset,
        ];
        L.polyline([previousLatLng, newLatLng], {
          color: color,
          weight: 1,
        }).addTo(map);
      }

      const newPoint = coordinates[newIndex];
      L.marker([newPoint[1] + latOffset, newPoint[0] + lngOffset], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color:${color};width:14px;height:14px;border-radius:50%;"></div>
            <span style="margin-left:12px;font-size:18px;font-weight:bold;color:${color};">${(
            participant.sportklasse || "Unbekannt"
          ).replace(/\s+/g, "")}</span>`,
        }),
      })
        .addTo(map)
        .bindPopup(
          `${participant.schule || "Unbekannt"} (${
            participant.meter_absolviert / 1000
          } km)`
        );
    });
  } else {
    console.warn(
      `Keine GeoJSON-Daten für Challenge mit ID ${challengeId} vorhanden.`
    );
  }
}
