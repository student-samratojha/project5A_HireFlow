const userModel = require("../db/models/user.model");
const auditModel = require("../db/models/audit.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
async function auditLog(req, action, user) {
  try {
    const audit = new auditModel({
      user: req.user?._id || user?._id || null,
      action: action,
      method: req.method,
      route: req.originalUrl,
      ip: req.ip,
      device: req.headers["user-agent"],
    });
    await audit.save();
  } catch (err) {
    console.log(err);
  }
}

async function getRegister(req, res) {
  try {
    res.render("register");
  } catch (err) {
    console.log(err);
  }
}

async function getlogin(req, res) {
  try {
    res.render("login");
  } catch (err) {
    console.log(err);
  }
}

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      profilePic,
      department,
      skills,
      address,
    } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      await auditLog(req, "Register Failed-User Already Exist", user);
      return res.redirect("/auth/register?Register_Failed_User_Already_Exist");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone: phone ? phone : "",
      profileImage: profilePic ? profilePic : "",
      department: department ? department : "",
      skills: skills?.split(","),
      address: address ? address : "",
    });
    await newUser.save();
    await auditLog(req, "Register Successfull", user);
    return res.redirect("/auth/login?Register_Successfull");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      await auditLog(req, "Login Failed-User Not Found");
      return res.redirect("/auth/login?Login_Failed_User_Not_Found");
    }
    if (user.isDeleted) {
      await auditLog(req, "Login Failed-User Deleted");
      return res.redirect("/auth/login?Login_Failed_User_Deleted");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      await auditLog(req, "Login Failed-Invalid Password");
      return res.redirect("/auth/login?Login_Failed_Invalid_Password");
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
    );
    res.cookie("token", token, { httpOnly: true });
    await auditLog(req, "Login Successfull", user);
    return res.redirect(`/secure/${user.role}?Welcome=${user.role}`);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token");
    await auditLog(req, "Logout Successfull");
    return res.redirect("/auth/login?Logout_Successfull");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

module.exports = {
  getRegister,
  getlogin,
  auditLog,
  register,
  login,
  logout,
};
