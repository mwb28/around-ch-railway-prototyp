require("dotenv").config();

// express
const express = require("express");
const app = express();
// rest of the packages
const cookieParser = require("cookie-parser");
// const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");

// database
const pool = require("./backend/db/connect");

// routers
const authRoutes = require("./backend/routes/authRoutes");
const challengeRoutes = require("./backend/routes/challengeRoutes");
const userRoutes = require("./backend/routes/userRoutes");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(xss());
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/", limiter);

const corsOptions = {
  origin: "https://around-ch-railway-prototyp-production.up.railway.app",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.static("./frontend"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/challenges", challengeRoutes);
app.use("/api/v1/users", userRoutes);

const port = process.env.PORT || 5000;

// Server starten
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Beispiel für eine Datenbankverbindung und Testabfrage
// (Optional, nur für Testzwecke, ob die Datenbank korrekt verbunden ist)
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
  } else {
    console.log("Connected to the database at:", res.rows[0].now);
  }
});
