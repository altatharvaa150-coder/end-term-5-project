import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getInterviewerJobs } from "../../services/job.service";
import { getApplicationsByJob } from "../../services/application.service";
import { getMyEvaluations } from "../../services/evaluation.service";
import { getInterviewerStats } from "../../services/analytics.service";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Star, ClipboardCheck, FileText, BarChart } from "lucide-react";
import { StageBadge, RecommendationBadge } from "../../components/ui/Badges";

export default function InterviewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, evalsRes, statsRes] = await Promise.all([
        getInterviewerJobs(),
        getMyEvaluations(),
        getInterviewerStats(),
      ]);
      setJobs(jobsRes.data.jobs || []);
      setEvaluations(evalsRes.data.evaluations || []);
      setStats(statsRes.data.stats);

      // Fetch pending interview-stage apps across assigned jobs
      const allPending = [];
      for (const job of jobsRes.data.jobs || []) {
        try {
          const appsRes = await getApplicationsByJob(job._id, { stage: "Interview" });
          const apps = (appsRes.data.applications || []).map(a => ({ ...a, jobTitle: job.title, jobId: job._id }));
          allPending.push(...apps);
        } catch {
          // If recruiter-only endpoint, silently skip
        }
      }
      setPendingApps(allPending);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Interviewer Dashboard ⭐</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Here are your evaluation tasks.</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(99,102,241,0.12)" }}>
            <ClipboardCheck size={22} color="#6366f1" />
          </div>
          <div>
            <div className="stat-value" style={{ color: "#6366f1" }}>{stats?.totalEvaluations || 0}</div>
            <div className="stat-label">Evaluations Submitted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(245,158,11,0.12)" }}>
            <Star size={22} color="#f59e0b" />
          </div>
          <div>
            <div className="stat-value" style={{ color: "#f59e0b" }}>{stats?.avgScore || 0}</div>
            <div className="stat-label">Avg Score Given (/10)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16,185,129,0.12)" }}>
            <FileText size={22} color="#10b981" />
          </div>
          <div>
            <div className="stat-value" style={{ color: "#10b981" }}>{jobs.length}</div>
            <div className="stat-label">Assigned Jobs</div>
          </div>
        </div>
      </div>

      {/* Recommendation distribution */}
      {stats?.recDist && Object.keys(stats.recDist).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Your Recommendation History</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Object.entries(stats.recDist).map(([rec, count]) => (
              <div key={rec} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RecommendationBadge rec={rec} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Jobs */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Assigned Jobs</h2>
      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No assigned jobs yet</div>
          <div className="empty-state-desc">A recruiter will assign you to jobs for evaluation</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {jobs.map(job => (
            <div key={job._id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</h3>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {job.department} • {job.location} • Posted by {job.recruiter?.name || "Recruiter"}
                </div>
              </div>
              <span className={`badge ${job.status === "active" ? "badge-active" : "badge-closed"}`}>{job.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending Evaluations */}
      {pendingApps.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Pending Evaluations</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {pendingApps.map(app => (
              <div key={app._id} className="candidate-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="candidate-avatar">
                  {app.candidate?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{app.candidate?.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {app.jobTitle} • {app.candidate?.email}
                  </div>
                </div>
                <StageBadge stage="Interview" />
                <button className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/interviewer/scorecard/${app._id}`)}>
                  Evaluate
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Past Evaluations */}
      {evaluations.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Past Evaluations</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Score</th>
                  <th>Recommendation</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map(ev => (
                  <tr key={ev._id}>
                    <td style={{ fontWeight: 600 }}>{ev.job?.title}</td>
                    <td style={{ fontWeight: 700, color: "var(--accent-light)" }}>{ev.overallScore}/10</td>
                    <td><RecommendationBadge rec={ev.recommendation} /></td>
                    <td style={{ color: "var(--text-muted)" }}>{new Date(ev.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
