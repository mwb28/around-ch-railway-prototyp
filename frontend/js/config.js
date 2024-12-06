// localhost fuer Entwicklung, railway.app fuer Produktion
window.backendUrl = window.location.origin.includes("localhost")
  ? "http://localhost:5000"
  : "https://around-ch-railway-prototyp-production.up.railway.app";

const spinner = {
  show: () => {
    const spinnerElement = document.getElementById("loading-spinner");
    if (spinnerElement) spinnerElement.style.display = "flex";
  },
  hide: () => {
    const spinnerElement = document.getElementById("loading-spinner");
    if (spinnerElement) spinnerElement.style.display = "none";
  },
};
window.spinner = spinner;
