import Evaluation from "../models/Evaluation.model.js";
import Application from "../models/Application.model.js";
import { calculateWeightedScore, getRecommendation } from "../utils/scoreCalculator.js";

const DEFAULT_CRITERIA = [
  { name: "Technical Skills", weight: 35 },
  { name: "Problem Solving", weight: 25 },
  { name: "Communication", weight: 20 },
  { name: "System Design", weight: 20 },
];

export const submitEvaluation = async (req, res) => {
  try {
    const { applicationId, criteria, recommendation, strengths, weaknesses, generalNotes, interviewDuration } = req.body;
    if (!applicationId || !criteria || !recommendation) {
      return res.status(400).json({ success: false, message: "applicationId, criteria, and recommendation are required" });
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (application.currentStage !== "Interview") {
      return res.status(400).json({ success: false, message: "Application is not in Interview stage" });
    }

    // Check interviewer is assigned
    const isAssigned = application.job.assignedInterviewers.some(
      (id) => id.toString() === req.user._id.toString()
    );
    const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();
    if (!isAssigned && !isRecruiter) {
      return res.status(403).json({ success: false, message: "You are not assigned to evaluate this application" });
    }

    // Check if already submitted
    const existing = await Evaluation.findOne({ application: applicationId, interviewer: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: "You have already submitted an evaluation for this application" });

    const overallScore = calculateWeightedScore(criteria);
    const evaluation = await Evaluation.create({
      application: applicationId,
      job: application.job._id,
      interviewer: req.user._id,
      criteria,
      overallScore,
      recommendation,
      strengths: strengths || "",
      weaknesses: weaknesses || "",
      generalNotes: generalNotes || "",
      interviewDuration: interviewDuration || 60,
    });

    // Update application interview score (average of all evaluations)
    const allEvals = await Evaluation.find({ application: applicationId });
    const avgScore = allEvals.reduce((sum, e) => sum + e.overallScore, 0) / allEvals.length;
    application.interviewScore = parseFloat(avgScore.toFixed(2));
    application.recommendation = recommendation;
    await application.save();

    res.status(201).json({ success: true, message: "Evaluation submitted", evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEvaluationsByApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId).populate("job");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();
    const isInterviewer = req.user.role === "interviewer";
    if (!isRecruiter && !isInterviewer) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const evaluations = await Evaluation.find({ application: req.params.applicationId })
      .populate("interviewer", "name email profilePic");
    res.status(200).json({ success: true, evaluations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDefaultCriteria = (req, res) => {
  res.status(200).json({ success: true, criteria: DEFAULT_CRITERIA });
};

export const getInterviewerEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ interviewer: req.user._id })
      .populate("application", "currentStage status candidate")
      .populate("job", "title department")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, evaluations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
