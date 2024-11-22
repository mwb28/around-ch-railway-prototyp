document.addEventListener("DOMContentLoaded", () => {
  // Login-Formular
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(`${window.backendUrl}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.needsPasswordChange) {
            alert(data.message);
            window.location.href = "/views/change-password.html";
          } else {
            // Speichere Login-Status und Benutzername
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", data.username); // Speichere den Benutzernamen
            alert(data.message);
            window.location.href = "/views/dashboard.html";
          }
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Fehler beim Einloggen:", error.message);
        alert(
          "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        );
      }
    });
  }

  // Passwort-Reset-Formular
  const passwordResetForm = document.getElementById("passwordResetForm");

  if (passwordResetForm) {
    const showPasswordCheckbox = document.getElementById("showPassword");
    const oldPasswordField = document.getElementById("oldPassword");
    const newPasswordField = document.getElementById("newPassword");
    const repeatPasswordField = document.getElementById("repeatPassword");

    if (showPasswordCheckbox) {
      showPasswordCheckbox.addEventListener("change", () => {
        const passwordType = showPasswordCheckbox.checked ? "text" : "password";
        oldPasswordField.type = passwordType;
        newPasswordField.type = passwordType;
        repeatPasswordField.type = passwordType;
      });
    }

    passwordResetForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const oldPassword = oldPasswordField.value;
      const newPassword = newPasswordField.value;
      const repeatPassword = repeatPasswordField.value;

      if (newPassword !== repeatPassword) {
        alert(
          "Die neuen Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut."
        );
        return;
      }

      try {
        const response = await fetch(
          `${window.backendUrl}/api/v1/auth/changePassword`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              oldPassword,
              newPassword,
              repeatPassword,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          alert("Das Passwort wurde erfolgreich geändert.");
          window.location.href = "/views/login.html";
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Fehler beim Ändern des Passworts:", error.message);
        alert(
          "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        );
      }
    });
  }

  // Login-Status im Header anzeigen
  const loginButton = document.getElementById("loginButton");
  const usernameDisplay = document.getElementById("usernameDisplay");

  function updateLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const username = localStorage.getItem("username");

    if (loginButton && usernameDisplay) {
      if (isLoggedIn && username) {
        loginButton.textContent = "Logout";
        loginButton.href = "#";
        loginButton.onclick = () => logout();
        usernameDisplay.textContent = `Willkommen, ${username}`;
      } else {
        loginButton.textContent = "Einloggen";
        loginButton.href = "/views/login.html";
        loginButton.onclick = null;
        usernameDisplay.textContent = "";
      }
    }
  }

  async function logout() {
    try {
      // Sende eine Anfrage an den Server, um das Token ungültig zu machen und den Cookie zu löschen
      const response = await fetch(`${window.backendUrl}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include", // Senden der Cookies mit der Anfrage
      });

      if (response.ok) {
        // Entferne den Login-Status aus dem localStorage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");

        localStorage.setItem("logout-event", Date.now());

        // Aktualisiere den Login-Status im Header
        updateLoginStatus();

        alert("Sie wurden erfolgreich ausgeloggt.");
        // Weiterleitung zur Startseite nach dem Logout
        window.location.href = "/index.html";
      } else {
        console.error(
          "Fehler beim Logout auf dem Server:",
          await response.text()
        );
        alert("Fehler beim Logout. Bitte versuchen Sie es später erneut.");
      }
    } catch (error) {
      console.error("Fehler beim Logout:", error);
      alert(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "logout-event") {
      // Der Benutzer hat sich in einem anderen Tab ausgeloggt
      console.log("Logout-Event in anderem Tab erkannt.");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      updateLoginStatus();
      window.location.href = "/index.html"; // Leite zur Startseite weiter
    }
  });

  // Aktualisiere den Login-Status beim Laden der Seite
  updateLoginStatus();

  // Dashboard-Button aktualisieren
  const dashboardButton = document.getElementById("dashboardButton");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (dashboardButton) {
    if (isLoggedIn) {
      dashboardButton.href = "../views/dashboard.html";
    } else {
      dashboardButton.href = "#";
      dashboardButton.onclick = () => {
        alert("Bitte loggen Sie sich ein, um das Dashboard zu betreten.");
      };
    }
  }
});
