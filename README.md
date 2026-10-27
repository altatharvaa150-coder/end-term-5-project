# ⚡ HireStream — Collaborative Recruitment & Candidate Assessment Pipeline

![HireStream](https://img.shields.io/badge/HireStream-Recruitment%20Platform-6366f1?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

---

## 📌 Problem Statement

Hiring is broken. Most small-to-mid companies manage recruitment through spreadsheets, scattered emails, and inconsistent interview feedback. There's no single system that handles:

- **Multi-stage pipeline tracking** (Applied → Screening → Assessment → Interview → Offer → Hired)
- **Automated candidate screening** via timed assessments with auto-grading
- **Structured interview evaluations** with weighted scoring criteria
- **Data-driven hiring decisions** backed by analytics and recommendations

**HireStream** solves this by providing a complete, end-to-end recruitment pipeline platform.

---

## 🎯 Target Users

| Role | What They Do |
|------|-------------|
| **Recruiters** | Post jobs, design assessments, manage pipeline stages, make offers |
| **Candidates** | Browse jobs, apply, take timed assessments, accept/decline offers |
| **Interviewers** | Evaluate candidates with weighted scorecards, provide structured feedback |

---

## 💡 Solution

HireStream is a full-stack MERN application that digitizes the entire recruitment workflow:

1. **Recruiters** create job postings with customizable assessment questions (MCQ/text)
2. **Candidates** discover, apply, and take timed auto-graded assessments
3. **Recruiters** manage a visual pipeline and advance/reject candidates through stages
4. **Interviewers** submit structured evaluations with weighted criteria (Technical Skills, Problem Solving, Communication, System Design)
5. **Recruiters** view analytics dashboards with pipeline funnels, recommendation distributions, and hiring metrics
6. **Offers** are generated with salary breakdowns and candidates accept/decline/negotiate

---

## 🔄 Key Workflows

### Workflow 1: Job Creation & Assessment Design
```
Recruiter → Create Job → Define Requirements →
Add MCQ/Text Questions → Set Timer & Passing Score →
Assign Interviewers → Publish
```

### Workflow 2: Candidate Application & Automated Assessment
```
Candidate → Browse Jobs → Apply with Cover Letter →
Recruiter moves to Assessment Stage →
Candidate takes Timed Test → Auto-Graded →
Score & Recommendation Calculated
```

### Workflow 3: Pipeline Stage Management (State Machine)
```
Applied → Screening → Assessment → Interview → Offer → Hired
        ↗ (reject at any stage)
Stages are sequential — can't skip. Assessment must be completed before Interview.
```

### Workflow 4: Structured Interview Evaluation
```
Interviewer → View Candidate Profile → Rate Criteria (1-10) →
Weighted Score Auto-Calculated → Select Recommendation →
Submit Strengths/Weaknesses Feedback
```

### Workflow 5: Offer Management & Analytics
```
Recruiter → Create Offer (Salary + Bonus + Equity) → Send to Candidate →
Candidate Accepts/Declines/Negotiates →
Dashboard shows Funnel, Time-to-Hire, Pass Rates
```

---

## ✨ Key Features

- 🔐 **JWT Cookie Authentication** with role-based authorization (Recruiter/Candidate/Interviewer)
- 📋 **Job Posting** with customizable multi-stage pipelines
- 📝 **Timed Assessments** with MCQ/text questions, auto-grading, and countdown timer
- 🔄 **State Machine Pipeline** — enforced sequential stage transitions
- ⭐ **Weighted Interview Scorecards** — Technical Skills (35%), Problem Solving (25%), Communication (20%), System Design (20%)
- 💰 **Offer Generation** — salary breakdown with accept/decline/negotiate
- 📊 **Analytics Dashboard** — pipeline funnel, application trends, recommendation distribution, per-job stats
- 🔍 **Job Search & Filters** — by department, type, experience level
- 🎨 **Premium Dark UI** — glassmorphism, micro-animations, responsive design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v7, Recharts, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express 5, Mongoose ODM |
| **Database** | MongoDB Atlas |
| **Auth** | JWT (HttpOnly cookies), bcrypt |
| **Media** | Cloudinary (profile images) |
| **Styling** | Custom CSS Design System (dark theme, CSS variables) |

---

## 🏗️ Architecture

```
hirestream/
├── server/                    # Express Backend
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── models/
│   │   ├── User.model.js      # User schema (roles, auth)
│   │   ├── Job.model.js       # Job + embedded assessment questions
│   │   ├── Application.model.js # Application + stage history + offers
│   │   └── Evaluation.model.js # Interview scorecard + criteria
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── job.controller.js
│   │   ├── application.controller.js
│   │   ├── assessment.controller.js
│   │   ├── evaluation.controller.js
│   │   └── analytics.controller.js
│   ├── routes/                # 6 route files
│   ├── middlewares/
│   │   └── auth.middleware.js  # JWT verify + role authorization
│   ├── utils/
│   │   ├── generateToken.js    # JWT token + cookie
│   │   └── scoreCalculator.js  # Assessment scoring + stage validation
│   └── index.js               # Express app entry
│
└── client/hirestream-frontend/ # React Frontend
    └── src/
        ├── context/AuthContext.jsx
        ├── services/          # 7 API service files
        ├── components/
        │   ├── Layout.jsx     # Sidebar + role-based nav
        │   └── ui/            # StageProgressBar, Badges, ScoreMeter
        └── pages/
            ├── auth/          # Login, Register
            ├── recruiter/     # Dashboard, CreateJob, Pipeline, CandidateDetail, Analytics
            ├── candidate/     # JobBoard, JobDetail, MyApplications, Assessment, Results
            └── interviewer/   # Dashboard, ScorecardPage
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier) — optional, for profile images

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/hirestream.git
cd hirestream
```

### 2. Server Setup
```bash
cd server
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)
npm install
npm run dev
```

### 3. Client Setup
```bash
cd client/hirestream-frontend
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173`

---

## 🔑 Environment Variables

Create `server/.env` with:

```env
PORT=8000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hirestream
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

> ⚠️ **Never commit `.env` to version control.** The `.gitignore` is already configured.

---

## 🌐 Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway
- **Database**: MongoDB Atlas (free tier)

---

## 📹 Demo

[Demo Video Link — Coming Soon]

---

## 📄 License

ISC
