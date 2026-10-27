import express from "express";
import { register, login, logout, getProfile, updateProfile, getAllInterviewers } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/interviewers", protect, getAllInterviewers);

export default router;
