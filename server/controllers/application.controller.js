import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import { isValidStageTransition, PIPELINE_STAGES } from "../utils/scoreCalculator.js";

export const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter, expectedSalary, noticePeriod } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: "Job ID is required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.status !== "active") return res.status(400).json({ success: false, message: "This job is no longer accepting applications" });
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ success: false, message: "Application deadline has passed" });
    }

    const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: "You have already applied to this job" });

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter: coverLetter || "",
      resumeUrl: req.user.resumeUrl || "",
      expectedSalary: expectedSalary || null,
      noticePeriod: noticePeriod || 0,
      stageHistory: [{ stage: "Applied", movedBy: req.user._id, notes: "Application submitted" }],
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    const populated = await application.populate([
      { path: "job", select: "title department" },
      { path: "candidate", select: "name email" },
    ]);

    res.status(201).json({ success: true, message: "Application submitted successfully", application: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already applied to this job" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate("job", "title department location jobType salaryMin salaryMax recruiter status")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getApplicationsByJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const isRecruiter = job.recruiter.toString() === req.user._id.toString();
    const isAssignedInterviewer = job.assignedInterviewers.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isRecruiter && !isAssignedInterviewer) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { stage, status } = req.query;
    const filter = { job: req.params.jobId };
    if (stage) filter.currentStage = stage;
    if (status) filter.status = status;

    // Interviewers can only see interview-stage applications
    if (!isRecruiter && isAssignedInterviewer) {
      filter.currentStage = "Interview";
      filter.status = "active";
    }

    const applications = await Application.find(filter)
      .populate("candidate", "name email profilePic skills headline location resumeUrl")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("job", "title department assessmentQuestions assessmentDuration passingScore stages recruiter assignedInterviewers")
      .populate("candidate", "name email profilePic skills headline location resumeUrl linkedIn")
      .populate("stageHistory.movedBy", "name role");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    res.status(200).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const moveApplicationStage = async (req, res) => {
  try {
    const { newStage, notes } = req.body;
    const application = await Application.findById(req.params.id).populate("job");

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (!PIPELINE_STAGES.includes(newStage)) {
      return res.status(400).json({ success: false, message: "Invalid stage" });
    }

    // Enforce stage machine: can only move forward/backward by 1
    if (!isValidStageTransition(application.currentStage, newStage)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move from '${application.currentStage}' to '${newStage}'. Stages must be sequential.`,
      });
    }

    // Assessment stage guard
    if (newStage === "Interview" && !application.assessmentCompleted) {
      return res.status(400).json({
        success: false,
        message: "Candidate must complete the assessment before moving to Interview stage",
      });
    }

    application.currentStage = newStage;
    application.stageHistory.push({ stage: newStage, movedBy: req.user._id, notes: notes || "" });

    if (newStage === "Hired") application.status = "hired";

    await application.save();
    res.status(200).json({ success: true, message: `Moved to ${newStage}`, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const { notes } = req.body;
    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    application.status = "rejected";
    application.recruiterNotes = notes || "";
    application.stageHistory.push({ stage: application.currentStage, movedBy: req.user._id, notes: "Application rejected" });
    await application.save();
    res.status(200).json({ success: true, message: "Application rejected", application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const makeOffer = async (req, res) => {
  try {
    const { baseSalary, bonus, equity, joiningDate, expiryDate } = req.body;
    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (application.currentStage !== "Offer") {
      return res.status(400).json({ success: false, message: "Application must be in Offer stage first" });
    }
    application.offerDetails = { baseSalary, bonus, equity, joiningDate, expiryDate, offerStatus: "pending" };
    await application.save();
    res.status(200).json({ success: true, message: "Offer created", application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const respondToOffer = async (req, res) => {
  try {
    const { response } = req.body; // "accepted" | "declined" | "negotiating"
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (!application.offerDetails) return res.status(400).json({ success: false, message: "No offer found" });
    application.offerDetails.offerStatus = response;
    if (response === "accepted") {
      application.currentStage = "Hired";
      application.status = "hired";
      application.stageHistory.push({ stage: "Hired", movedBy: req.user._id, notes: "Offer accepted" });
    }
    await application.save();
    res.status(200).json({ success: true, message: `Offer ${response}`, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
