async function submitRegistration() {
  const form = document.getElementById("registrationForm");
  let name = form.classDesc.value.trim();
  const jahrgang = parseInt(form.classYear.value, 10);
  name = name.replace(/\s+/g, " ").trim();

  if (name === "" || isNaN(jahrgang)) {
    alert("Bitte füllen Sie alle Felder aus.");
    return;
  }
  if (name.length < 1 || name.length > 6) {
    alert("Der Name der Sportklasse muss zwischen 1 und 6 Zeichen lang sein.");
    return;
  }

  if (jahrgang < 1920 || jahrgang > new Date().getFullYear() - 4) {
    alert("Bitte geben Sie eine gültige Jahreszahl ein.");
    return;
  }

  const data = {
    name: name,
    jahrgang: jahrgang,
  };
  spinner.show();
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
  } finally {
    spinner.hide();
  }
}
