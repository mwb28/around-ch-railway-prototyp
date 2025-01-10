document.addEventListener("DOMContentLoaded", () => {
  loadChallenges();
});

async function loadChallenges(showAll = false) {
  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/active`
    );
    if (!response.ok) {
      throw new Error("Fehler beim Laden der Challenges");
    }

    const challenges = await response.json();
    const challengeCardsContainer = document.getElementById("challengeCards");

    challengeCardsContainer.innerHTML = "";
    const challengesToShow = showAll ? challenges : challenges.slice(0, 2);

    challengesToShow.forEach(async (challenge) => {
      const challengeCard = document.createElement("div");
      challengeCard.classList.add("card");

      const mapContainer = document.createElement("div");
      mapContainer.classList.add("map-container");
      mapContainer.style.width = "100%";
      mapContainer.style.height = "300px";
      challengeCard.appendChild(mapContainer);

      const cardContent = document.createElement("div");
      cardContent.classList.add("card-content");
      const title = document.createElement("h3");
      title.textContent =
        challenge.name_der_challenge + " Nr. " + challenge.challenge_id;
      const description1 = document.createElement("p");
      description1.textContent = challenge.description;
      const description2 = document.createElement("p");
      description2.textContent =
        "Startzeitpunkt: " +
        new Date(challenge.startzeitpunkt).toLocaleString("de-CH");
      const description3 = document.createElement("p");
      description3.textContent =
        "Endzeitpunkt: " +
        new Date(challenge.endzeitpunkt).toLocaleString("de-CH");
      const description4 = document.createElement("p");
      description4.textContent = "Total Meter: " + challenge.total_meter;

      const link = document.createElement("a");
      link.href =
        "./views/einzel-challenge.html?challengeId=" + challenge.challenge_id;
      link.textContent = " Einzel Challenge";
      link.classList.add("challenge-link");

      cardContent.appendChild(title);
      cardContent.appendChild(description1);
      cardContent.appendChild(description2);
      cardContent.appendChild(description3);
      cardContent.appendChild(description4);
      cardContent.appendChild(link);

      challengeCard.appendChild(cardContent);
      challengeCardsContainer.appendChild(challengeCard);

      // Initialisiere die Karte
      const switzerlandBounds = [
        [45.818, 5.956],
        [47.808, 10.492],
      ];
      const map = L.map(mapContainer).setView([47.1, 7.2], 6);
      map.setMaxBounds(switzerlandBounds);
      map.fitBounds(switzerlandBounds);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        minZoom: 6,
        maxZoom: 15,
      }).addTo(map);

      if (challenge.geojson_daten) {
        const geoJsonLayer = L.geoJSON(challenge.geojson_daten, {
          style: function (feature) {
            return { color: "blue", weight: 2, opacity: 0.7 };
          },
        }).addTo(map);
        map.fitBounds(geoJsonLayer.getBounds());
      }

      // Teilnehmerdaten laden und anzeigen
      const participantsResponse = await fetch(
        `${window.backendUrl}/api/v1/challenges/pendingInstanzes/${challenge.challenge_id}`
      );
      const participants = await participantsResponse.json();
      const colors = ["red", "green", "black", "orange", "purple"];
      const coordinates =
        challenge.geojson_daten.features[0].geometry.coordinates;
      const totalPoints = coordinates.length;
      const totalLength = challenge.total_meter;

      participants.forEach((participant, index) => {
        const color = colors[index % colors.length];
        const distanceCovered = participant.meter_absolviert;
        const progressDistance =
          (distanceCovered / challenge.total_meter) * totalLength;
        let traveledDistance = 0;
        let newIndex = 0;

        while (
          traveledDistance < progressDistance &&
          newIndex < totalPoints - 1
        ) {
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
    });
  } catch (error) {
    console.error("Fehler beim Laden der Challenges:", error);
  }
}

document
  .querySelector(".all-challenges-button")
  .addEventListener("click", () => {
    loadChallenges(true);
  });
