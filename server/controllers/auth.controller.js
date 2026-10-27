import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const user = await User.create({ name, email, password, role: role || "candidate" });
    generateToken(user._id, res);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, message: "Account created successfully", user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    generateToken(user._id, res);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ success: true, message: "Login successful", user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, headline, skills, location, linkedIn } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (headline !== undefined) updates.headline = headline;
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());
    if (location !== undefined) updates.location = location;
    if (linkedIn !== undefined) updates.linkedIn = linkedIn;
    if (req.file) updates.profilePic = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllInterviewers = async (req, res) => {
  try {
    const interviewers = await User.find({ role: "interviewer" }).select("name email profilePic headline");
    res.status(200).json({ success: true, interviewers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
