// Benutzerinfos abrufen
// Akualisiern der Benutzerinfos
//... weitere
// User infos abrufen

const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authenticatUser");
const {
  registerSportclass,
  userInfo,
  newUser,
  checkUserStatus,
  getAllSportClasses,
  deleteSportClasses,
  getAllUnusedSportClasses,
  userStatistics,
} = require("../controllers/userController");

router.get("/authcheck", authenticateUser, checkUserStatus);
//router.get("/infoUser, authenticateUser, getUserInfo");
router.get("/current", authenticateUser, userInfo);
router.post("/new", authenticateUser, authorizePermissions("admin"), newUser);
router.get("/sportclasses", authenticateUser, getAllSportClasses);
router.get("/unusedclasses", authenticateUser, getAllUnusedSportClasses);
router.delete("/deleteclasses", authenticateUser, deleteSportClasses);
router.route("/registersportclass").post(authenticateUser, registerSportclass);
router.get("/statistics", authenticateUser, userStatistics);

module.exports = router;
