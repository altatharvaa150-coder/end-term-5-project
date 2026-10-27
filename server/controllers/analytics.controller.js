import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import Evaluation from "../models/Evaluation.model.js";

export const getRecruiterAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id });
    const jobIds = jobs.map((j) => j._id);

    const allApplications = await Application.find({ job: { $in: jobIds } });

    // Pipeline funnel: count per stage
    const stageCounts = {
      Applied: 0, Screening: 0, Assessment: 0, Interview: 0, Offer: 0, Hired: 0,
    };
    allApplications.forEach((a) => {
      if (stageCounts[a.currentStage] !== undefined) stageCounts[a.currentStage]++;
    });

    // Status breakdown
    const statusCounts = { active: 0, rejected: 0, withdrawn: 0, hired: 0 };
    allApplications.forEach((a) => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status]++;
    });

    // Time to hire (avg days from applied to hired)
    const hiredApps = allApplications.filter((a) => a.status === "hired");
    let avgTimeToHire = 0;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((sum, a) => {
        const appliedDate = new Date(a.createdAt);
        const hiredHistory = a.stageHistory.find((h) => h.stage === "Hired");
        if (hiredHistory) {
          return sum + Math.floor((new Date(hiredHistory.movedAt) - appliedDate) / (1000 * 60 * 60 * 24));
        }
        return sum;
      }, 0);
      avgTimeToHire = parseFloat((totalDays / hiredApps.length).toFixed(1));
    }

    // Assessment pass rate
    const completedAssessments = allApplications.filter((a) => a.assessmentCompleted);
    const passedAssessments = completedAssessments.filter((a) => a.assessmentScore >= 60);
    const assessmentPassRate = completedAssessments.length > 0
      ? parseFloat(((passedAssessments.length / completedAssessments.length) * 100).toFixed(1))
      : 0;

    // Per-job stats
    const jobStats = await Promise.all(
      jobs.map(async (job) => {
        const apps = allApplications.filter((a) => a.job.toString() === job._id.toString());
        const hired = apps.filter((a) => a.status === "hired").length;
        return {
          jobId: job._id,
          title: job.title,
          department: job.department,
          totalApplications: apps.length,
          hired,
          active: apps.filter((a) => a.status === "active").length,
          rejected: apps.filter((a) => a.status === "rejected").length,
          conversionRate: apps.length > 0 ? parseFloat(((hired / apps.length) * 100).toFixed(1)) : 0,
        };
      })
    );

    // Recommendation distribution
    const recommendations = {};
    allApplications.forEach((a) => {
      if (a.recommendation && a.recommendation !== "pending") {
        recommendations[a.recommendation] = (recommendations[a.recommendation] || 0) + 1;
      }
    });

    // Applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentApps = allApplications.filter((a) => new Date(a.createdAt) >= thirtyDaysAgo);
    const dailyCounts = {};
    recentApps.forEach((a) => {
      const day = new Date(a.createdAt).toISOString().split("T")[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });
    const applicationsOverTime = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      analytics: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === "active").length,
        totalApplications: allApplications.length,
        stageCounts,
        statusCounts,
        avgTimeToHire,
        assessmentPassRate,
        hiredCount: hiredApps.length,
        jobStats,
        recommendations,
        applicationsOverTime,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInterviewerStats = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ interviewer: req.user._id });
    const avgScore = evaluations.length > 0
      ? parseFloat((evaluations.reduce((s, e) => s + e.overallScore, 0) / evaluations.length).toFixed(2))
      : 0;
    const recDist = {};
    evaluations.forEach((e) => { recDist[e.recommendation] = (recDist[e.recommendation] || 0) + 1; });
    res.status(200).json({ success: true, stats: { totalEvaluations: evaluations.length, avgScore, recDist } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
