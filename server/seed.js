import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "./models/User.model.js";
import Job from "./models/Job.model.js";
import Application from "./models/Application.model.js";
import Evaluation from "./models/Evaluation.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Clear existing data for fresh demo state
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Evaluation.deleteMany({});
    console.log("Cleared old collections.");

    // 1. Create Users
    const recruiter = await User.create({
      name: "Sarah Jenkins",
      email: "recruiter@demo.com",
      password: "demo123",
      role: "recruiter",
      headline: "Senior Talent Acquisition Partner @ TechCorp",
      location: "San Francisco, CA"
    });

    const interviewer = await User.create({
      name: "David Chen",
      email: "interviewer@demo.com",
      password: "demo123",
      role: "interviewer",
      headline: "Principal Systems Architect",
      skills: ["React", "Node.js", "System Design", "Cloud Architecture"],
      location: "Seattle, WA"
    });

    const candidate = await User.create({
      name: "Alex Rivera",
      email: "candidate@demo.com",
      password: "demo123",
      role: "candidate",
      headline: "Full-Stack Engineer (3+ Years Experience)",
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "TailwindCSS"],
      location: "New York, NY",
      resumeUrl: "https://example.com/alex-rivera-resume.pdf"
    });

    console.log("Created 3 demo users (recruiter, interviewer, candidate)");

    // 2. Create Jobs
    const job1 = await Job.create({
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      description: "We are looking for an experienced Senior Full-Stack Engineer to lead the architecture and scaling of our distributed web applications. You will collaborate with product, design, and infrastructure teams to deliver high-impact user experiences.",
      requirements: [
        "4+ years of production experience with React and Node.js",
        "Deep understanding of MongoDB schema design and indexing",
        "Experience building and consuming RESTful & GraphQL APIs",
        "Strong knowledge of authentication flows, security, and web performance"
      ],
      location: "Remote",
      jobType: "full-time",
      salaryMin: 120000,
      salaryMax: 160000,
      experienceLevel: "senior",
      skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
      stages: ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"],
      assessmentDuration: 25,
      passingScore: 70,
      recruiter: recruiter._id,
      assignedInterviewers: [interviewer._id],
      status: "active",
      openings: 2,
      applicationCount: 1,
      assessmentQuestions: [
        {
          questionText: "What is the primary benefit of database indexing in MongoDB?",
          type: "mcq",
          options: [
            "Reduces disk space usage",
            "Improves query execution time by avoiding full collection scans",
            "Encrypts sensitive document attributes automatically",
            "Enforces strict data types on all documents"
          ],
          correctAnswer: "Improves query execution time by avoiding full collection scans",
          points: 10
        },
        {
          questionText: "In React, which hook is best suited for memoizing complex computed values?",
          type: "mcq",
          options: ["useCallback", "useMemo", "useRef", "useEffect"],
          correctAnswer: "useMemo",
          points: 10
        },
        {
          questionText: "What status code should an API return when an authentication token is expired?",
          type: "mcq",
          options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"],
          correctAnswer: "401 Unauthorized",
          points: 10
        },
        {
          questionText: "Explain how you would handle race conditions in an inventory reservation system.",
          type: "text",
          points: 20
        }
      ]
    });

    const job2 = await Job.create({
      title: "Product Designer (UI/UX)",
      department: "Design",
      description: "Join our design system team crafting next-generation digital interfaces. You will conduct user research, produce high-fidelity Figma components, and partner with front-end engineers to implement pixel-perfect user flows.",
      requirements: [
        "3+ years product design experience with web and mobile platforms",
        "Expertise in Figma design systems, auto-layout, and prototyping",
        "Strong portfolio demonstrating end-to-end user research to final UI"
      ],
      location: "New York, NY (Hybrid)",
      jobType: "full-time",
      salaryMin: 95000,
      salaryMax: 130000,
      experienceLevel: "mid",
      skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
      stages: ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"],
      assessmentDuration: 20,
      passingScore: 60,
      recruiter: recruiter._id,
      assignedInterviewers: [interviewer._id],
      status: "active",
      openings: 1,
      applicationCount: 0,
      assessmentQuestions: [
        {
          questionText: "Which UX principle states that time to acquire a target is a function of distance and size?",
          type: "mcq",
          options: ["Hick's Law", "Fitts's Law", "Miller's Law", "Jakob's Law"],
          correctAnswer: "Fitts's Law",
          points: 10
        }
      ]
    });

    console.log("Created 2 demo jobs");

    // 3. Create Sample Application for Alex Rivera in Interview stage
    const application = await Application.create({
      job: job1._id,
      candidate: candidate._id,
      currentStage: "Interview",
      status: "active",
      coverLetter: "I have 4 years of experience building modern web applications with React and Node.js. I'm excited about HireStream's mission!",
      resumeUrl: "https://example.com/alex-rivera-resume.pdf",
      expectedSalary: 135000,
      noticePeriod: 30,
      assessmentScore: 90,
      assessmentCompleted: true,
      assessmentStartedAt: new Date(Date.now() - 3600 * 1000 * 48),
      assessmentSubmittedAt: new Date(Date.now() - 3600 * 1000 * 47),
      recruiterNotes: "Strong candidate with solid portfolio. Excellent performance in technical assessment.",
      stageHistory: [
        { stage: "Applied", movedAt: new Date(Date.now() - 3600 * 1000 * 72), notes: "Applied via career site" },
        { stage: "Screening", movedAt: new Date(Date.now() - 3600 * 1000 * 50), movedBy: recruiter._id, notes: "Resume passed screening" },
        { stage: "Assessment", movedAt: new Date(Date.now() - 3600 * 1000 * 48), movedBy: recruiter._id, notes: "Invited to technical quiz" },
        { stage: "Interview", movedAt: new Date(Date.now() - 3600 * 1000 * 24), movedBy: recruiter._id, notes: "Passed assessment with 90% score" }
      ]
    });

    console.log("Created demo application in Interview stage");

    // 4. Create Evaluation from David Chen
    await Evaluation.create({
      application: application._id,
      job: job1._id,
      interviewer: interviewer._id,
      criteria: [
        { name: "Technical Proficiency", weight: 35, score: 9, comment: "Deep grasp of React architecture and asynchronous Node.js patterns" },
        { name: "System Design", weight: 25, score: 8, comment: "Articulated clean caching and horizontal scaling strategy" },
        { name: "Problem Solving", weight: 20, score: 9, comment: "Quickly debugged and optimized the data flow scenario" },
        { name: "Communication & Culture", weight: 20, score: 9, comment: "Crisp communication, highly collaborative demeanor" }
      ],
      recommendation: "strong_hire",
      strengths: "Fast problem solver, understands distributed systems, articulate communicator.",
      weaknesses: "Slightly less hands-on with Kubernetes, but eager to learn.",
      generalNotes: "Strong recommendation to extend an offer. Candidate will be a great senior contributor.",
      interviewDuration: 60
    });

    console.log("Created demo evaluation");

    console.log("\n========================================================");
    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
    console.log("========================================================");
    console.log("You can now login with any of the following accounts:");
    console.log("1. Recruiter:   recruiter@demo.com   | password: demo123");
    console.log("2. Interviewer: interviewer@demo.com | password: demo123");
    console.log("3. Candidate:   candidate@demo.com   | password: demo123");
    console.log("========================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
