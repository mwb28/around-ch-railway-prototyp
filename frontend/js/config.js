// localhost fuer Entwicklung, railway.app fuer Produktion
window.backendUrl = window.location.origin.includes("localhost")
  ? "http://localhost:5000"
  : "https://around-ch-railway-prototyp-production.up.railway.app";
