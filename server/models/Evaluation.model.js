import mongoose from "mongoose";

const criterionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true }, // percentage weight e.g., 30
  score: { type: Number, min: 1, max: 10, required: true },
  comment: { type: String, default: "" },
});

const evaluationSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  criteria: [criterionSchema],
  overallScore: { type: Number }, // computed from criteria weights
  recommendation: {
    type: String,
    enum: ["strong_hire", "hire", "lean_hire", "no_hire", "strong_no_hire"],
    required: true,
  },
  strengths: { type: String, default: "" },
  weaknesses: { type: String, default: "" },
  generalNotes: { type: String, default: "" },
  interviewDuration: { type: Number, default: 60 }, // minutes
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-calculate overall score before save
evaluationSchema.pre("save", function () {
  if (this.criteria && this.criteria.length > 0) {
    const totalWeight = this.criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedScore = this.criteria.reduce((sum, c) => sum + (c.score * c.weight), 0);
    this.overallScore = parseFloat((weightedScore / totalWeight).toFixed(2));
  }
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
export default Evaluation;
