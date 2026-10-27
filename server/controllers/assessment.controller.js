import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import { calculateAssessmentScore, getRecommendation } from "../utils/scoreCalculator.js";

export const startAssessment = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate("job", "assessmentQuestions assessmentDuration passingScore");

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (application.assessmentCompleted) {
      return res.status(400).json({ success: false, message: "Assessment already completed" });
    }
    if (application.currentStage !== "Assessment") {
      return res.status(400).json({ success: false, message: "Application is not in Assessment stage" });
    }
    if (!application.assessmentStartedAt) {
      application.assessmentStartedAt = new Date();
      await application.save();
    }

    // Return questions WITHOUT correct answers
    const safeQuestions = application.job.assessmentQuestions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      points: q.points,
    }));

    const timeElapsed = application.assessmentStartedAt
      ? Math.floor((Date.now() - new Date(application.assessmentStartedAt).getTime()) / 1000)
      : 0;
    const totalSeconds = (application.job.assessmentDuration || 30) * 60;
    const timeRemaining = Math.max(0, totalSeconds - timeElapsed);

    res.status(200).json({
      success: true,
      questions: safeQuestions,
      duration: application.job.assessmentDuration,
      timeRemaining,
      startedAt: application.assessmentStartedAt,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body; // array of answer strings indexed by question
    const application = await Application.findById(req.params.applicationId)
      .populate("job", "assessmentQuestions assessmentDuration passingScore");

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (application.assessmentCompleted) {
      return res.status(400).json({ success: false, message: "Assessment already submitted" });
    }

    // Time validation � auto-submit if time exceeded
    const startedAt = application.assessmentStartedAt;
    const durationMs = (application.job.assessmentDuration || 30) * 60 * 1000;
    if (startedAt && Date.now() > new Date(startedAt).getTime() + durationMs + 30000) {
      // 30 second grace period
      return res.status(400).json({ success: false, message: "Assessment time has expired" });
    }

    const score = calculateAssessmentScore(application.job.assessmentQuestions, answers || []);
    const recommendation = getRecommendation(score);
    const passed = score >= (application.job.passingScore || 60);

    application.assessmentScore = score;
    application.assessmentCompleted = true;
    application.assessmentSubmittedAt = new Date();
    application.recommendation = recommendation;

    await application.save();

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      score,
      passed,
      passingScore: application.job.passingScore || 60,
      recommendation,
      timeTaken: startedAt
        ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
        : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssessmentResult = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate("job", "title assessmentDuration passingScore");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    // Only candidate or recruiter can see results
    const isCandidate = application.candidate.toString() === req.user._id.toString();
    const isRecruiter = req.user.role === "recruiter" || req.user.role === "interviewer";
    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({
      success: true,
      assessmentCompleted: application.assessmentCompleted,
      assessmentScore: application.assessmentScore,
      passingScore: application.job?.passingScore || 60,
      passed: application.assessmentScore >= (application.job?.passingScore || 60),
      recommendation: application.recommendation,
      startedAt: application.assessmentStartedAt,
      submittedAt: application.assessmentSubmittedAt,
      timeTaken: application.assessmentStartedAt && application.assessmentSubmittedAt
        ? Math.floor((new Date(application.assessmentSubmittedAt) - new Date(application.assessmentStartedAt)) / 1000)
        : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
