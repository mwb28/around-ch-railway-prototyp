async function submitActivity() {
  const form = document.getElementById("activityForm");

  const urlParams = new URLSearchParams(window.location.search);
  const instanceId = urlParams.get("instanceId");

  if (!instanceId) {
    alert("Instanz-ID fehlt in der URL.");
    return;
  }

  const anzahlM = parseInt(form.male_count.value, 10) || 0;
  const anzahlW = parseInt(form.female_count.value, 10) || 0;
  const anzahlD = parseInt(form.diverse_count.value, 10) || 0;

  const anzahlTeilnehmer = anzahlM + anzahlW + anzahlD;

  if (anzahlTeilnehmer < 1) {
    alert("Bitte geben Sie mindestens eine Person an.");
    return;
  }
  if (!form.date.value) {
    alert("Bitte geben Sie ein Datum an.");
    return;
  }
  if (!form.time.value) {
    alert("Bitte geben Sie eine Uhrzeit an.");
    return;
  }
  if (!form.duration.value) {
    alert("Bitte geben Sie eine Dauer an.");
    return;
  }
  const anzahlMeter = parseInt(form.meter.value, 10) || 0;
  if (anzahlMeter < 1) {
    alert("Bitte geben Sie die Anzahl der Meter an.");
    return;
  }

  const averageMeter = Math.floor(anzahlMeter / anzahlTeilnehmer);

  const data = {
    meter: averageMeter,
    uhrzeit: form.time.value,
    datum: form.date.value,
    dauer: form.duration.value,
    anzahl_m: form.male_count.value,
    anzahl_w: form.female_count.value,
    anzahl_d: form.diverse_count.value,
    instanz_id: instanceId,
  };

  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/challenges/addActivity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
      form.reset();
      window.location.href = "./dashboard.html";
    } else {
      alert("Fehler beim Senden der Aktivität.");
    }
  } catch (error) {
    console.error("Fehler:", error);
    alert("Ein Fehler ist aufgetreten.");
  }
}
