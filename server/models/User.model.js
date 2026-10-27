import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["recruiter", "candidate", "interviewer"], default: "candidate" },
  profilePic: { type: String, default: "" },
  headline: { type: String, default: "" },
  skills: [{ type: String }],
  resumeUrl: { type: String, default: "" },
  location: { type: String, default: "" },
  linkedIn: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
