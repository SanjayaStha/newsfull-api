const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  validateProfile,
} = require("../controllers/ProfileController.js");

router.get("", auth, getProfile);
router.post("", auth, updateProfile);
router.post("/avatar", auth, updateAvatar);

router.post(
  "/change_password",
  auth,
  validateProfile("changepassword"),
  changePassword
);

module.exports = router;
