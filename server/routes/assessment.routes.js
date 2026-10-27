import express from "express";
import { startAssessment, submitAssessment, getAssessmentResult } from "../controllers/assessment.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:applicationId/start", protect, authorizeRoles("candidate"), startAssessment);
router.post("/:applicationId/submit", protect, authorizeRoles("candidate"), submitAssessment);
router.get("/:applicationId/result", protect, getAssessmentResult);

export default router;
