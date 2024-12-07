document.addEventListener("DOMContentLoaded", () => {
  console.log("Backend-URL:", window.backendUrl);

  // Login-Formular
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    const showPasswordCheckbox = document.getElementById("showpassword");
    const passwordField = document.getElementById("password");

    if (showPasswordCheckbox) {
      showPasswordCheckbox.addEventListener("change", () => {
        const passwordType = showPasswordCheckbox.checked ? "text" : "password";
        passwordField.type = passwordType;
      });
    }
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        spinner.show();
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
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("username", data.username); // Speichere den Benutzernamen
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
      } finally {
        spinner.hide();
      }
    });
  }

  // Passwort-Reset-Formular
  const passwordResetForm = document.getElementById("pwResetForm");

  if (passwordResetForm) {
    const showPasswordCheckbox = document.getElementById("showpassword");
    const oldPasswordField = document.getElementById("oldpassword");
    const newPasswordField = document.getElementById("newpassword");
    const repeatPasswordField = document.getElementById("repeatpassword");

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

      console.log("Formulareingaben:", {
        email,
        oldPassword,
        newPassword,
        repeatPassword,
      });

      if (newPassword !== repeatPassword) {
        alert(
          "Die neuen Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut."
        );
        return;
      }
      spinner.show();
      try {
        const response = await fetch(
          `${window.backendUrl}/api/v1/auth/changePassword`,
          {
            method: "PATCH",
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
        console.log("Response-Status:", response.status);
        const data = await response.json();
        console.log("Server-Antwort:", data);
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
      } finally {
        spinner.hide();
      }
    });
  }

  // Login-Status im Header anzeigen
  const loginButton = document.getElementById("loginButton");
  const usernameDisplay = document.getElementById("usernameDisplay");

  function updateLoginStatus() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const username = sessionStorage.getItem("username");

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
    spinner.show();
    try {
      // Sende eine Anfrage an den Server, um das Token ungültig zu machen und den Cookie zu löschen
      const response = await fetch(`${window.backendUrl}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include", // Senden der Cookies mit der Anfrage
      });

      if (response.ok) {
        // Entferne den Login-Status aus dem sessionStorage
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("username");

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
    } finally {
      spinner.hide();
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "logout-event") {
      // Der Benutzer hat sich in einem anderen Tab ausgeloggt
      console.log("Logout-Event in anderem Tab erkannt.");
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("username");

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
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
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
