const auditModel = require("../db/models/audit.model");
const candidateModel = require("../db/models/candidate.model");
const userModel = require("../db/models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auditLog } = require("./auth.controller");
async function getAddInterViewer(req, res) {
  try {
    res.render("addInterviewer");
  } catch (err) {
    console.log(err);
  }
}

async function addInterViewer(req, res) {
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
      return res.redirect(
        "/secure/addInterviewer?Register_Failed_User_Already_Exist",
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const interviewer = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      profileImage: profilePic,
      department,
      skills,
      address,
      role: "interviewer",
    });
    await auditLog(req, "Interviewer Added Successfully");
    return res.redirect("/secure/admin?Interviewer_Added_Successfully");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function getAddCandidate(req, res) {
  try {
    const interviewers = await userModel.find({
      role: "interviewer",
      isDeleted: false,
    });
    const candidates = await userModel.find({
      role: "candidate",
      isDeleted: false,
    });
    res.render("addCandidate", { interviewers, candidates });
  } catch (err) {
    console.log(err);
  }
}

async function addCandidate(req, res) {
  try {
    const { interviewer, candidate, position, experience, interviewDate } =
      req.body;
    const candidateData = await candidateModel.create({
      interviewer,
      candidate,
      position,
      experience,
      interviewDate,
    });
    await candidateData.save();
    await auditLog(req, "Candidate Added Successfully");
    return res.redirect("/secure/admin?Candidate_Added_Successfully");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function deleteCandidate(req, res) {
  try {
    const { id } = req.body;
    const candidate = await userModel.findById(id);
    if (!candidate) {
      await auditLog(req, "Candidate Not Found");
      return res.redirect("/secure/admin?Candidate_Not_Found");
    }
    const candi = await candidateModel.findOne({ candidate: id });
    if (candi) {
      await auditLog(req, "Candidate Deletion Failed-Interview Scheduled");
      return res.redirect(
        "/secure/admin?Candidate_Deletion_Failed_Interview_Scheduled",
      );
    }
    candidate.isDeleted = true;
    await candidate.save();
    res.redirect("/secure/admin?candidate_deleted");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function deleteInterviewer(req, res) {
  try {
    const { id } = req.body;
    const interviewer = await userModel.findById(id);
    const candi = await candidateModel.findOne({ interviewer: id });
    if (!interviewer) {
      await auditLog(req, "Interviewer Not Found");
      return res.redirect("/secure/admin?Interviewer_Not_Found");
    }
    if (candi) {
      await auditLog(req, "Interviewer Deletion Failed-Interview Scheduled");
      return res.redirect(
        "/secure/admin?Interviewer_Deletion_Failed_Interview_Scheduled",
      );
    }
    interviewer.isDeleted = true;
    await interviewer.save();
    res.redirect("/secure/admin?interviewer_deleted");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function restoreCandidate(req, res) {
  try {
    const { id } = req.body;
    const candidate = await userModel.findById(id);
    if (!candidate) {
      await auditLog(req, "Candidate Restore Failed-Candidate Not Found");
      return res.redirect(
        "/secure/admin?Candidate_Restore_Failed_Candidate_Not_Found",
      );
    }
    candidate.isDeleted = false;
    await candidate.save();
    await auditLog(req, "Candidate Restored Successfully");
    return res.redirect("/secure/admin?Candidate_Restored_Successfully");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function restoreInterviewer(req, res) {
  try {
    const { id } = req.body;
    const interviewer = await userModel.findById(id);
    if (!interviewer) {
      await auditLog(req, "Interviewer Restore Failed-Interviewer Not Found");
      return res.redirect(
        "/secure/admin?Interviewer_Restore_Failed_Interviewer_Not_Found",
      );
    }
    interviewer.isDeleted = false;
    await interviewer.save();
    await auditLog(req, "Interviewer Restored Successfully");
    return res.redirect("/secure/admin?Interviewer_Restored_Successfully");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function getAdmin(req, res) {
  try {
    const interviewers = await userModel.find({
      role: "interviewer",
    });
    const candidates = await userModel.find({
      role: "candidate",
    });
    const audit = await auditModel
      .find()
      .populate("user")
      .limit(10)
      .sort({ createdAt: -1 });
    const scheduledInterviews = await candidateModel
      .find({
        status: "Pending",
      })
      .populate("interviewer candidate");
    res.render("admin", {
      interviewers,
      candidates,
      audit,
      scheduledInterviews,
    });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function getCandidate(req, res) {
  try {
    const interview = await candidateModel
      .find({ candidate: req.user._id })
      .populate("interviewer");
    res.render("candidate", { candidate: req.user, interview });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function getInterviewer(req, res) {
  try {
    const interview = await candidateModel
      .find({ interviewer: req.user._id })
      .populate("candidate");
    res.render("interviewer", { interviewer: req.user, interview });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function getInterviewRoom(req, res) {
  try {
    const { id } = req.params;
    const interview = await candidateModel.findById(id);
    if (interview.interviewDate !== new Date().toISOString().split("T")[0]) {
      return res.redirect("/secure/interviewer?Time_Not_Proper");
    }
    res.render("interviewRoom", { interview });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

async function updateStatusByInterviewer(req, res) {
  try {
    const { id, status, notes } = req.body;
    const candidate = await candidateModel.findById(id);
    if (!candidate) {
      await auditLog(req, "Update Status Failed-Candidate Not Found");
      return res.redirect(
        "/secure/interviewer?Update_Status_Failed_Candidate_Not_Found",
      );
    }
    candidate.status = status;
    candidate.notes = notes;
    await candidate.save();
    await auditLog(req, "Update Status Successfull");
    return res.redirect("/secure/interviewer?Update_Status_Successfull");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
}

module.exports = {
  getAddCandidate,
  addCandidate,
  deleteCandidate,
  restoreCandidate,
  getAddInterViewer,
  addInterViewer,
  getInterviewRoom,
  deleteInterviewer,
  restoreInterviewer,
  getAdmin,
  getCandidate,
  getInterviewer,
  updateStatusByInterviewer,
};
