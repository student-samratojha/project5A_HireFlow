const router = require("express").Router();
const {
  getRegister,
  getlogin,
  register,
  login,
  logout,
} = require("../controllers/auth.controller");
router.get("/register", getRegister);
router.get("/login", getlogin);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;