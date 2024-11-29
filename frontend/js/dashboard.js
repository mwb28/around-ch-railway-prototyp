document.addEventListener("DOMContentLoaded", () => {
  loadActiveChallenges();
  loadStatistics();
  loadSportClasses();
  loadSelectableChallenges();
  loadCreateChallenge();
});
//  Alle aktiven Challenges laden, die zum einer Sportl_id gehören
async function loadActiveChallenges() {
  try {
    const response = await fetch(`${window.backendUrl}/api/v1/challenges/user`);
    if (!response.ok) throw new Error("Fehler beim Laden der Challenges");

    const challenges = await response.json();
    if (challenges.length === 0) {
      document.getElementById("active-challenges").textContent =
        "Keine aktiven Challenges gefunden.";
      return;
    }
    const activeChallengesContainer =
      document.getElementById("active-challenges");

    activeChallengesContainer.innerHTML = "";

    challenges.forEach((challenge) => {
      // Akkordeon-Button erstellen
      const accordionButton = document.createElement("button");
      accordionButton.classList.add("accordion");
      accordionButton.textContent =
        "Sportklasse: " +
        challenge.eigene_sportklasse +
        " - " +
        challenge.name_der_challenge +
        " Nr: " +
        challenge.challenge_id;

      const panel = document.createElement("div");
      panel.classList.add("panel");

      const description1 = document.createElement("p");
      description1.textContent =
        "Startzeitpunkt: " +
        new Date(challenge.startzeitpunkt).toLocaleString("de-CH");

      const description2 = document.createElement("p");
      description2.textContent =
        "Endzeitpunkt: " +
        new Date(challenge.endzeitpunkt).toLocaleString("de-CH");

      const description3 = document.createElement("p");
      description3.textContent =
        "Absolviert: " + challenge.meter_absolviert + " Meter";

      const description4 = document.createElement("p");
      description4.textContent =
        "Bis ins Ziel: " +
        (challenge.total_meter - challenge.meter_absolviert) +
        " Meter";

      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      const showMapButton = document.createElement("button");
      showMapButton.textContent = "Karte anzeigen";
      showMapButton.classList.add("show-map");
      showMapButton.onclick = () =>
        window.open(
          `./einzel-challenge.html?challengeId=${challenge.challenge_id}`
        );

      const addActivityButton = document.createElement("button");
      addActivityButton.textContent = "Aktivität hinzufügen";
      addActivityButton.classList.add("add-activity");
      addActivityButton.onclick = () =>
        window.open(
          `./aktivitaet-input.html?instanceId=${challenge.instanz_id}`
        );

      buttonContainer.appendChild(showMapButton);
      buttonContainer.appendChild(addActivityButton);

      panel.appendChild(description1);
      panel.appendChild(description2);
      panel.appendChild(description3);
      panel.appendChild(description4);
      panel.appendChild(buttonContainer);

      // Event-Listener für das Akkordeon
      accordionButton.addEventListener("click", () => {
        const isVisible = panel.style.display === "block";
        panel.style.display = isVisible ? "none" : "block";
      });

      // Akkordeon-Elemente zur Seite hinzufügen
      activeChallengesContainer.appendChild(accordionButton);
      activeChallengesContainer.appendChild(panel);
    });
  } catch (error) {
    console.error("Fehler beim Laden der Challenges:", error);
  }
}
// Statistik der sporlt_id laden
async function loadStatistics() {
  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/users/statistics`
    );
    if (!response.ok) throw new Error("Fehler beim Laden der Statistik");
    const statsArray = await response.json();

    const stats = statsArray[0];
    if (stats.totalmeter == null || stats.totaldauer == null) {
      document.getElementById("totalKm").textContent = "0 km";
      document.getElementById("totalHours").textContent = "0 h 0 min";
      return;
    }
    const totalKilometer = (parseInt(stats.totalmeter, 10) / 1000).toFixed(3);
    const totalMinuten = parseInt(stats.totaldauer, 10);
    const stunden = Math.floor(totalMinuten / 60);
    const minuten = totalMinuten % 60;
    document.getElementById("totalKm").textContent = `${totalKilometer} km`;
    document.getElementById(
      "totalHours"
    ).textContent = `${stunden} h ${minuten} min`;
    // console.log("Total Meter: ", stats.totalmeter);
    // console.log("Total Minuten: ", stats.totaldauer);
    // document.getElementById("mySportClasses").textContent =
    //   stats.sportClasses.join(", ");
  } catch (error) {
    console.error("Fehler beim Laden der Statistik:", error);
  }
}
// Sportklassen laden in Statistik
async function loadSportClasses() {
  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/users/sportclasses`
    );
    if (!response.ok) throw new Error("Fehler beim Laden der Sportklassen");

    const sportClasses = await response.json();
    // console.log("Erhaltene Sportklassen:", sportClasses);
    if (sportClasses.length === 0) {
      document.getElementById("mySportClasses").textContent =
        "Keine Sportklassen gefunden.";
      return;
    }
    const classListContainer = document.getElementById("mySportClasses");
    classListContainer.innerHTML = "";

    // Sportklassen als Liste der Namen einfügen
    sportClasses.forEach((sportClass) => {
      const listItem = document.createElement("span");
      listItem.textContent = sportClass.name;
      classListContainer.appendChild(listItem);

      const separator = document.createElement("span");
      separator.textContent = ", ";
      classListContainer.appendChild(separator);
    });
  } catch (error) {
    console.error("Fehler beim Laden der Sportklassen:", error);
  }
}
// Auswaehlbare Challenges laden
async function loadSelectableChallenges() {
  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/active`
    );
    if (!response.ok)
      throw new Error("Fehler beim Laden der auswählbaren Challenges");

    const challenges = await response.json();

    const classesResponse = await fetch(
      `${window.backendUrl}/api/v1/users/sportclasses`
    );
    if (!classesResponse.ok)
      throw new Error("Fehler beim Laden der Sportklassen");
    const sportClasses = await classesResponse.json();

    const selectChallengesContainer =
      document.getElementById("select-challenges");

    selectChallengesContainer.innerHTML = "";
    challenges.forEach((challenge) => {
      const challengeCard = document.createElement("div");
      challengeCard.classList.add("challenge-card-selectable");

      const challengeImage = document.createElement("img");
      challengeImage.src =
        challenge.image_path || "../assets/images/default.jpg";
      challengeImage.alt = challenge.name;
      challengeImage.classList.add("challenge-image-selectable");
      challengeCard.appendChild(challengeImage);

      // Inhalt der Karte hinzufügen
      const cardContent = document.createElement("div");
      cardContent.classList.add("challenge-card-content-selectable");

      const description1 = document.createElement("h3");
      description1.textContent =
        challenge.name_der_challenge + " Nr: " + challenge.challenge_id;
      cardContent.appendChild(description1);

      const description2 = document.createElement("p");
      description2.textContent =
        "Startzeitpunkt: " +
        new Date(challenge.startzeitpunkt).toLocaleString("de-CH");
      cardContent.appendChild(description2);

      const description3 = document.createElement("p");
      description3.textContent =
        "Endzeitpunkt: " +
        new Date(challenge.endzeitpunkt).toLocaleString("de-CH");
      cardContent.appendChild(description3);

      const description4 = document.createElement("p");
      description4.textContent = "Total Meter: " + challenge.total_meter;
      cardContent.appendChild(description4);

      // Dropdown-Menü für Klassen erstellen
      const classDropdown = document.createElement("select");
      classDropdown.classList.add("class-dropdown");
      sportClasses.forEach((sportClass) => {
        const option = document.createElement("option");
        option.value = sportClass.sportkl_id;
        option.textContent = sportClass.name;
        classDropdown.appendChild(option);
      });

      cardContent.appendChild(classDropdown);

      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      const showMapButton = document.createElement("button");
      showMapButton.textContent = "Karte anzeigen";
      showMapButton.classList.add("show-map");
      showMapButton.onclick = () =>
        window.open(
          `./einzel-challenge.html?challengeId=${challenge.challenge_id}`
        );

      const participateButton = document.createElement("button");
      participateButton.textContent = "Teilnehmen";
      participateButton.classList.add("participate-button");
      participateButton.onclick = () =>
        joinChallenge(challenge.challenge_id, classDropdown.value);

      buttonContainer.appendChild(showMapButton);
      buttonContainer.appendChild(participateButton);

      challengeCard.appendChild(cardContent);
      challengeCard.appendChild(buttonContainer);
      selectChallengesContainer.appendChild(challengeCard);
    });
  } catch (error) {
    console.error("Fehler beim Laden der auswählbaren Challenges:", error);
  }
}

// Hilfsfunktion um existierenden Challenges beizutreten

async function joinChallenge(challengeId, classId) {
  if (!classId || !challengeId) {
    alert("Bitte wähle eine gültige Klasse und Challenge aus.");
    return;
  }

  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/createInstance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challenge_id: challengeId,
          sportkl_id: classId,
        }),
      }
    );

    if (response.ok) {
      alert("Erfolgreich zur Challenge angemeldet!");
      await loadActiveChallenges();
    } else if (response.status === 409) {
      alert("Diese Sportklasse nimmt bereits an dieser Challenge teil.");
    } else {
      const errorData = await response.json();
      alert(
        errorData.message ||
          "Es gab ein Problem bei der Anmeldung zur Challenge."
      );
    }
  } catch (error) {
    console.error("Fehler beim Registrieren der Challenge-Teilnahme:", error);
    alert("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
  }
}
// Neue challenges erstellen

async function loadCreateChallenge() {
  try {
    // Vorlagen für Challenges aus der Datenbank abrufen
    const templatesResponse = await fetch(
      `${window.backendUrl}/api/v1/challenges/templates`
    );
    if (!templatesResponse.ok)
      throw new Error("Fehler beim Laden der Challenge-Vorlagen");
    const templates = await templatesResponse.json();

    // Sportklassen aus der Datenbank abrufen
    const classesResponse = await fetch(
      `${window.backendUrl}/api/v1/users/sportclasses`
    );
    if (!classesResponse.ok)
      throw new Error("Fehler beim Laden der Sportklassen");
    const sportClasses = await classesResponse.json();

    const createChallengeContainer =
      document.getElementById("create-challenges");
    createChallengeContainer.innerHTML = "";

    const form = document.createElement("form");
    form.classList.add("create-challenge-form");

    const templateLabel = document.createElement("label");
    templateLabel.textContent = "Challenge-Vorlage auswählen:";
    const templateDropdown = document.createElement("select");
    templateDropdown.classList.add("template-dropdown");
    templates.forEach((template) => {
      const option = document.createElement("option");
      option.value = template.challengevl_id;
      option.textContent = template.name_der_challenge;
      templateDropdown.appendChild(option);
    });
    form.appendChild(templateLabel);
    form.appendChild(templateDropdown);

    const startLabel = document.createElement("label");
    startLabel.textContent = "Startdatum und -zeit:";
    const startDateInput = document.createElement("input");
    startDateInput.type = "date";
    startDateInput.classList.add("start-date-input");
    const startTimeInput = document.createElement("input");
    startTimeInput.type = "time";
    startTimeInput.classList.add("start-time-input");
    form.appendChild(startLabel);
    form.appendChild(startDateInput);
    form.appendChild(startTimeInput);

    const endLabel = document.createElement("label");
    endLabel.textContent = "Enddatum und -zeit:";
    const endDateInput = document.createElement("input");
    endDateInput.type = "date";
    endDateInput.classList.add("end-date-input");
    const endTimeInput = document.createElement("input");
    endTimeInput.type = "time";
    endTimeInput.classList.add("end-time-input");
    form.appendChild(endLabel);
    form.appendChild(endDateInput);
    form.appendChild(endTimeInput);

    const classLabel = document.createElement("label");
    classLabel.textContent = "Sportklasse auswählen:";
    const classDropdown = document.createElement("select");
    classDropdown.classList.add("class-dropdown");
    sportClasses.forEach((sportClass) => {
      const option = document.createElement("option");
      option.value = sportClass.sportkl_id;
      option.textContent = sportClass.name;
      classDropdown.appendChild(option);
    });
    form.appendChild(classLabel);
    form.appendChild(classDropdown);

    // "Challenge erstellen" Button
    const createButton = document.createElement("button");
    createButton.textContent = "Challenge erstellen";
    createButton.type = "button";
    createButton.classList.add("create-button");
    createButton.onclick = () =>
      createChallenge(
        templateDropdown.value,
        startDateInput.value,
        startTimeInput.value,
        endDateInput.value,
        endTimeInput.value,
        classDropdown.value
      );
    form.appendChild(createButton);

    createChallengeContainer.appendChild(form);
  } catch (error) {
    console.error("Fehler beim Laden der Challenge-Erstellungsseite:", error);
  }
}

// Funktion zum Erstellen einer neuen Challenge basierend auf der Vorlage
async function createChallenge(
  templateId,
  startDate,
  startTime,
  endDate,
  endTime,
  selectedClass
) {
  if (!startDate || !startTime || !endDate || !endTime) {
    alert("Bitte fülle alle Felder aus.");
    return;
  }
  if (startDate > endDate) {
    alert("Startdatum muss vor dem Enddatum liegen");
    return;
  }
  if (endDate > new Date()) {
    alert("Enddatum muss in der Zukunft liegen");
    return;
  }
  const startDateTime = `${startDate}T${startTime}`;
  const endDateTime = `${endDate}T${endTime}`;

  if (new Date(endDateTime) < new Date(startDateTime)) {
    alert("Endzeitpunkt muss nach dem Startzeitpunkt liegen");
    return;
  }
  const challengeData = {
    startzeitpunkt: new Date(startDateTime).toISOString(),
    endzeitpunkt: new Date(endDateTime).toISOString(),
    challengevl_id: templateId,
    sportkl_id: selectedClass,
  };

  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
      }
    );

    if (!response.ok) throw new Error("Fehler beim Erstellen der Challenge");

    alert("Challenge erfolgreich erstellt!");
    await loadActiveChallenges();
    await loadSelectableChallenges();
  } catch (error) {
    console.error("Fehler beim Erstellen der Challenge:", error);
  }
}
let challengesLoaded = false;

async function toggleArchivedUserChallenges() {
  const archiveCardContainer = document.getElementById(
    "archived-user-challenges-card"
  );

  // Toggle die Anzeige des Containers
  if (archiveCardContainer.classList.contains("hidden")) {
    archiveCardContainer.classList.remove("hidden");

    // Lade die Challenges nur beim ersten Öffnen
    if (!challengesLoaded) {
      await loadArchivedChallenges();
      challengesLoaded = true;
    }
  } else {
    archiveCardContainer.classList.add("hidden");
  }
}

async function loadArchivedChallenges() {
  const archiveChallengeCards = document.getElementById(
    "archiveUserChallengeCards"
  );

  try {
    // Abrufen der archivierten Challenges
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/archivedUser`
    );
    if (!response.ok) {
      throw new Error("Fehler beim Abrufen der archivierten Challenges.");
    }

    const challenges = await response.json();

    // Challenges rendern
    renderArchivedChallenges(challenges);
  } catch (error) {
    console.error("Fehler beim Laden der archivierten Challenges:", error);
    archiveChallengeCards.innerHTML = `<p class="error-message">Fehler beim Laden der archivierten Challenges.</p>`;
  }
}

function renderArchivedChallenges(challenges) {
  const archiveChallengeCards = document.getElementById(
    "archiveUserChallengeCards"
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
            
            <div class="archive-challenge-details">
              <h3 class="challenge-name">${name_der_challenge} Nr. ${challenge_id}</h3>
              <p class="challenge-total-meter">Gesamtstrecke: ${total_meter} Meter</p>
              ${generateClassTable(teilnehmende_klassen)}
            </div>
          </div>
        `;

    archiveChallengeCards.appendChild(card);
  });
}

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
    let statusdef;
    if (klass.status === "in_progress") {
      statusdef = "Zeit abgelaufen";
    } else {
      statusdef = "Beendet";
    }
    tableHTML += `
          <tr>
            <td>${klass.klasse_name || "Unbekannt"}</td>
            <td>${klass.schulname || "Unbekannt"}</td>
            <td>${klass.meter_absolviert || "0"} m</td>
            <td>${statusdef || "Unbekannt"}</td>
          </tr>
        `;
  });

  tableHTML += `
          </tbody>
        </table>
      `;

  return tableHTML;
}
