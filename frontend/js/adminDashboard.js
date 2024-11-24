document.addEventListener("DOMContentLoaded", () => {
  loadActiveChallenges();
});

async function loadActiveChallenges() {
  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/active`
    );
    if (!response.ok) throw new Error("Fehler beim Laden der Challenges");

    const challenges = await response.json();
    if (challenges.length === 0) {
      document.getElementById("admin-active-challenges").textContent =
        "Keine aktiven Challenges gefunden.";
      return;
    }
    const activeChallengesContainer = document.getElementById(
      "admin-active-challenges"
    );

    activeChallengesContainer.innerHTML = "";

    challenges.forEach((challenge) => {
      // Akkordeon-Button erstellen
      const accordionButton = document.createElement("button");
      accordionButton.classList.add("accordion");

      // Text für den Akkordeon-Button setzen
      const buttonText = document.createTextNode(
        "Challenge Nr: " +
          challenge.challenge_id +
          " - " +
          challenge.name_der_challenge +
          " Abgeschlossen ?: " +
          challenge.abgeschlossen
      );

      // Text zum Button hinzufügen
      accordionButton.appendChild(buttonText);

      // Panel erstellen
      const panel = document.createElement("div");
      panel.classList.add("panel");

      // Challenge-Details erstellen
      const description1 = document.createElement("p");
      description1.textContent =
        "Startzeitpunkt: " +
        new Date(challenge.startzeitpunkt).toLocaleString("de-CH");

      const description2 = document.createElement("p");
      description2.textContent =
        "Endzeitpunkt: " +
        new Date(challenge.endzeitpunkt).toLocaleString("de-CH");

      // Challenge-Instanzen auflisten - Instanzencontainer erstellen
      const instancesContainer = document.createElement("div");
      instancesContainer.classList.add("instances-container");

      // Panel befüllen
      panel.appendChild(description1);
      panel.appendChild(description2);
      panel.appendChild(instancesContainer);

      // Button zum Löschen der Challenge erstellen
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Löschen";
      deleteButton.classList.add("delete-button");
      deleteButton.onclick = async () => {
        // Gesamte Challenge und alle Instanzen löschen
        await deleteChallengeById(challenge.challenge_id);

        // Nach der Löschung die Seite aktualisieren
        loadActiveChallenges();
      };

      panel.appendChild(deleteButton);

      // Event-Listener für das Akkordeon
      accordionButton.addEventListener("click", async () => {
        // Panel ein-/ausblenden
        const isVisible = panel.style.display === "block";
        panel.style.display = isVisible ? "none" : "block";

        // Nur wenn das Panel sichtbar gemacht wird, Instanzen laden
        if (!isVisible) {
          try {
            // Instanzen laden
            const participantsResponse = await fetch(
              `${window.backendUrl}/api/v1/challenges/pendingInstanzes/${challenge.challenge_id}`
            );
            const instances = await participantsResponse.json();

            // Container leeren
            instancesContainer.innerHTML = "";

            // Instanzen in das Panel einfügen
            instances.forEach((instanz) => {
              const instanceWrapper = document.createElement("div");
              instanceWrapper.classList.add("instance-wrapper");

              const instanceLabel = document.createElement("label");
              instanceLabel.textContent = `Instanz-ID: ${instanz.instanz_id}, Schule: ${instanz.schule}, 
              Sportklasse: ${instanz.sportklasse}, Meter absolviert: ${instanz.meter_absolviert}, 
              Status: ${instanz.status}`;

              instanceWrapper.appendChild(instanceLabel);
              instancesContainer.appendChild(instanceWrapper);
            });
          } catch (error) {
            console.error(
              `Fehler beim Laden der Instanzen für Challenge ${challenge.challenge_id}:`,
              error
            );
          }
        }
      });

      // Akkordeon-Elemente zur Seite hinzufügen
      activeChallengesContainer.appendChild(accordionButton);
      activeChallengesContainer.appendChild(panel);
    });
  } catch (error) {
    console.error("Fehler beim Laden der Challenges:", error);
  }
}

// Funktion zum Löschen einer Challenge nach ID
async function deleteChallengeById(challengeId) {
  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/${challengeId}/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Fehler beim Löschen der Challenge");
    alert("Challenge erfolgreich gelöscht");
  } catch (error) {
    console.error("Fehler beim Löschen der Challenge:", error);
  }
}
