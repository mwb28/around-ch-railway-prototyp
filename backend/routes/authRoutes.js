const express = require("express");
const router = express.Router();
const {
  loginUser,
  changePassword,
  logoutUser,
} = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authenticatUser");

//router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/changePassword", changePassword);
router.post("/logout", authenticateUser, logoutUser);
module.exports = router;
