const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, checkAdminExists } = require("../controllers/authController");

router.get("/check", checkAdminExists);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

module.exports = router;
