import express from "express";
import {
  applyToJob, getCandidateApplications, getApplicationsByJob,
  getApplicationById, moveApplicationStage, rejectApplication,
  makeOffer, respondToOffer,
} from "../controllers/application.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/apply", protect, authorizeRoles("candidate"), applyToJob);
router.get("/my", protect, authorizeRoles("candidate"), getCandidateApplications);
router.get("/job/:jobId", protect, authorizeRoles("recruiter", "interviewer"), getApplicationsByJob);
router.get("/:id", protect, getApplicationById);
router.put("/:id/stage", protect, authorizeRoles("recruiter"), moveApplicationStage);
router.put("/:id/reject", protect, authorizeRoles("recruiter"), rejectApplication);
router.post("/:id/offer", protect, authorizeRoles("recruiter"), makeOffer);
router.put("/:id/offer/respond", protect, authorizeRoles("candidate"), respondToOffer);

export default router;
