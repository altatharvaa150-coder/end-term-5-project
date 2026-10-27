import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Layout from "./components/Layout";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import JobPipeline from "./pages/recruiter/JobPipeline";
import RecruiterAnalytics from "./pages/recruiter/Analytics";
import CandidateDetail from "./pages/recruiter/CandidateDetail";

// Candidate Pages
import JobBoard from "./pages/candidate/JobBoard";
import JobDetail from "./pages/candidate/JobDetail";
import MyApplications from "./pages/candidate/MyApplications";
import AssessmentPage from "./pages/candidate/AssessmentPage";
import AssessmentResult from "./pages/candidate/AssessmentResult";

// Interviewer Pages
import InterviewerDashboard from "./pages/interviewer/Dashboard";
import ScorecardPage from "./pages/interviewer/ScorecardPage";

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: "100vh" }}>
      <div className="spinner"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center" style={{ minHeight: "100vh" }}><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "recruiter") return <Navigate to="/recruiter/dashboard" replace />;
  if (user.role === "interviewer") return <Navigate to="/interviewer/dashboard" replace />;
  return <Navigate to="/jobs" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Recruiter */}
      <Route path="/recruiter" element={<ProtectedRoute roles={["recruiter"]}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs/create" element={<CreateJob />} />
        <Route path="jobs/:jobId/pipeline" element={<JobPipeline />} />
        <Route path="jobs/:jobId/applications/:appId" element={<CandidateDetail />} />
        <Route path="analytics" element={<RecruiterAnalytics />} />
      </Route>

      {/* Candidate */}
      <Route path="/" element={<ProtectedRoute roles={["candidate"]}><Layout /></ProtectedRoute>}>
        <Route path="jobs" element={<JobBoard />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="assessment/:applicationId" element={<AssessmentPage />} />
        <Route path="assessment/:applicationId/result" element={<AssessmentResult />} />
      </Route>

      {/* Interviewer */}
      <Route path="/interviewer" element={<ProtectedRoute roles={["interviewer"]}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<InterviewerDashboard />} />
        <Route path="scorecard/:applicationId" element={<ScorecardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
