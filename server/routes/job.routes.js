import express from "express";
import { createJob, getAllJobs, getJobById, getRecruiterJobs, updateJob, deleteJob, getJobsForInterviewer } from "../controllers/job.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/my", protect, authorizeRoles("recruiter"), getRecruiterJobs);
router.get("/interviewer", protect, authorizeRoles("interviewer"), getJobsForInterviewer);
router.get("/:id", getJobById);
router.post("/", protect, authorizeRoles("recruiter"), createJob);
router.put("/:id", protect, authorizeRoles("recruiter"), updateJob);
router.delete("/:id", protect, authorizeRoles("recruiter"), deleteJob);

export default router;
