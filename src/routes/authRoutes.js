const express = require("express");
const router = express.Router();

const {
  userLogin,
  registerUser,
  validateUserRegister,
} = require("../controllers/AuthController");

router.post("/login", userLogin);

router.post("/register", validateUserRegister, registerUser);

router.get("/", (req,res)=>{
  res.send("Auth");
  
})
module.exports = router;
