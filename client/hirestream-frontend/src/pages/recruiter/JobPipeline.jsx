import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../services/job.service";
import { getApplicationsByJob, moveApplicationStage, rejectApplication } from "../../services/application.service";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronRight, XCircle, User } from "lucide-react";
import { StageBadge, StatusBadge, RecommendationBadge } from "../../components/ui/Badges";
import StageProgressBar from "../../components/ui/StageProgressBar";
import ScoreMeter from "../../components/ui/ScoreMeter";

const STAGES = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];

export default function JobPipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchData(); }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        getJobById(jobId),
        getApplicationsByJob(jobId),
      ]);
      setJob(jobRes.data.job);
      setApplications(appsRes.data.applications);
    } catch {
      toast.error("Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (appId, newStage) => {
    setActionLoading(appId);
    try {
      await moveApplicationStage(appId, { newStage });
      toast.success(`Moved to ${newStage}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to move stage");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appId) => {
    if (!confirm("Reject this application?")) return;
    setActionLoading(appId);
    try {
      await rejectApplication(appId, { notes: "Rejected by recruiter" });
      toast.success("Application rejected");
      fetchData();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = activeStage === "all"
    ? applications
    : applications.filter(a => a.currentStage === activeStage);

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.currentStage === s && a.status === "active").length;
    return acc;
  }, {});

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!job) return <div className="empty-state"><div className="empty-state-title">Job not found</div></div>;

  const nextStage = (current) => {
    const idx = STAGES.indexOf(current);
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate("/recruiter/dashboard")} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="page-header">
        <h1 className="page-title">{job.title}</h1>
        <p className="page-subtitle">{job.department} • {job.location} • {applications.length} application{applications.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Funnel stats */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>PIPELINE FUNNEL</h3>
        <div style={{ display: "flex", gap: 4 }}>
          {STAGES.map((stage) => (
            <div key={stage} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "Outfit", color: `var(--stage-${stage.toLowerCase()})` }}>
                {stageCounts[stage] || 0}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{stage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        <button className={`tab ${activeStage === "all" ? "active" : ""}`} onClick={() => setActiveStage("all")}>
          All ({applications.length})
        </button>
        {STAGES.map(s => (
          <button key={s} className={`tab ${activeStage === s ? "active" : ""}`} onClick={() => setActiveStage(s)}>
            {s} ({stageCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No applications {activeStage !== "all" ? `in ${activeStage} stage` : "yet"}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((app) => (
            <div key={app._id} className="candidate-card">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="candidate-avatar">
                  {app.candidate?.profilePic ? (
                    <img src={app.candidate.profilePic} alt={app.candidate.name} />
                  ) : (
                    app.candidate?.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{app.candidate?.name}</span>
                    <StageBadge stage={app.currentStage} />
                    <StatusBadge status={app.status} />
                    {app.recommendation && app.recommendation !== "pending" && (
                      <RecommendationBadge rec={app.recommendation} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span>✉️ {app.candidate?.email}</span>
                    {app.candidate?.location && <span>📍 {app.candidate.location}</span>}
                    {app.assessmentScore !== null && app.assessmentScore !== undefined && (
                      <span>📊 Assessment: {app.assessmentScore}%</span>
                    )}
                    {app.interviewScore !== null && app.interviewScore !== undefined && (
                      <span>⭐ Interview: {app.interviewScore}/10</span>
                    )}
                  </div>
                  {app.candidate?.skills?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {app.candidate.skills.slice(0, 5).map((s, i) => (
                        <span key={i} className="badge badge-mid" style={{ fontSize: 10 }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/recruiter/jobs/${jobId}/applications/${app._id}`)}>
                    View Details
                  </button>
                  {app.status === "active" && nextStage(app.currentStage) && (
                    <button className="btn btn-success btn-sm"
                      disabled={actionLoading === app._id}
                      onClick={() => handleMoveStage(app._id, nextStage(app.currentStage))}>
                      {actionLoading === app._id ? "..." : `→ ${nextStage(app.currentStage)}`}
                    </button>
                  )}
                  {app.status === "active" && (
                    <button className="btn btn-danger btn-sm"
                      disabled={actionLoading === app._id}
                      onClick={() => handleReject(app._id)}>
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
