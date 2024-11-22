async function submitRegistration() {
  const form = document.getElementById("registrationForm");

  const name = form.className.value.trim();
  const jahrgang = parseInt(form.classYear.value, 10);

  if (name === "" || isNaN(jahrgang)) {
    alert("Bitte füllen Sie alle Felder aus.");
    return;
  }

  if (jahrgang < 1900 || jahrgang > 2100) {
    alert("Bitte geben Sie eine gültige Jahreszahl ein.");
    return;
  }

  const data = {
    name: name,
    jahrgang: jahrgang,
  };

  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/users/registersportclass`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      alert("Sportklasse erfolgreich registriert!");
      form.reset();
      window.location.href = "./dashboard.html";
    } else {
      alert("Fehler beim Registrieren der Sportklasse.");
    }
  } catch (error) {
    console.error("Fehler:", error);
    alert("Ein Fehler ist aufgetreten.");
  }
}
