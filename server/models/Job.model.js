import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ["mcq", "text"], default: "mcq" },
  options: [{ type: String }],
  correctAnswer: { type: String },
  points: { type: Number, default: 10 },
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  location: { type: String, default: "Remote" },
  jobType: { type: String, enum: ["full-time", "part-time", "contract", "internship"], default: "full-time" },
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  experienceLevel: { type: String, enum: ["entry", "mid", "senior", "lead"], default: "mid" },
  skills: [{ type: String }],
  stages: {
    type: [String],
    default: ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"],
  },
  assessmentDuration: { type: Number, default: 30 }, // in minutes
  assessmentQuestions: [questionSchema],
  passingScore: { type: Number, default: 60 }, // percentage
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedInterviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["draft", "active", "paused", "closed"], default: "active" },
  deadline: { type: Date },
  openings: { type: Number, default: 1 },
  applicationCount: { type: Number, default: 0 },
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);
export default Job;
