const jwt = require("jsonwebtoken");
const userModel = require("../db/models/user.model");
async function verifyToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.clearCookie("token");
      return res.redirect("/auth/login?Login_Failed_No_Token");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      res.clearCookie("token");
      return res.redirect("/auth/login?Login_Failed_User_Not_Found");
    }
    if (user.isDeleted) {
      res.clearCookie("token");
      return res.redirect("/auth/login?Login_Failed_User_Deleted");
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.clearCookie("token");
    return res.redirect("/auth/login?Login_Failed_Invalid_Token");
  }
}

function allowAccess(allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      if (allowedRoles.includes(userRole)) {
        return next();
      }
      res.clearCookie("token");
      return res.redirect("/auth/login?Login_Failed_Invalid_Role");
    } catch (err) {
      console.log(err);
      res.clearCookie("token");
      return res.redirect("/auth/login?Login_Failed_Invalid_Role");
    }
  };
}

module.exports = {
  verifyToken,
  allowAccess,
};
