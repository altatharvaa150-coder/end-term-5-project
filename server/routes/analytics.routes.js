import express from "express";
import { getRecruiterAnalytics, getInterviewerStats } from "../controllers/analytics.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/recruiter", protect, authorizeRoles("recruiter"), getRecruiterAnalytics);
router.get("/interviewer", protect, authorizeRoles("interviewer"), getInterviewerStats);

export default router;
