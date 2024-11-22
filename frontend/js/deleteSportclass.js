document.addEventListener("DOMContentLoaded", async () => {
  const sportClassList = document.getElementById("sportClassList");
  const deleteSelectedClassesButton = document.getElementById(
    "deleteSelectedClasses"
  );

  // Laedt alle Sporklassen, die nicht verwendet werden
  async function loadSportClasses() {
    sportClassList.innerHTML = "<p>Sportklassen werden geladen...</p>";
    try {
      const response = await fetch(
        `${window.backendUrl}/api/v1/users/unusedclasses`
      );
      const sportClasses = await response.json();
      console.log(sportClasses);

      sportClassList.innerHTML = "";
      sportClasses.forEach((sportClass) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = sportClass.sportkl_id;
        checkbox.id = `sportClass-${sportClass.sportkl_id}`;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = sportClass.name;

        const container = document.createElement("div");
        container.appendChild(checkbox);
        container.appendChild(label);

        sportClassList.appendChild(container);
      });
    } catch (error) {
      sportClassList.innerHTML = "<p>Fehler beim Laden der Sportklassen.</p>";
    }
  }

  // Loeschen der ausgewaehlten Sportklassen
  deleteSelectedClassesButton.addEventListener("click", async () => {
    const selectedClasses = Array.from(
      sportClassList.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);

    if (selectedClasses.length === 0) {
      alert("Bitte wähle mindestens eine Sportklasse aus.");
      return;
    }

    try {
      const response = await fetch(
        `${window.backendUrl}/api/v1/users/deleteclasses`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sportkl_ids: selectedClasses }),
        }
      );

      if (response.ok) {
        alert("Sportklasse(n) erfolgreich gelöscht.");
        loadSportClasses(); // Aktualisiert die Liste nach dem Löschen
      } else {
        alert("Fehler beim Löschen der Sportklasse(n).");
      }
    } catch (error) {
      alert("Ein Fehler ist aufgetreten.");
    }
  });

  await loadSportClasses();
});
