import express from "express";
import { submitEvaluation, getEvaluationsByApplication, getDefaultCriteria, getInterviewerEvaluations } from "../controllers/evaluation.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/criteria", protect, getDefaultCriteria);
router.get("/my", protect, authorizeRoles("interviewer"), getInterviewerEvaluations);
router.post("/", protect, authorizeRoles("interviewer", "recruiter"), submitEvaluation);
router.get("/:applicationId", protect, getEvaluationsByApplication);

export default router;
