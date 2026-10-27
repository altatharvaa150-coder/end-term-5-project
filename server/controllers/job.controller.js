import Job from "../models/Job.model.js";
import Application from "../models/Application.model.js";

export const createJob = async (req, res) => {
  try {
    const {
      title, department, description, requirements, location, jobType,
      salaryMin, salaryMax, experienceLevel, skills, assessmentDuration,
      assessmentQuestions, passingScore, deadline, openings, assignedInterviewers,
    } = req.body;

    if (!title || !department || !description) {
      return res.status(400).json({ success: false, message: "Title, department, and description are required" });
    }

    const job = await Job.create({
      title, department, description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split("\n").filter(Boolean) : []),
      location, jobType, salaryMin, salaryMax, experienceLevel,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []),
      assessmentDuration: assessmentDuration || 30,
      assessmentQuestions: assessmentQuestions || [],
      passingScore: passingScore || 60,
      deadline: deadline ? new Date(deadline) : null,
      openings: openings || 1,
      assignedInterviewers: assignedInterviewers || [],
      recruiter: req.user._id,
    });

    res.status(201).json({ success: true, message: "Job created successfully", job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { search, department, jobType, experienceLevel, location } = req.query;
    const filter = { status: "active" };
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { description: regex }, { department: regex }];
    }
    if (department) filter.department = department;
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (location) filter.location = { $regex: location, $options: "i" };

    const jobs = await Job.find(filter)
      .populate("recruiter", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("recruiter", "name email profilePic")
      .populate("assignedInterviewers", "name email profilePic");
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, job: updatedJob });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getJobsForInterviewer = async (req, res) => {
  try {
    const jobs = await Job.find({ assignedInterviewers: req.user._id })
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
