import mongoose from "mongoose";

const STAGES = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];

const stageHistorySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  movedAt: { type: Date, default: Date.now },
  movedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String, default: "" },
});

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currentStage: { type: String, enum: STAGES, default: "Applied" },
  stageHistory: [stageHistorySchema],
  status: { type: String, enum: ["active", "rejected", "withdrawn", "hired"], default: "active" },
  coverLetter: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  expectedSalary: { type: Number },
  noticePeriod: { type: Number, default: 0 }, // days
  assessmentScore: { type: Number, default: null },
  assessmentCompleted: { type: Boolean, default: false },
  assessmentStartedAt: { type: Date },
  assessmentSubmittedAt: { type: Date },
  interviewScore: { type: Number, default: null },
  recommendation: { type: String, enum: ["strong_hire", "hire", "lean_hire", "no_hire", "strong_no_hire", "pending"], default: "pending" },
  recruiterNotes: { type: String, default: "" },
  offerDetails: {
    baseSalary: { type: Number },
    bonus: { type: Number },
    equity: { type: String },
    joiningDate: { type: Date },
    expiryDate: { type: Date },
    offerStatus: { type: String, enum: ["pending", "accepted", "declined", "negotiating"], default: "pending" },
  },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
