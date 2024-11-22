require("dotenv").config();
const pool = require("../db/connect");

// routes
const authRoutes = require("../routes/authRoutes");
const challengeRoutes = require("../routes/challengeRoutes");
const userRoutes = require("../routes/userRoutes");

// express

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static("../frontend"));

app.use("/api/v1/auth", authRoutes); // Authentication routes (register/login)
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
