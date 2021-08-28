const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const {
  findAllUser,
  createUser,
  validateUser,
  updateUser,
  deleteUser,
} = require("../controllers/UserController");

router.get("", findAllUser);
router.post("", validateUser("createUser"), createUser);
router.put("/:id", auth, validateUser("updateUser"), updateUser);
router.delete("/:id", auth, deleteUser);

module.exports = router;
