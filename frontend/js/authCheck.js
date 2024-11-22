async function authCheck() {
  try {
    const response = await fetch(
      `${window.backendUrl}/api/v1/users/authcheck`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (response.status === 401) {
      // Benutzer ist nicht eingeloggt, Weiterleitung zur Login-Seite
      window.location.href = "/views/login.html";
    }
  } catch (error) {
    console.error("Fehler beim Überprüfen der Authentifizierung:", error);
    window.location.href = "/views/login.html";
  }
}

document.addEventListener("DOMContentLoaded", authCheck);
