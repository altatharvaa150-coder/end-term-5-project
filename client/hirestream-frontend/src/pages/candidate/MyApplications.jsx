import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyApplications, respondToOffer } from "../../services/application.service";
import toast from "react-hot-toast";
import { StageBadge, StatusBadge, RecommendationBadge } from "../../components/ui/Badges";
import StageProgressBar from "../../components/ui/StageProgressBar";
import { ClipboardList, ChevronDown, ChevronUp, FileText, CheckCircle, XCircle } from "lucide-react";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getMyApplications().then(res => setApplications(res.data.applications))
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  const handleOfferResponse = async (appId, response) => {
    try {
      await respondToOffer(appId, { response });
      toast.success(response === "accepted" ? "Congratulations! Offer accepted! 🎉" : `Offer ${response}`);
      const res = await getMyApplications();
      setApplications(res.data.applications);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to respond to offer");
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Applications 📋</h1>
        <p className="page-subtitle">Track your job applications and assessment status</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No applications yet</div>
          <div className="empty-state-desc" style={{ marginBottom: 20 }}>Start by browsing open positions</div>
          <button className="btn btn-primary" onClick={() => navigate("/jobs")}>Browse Jobs</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {applications.map((app) => (
            <div key={app._id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{app.job?.title || "Position"}</h3>
                    <StageBadge stage={app.currentStage} />
                    <StatusBadge status={app.status} />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>🏢 {app.job?.department}</span>
                    <span>📍 {app.job?.location}</span>
                    <span>📅 Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {/* Assessment button */}
                  {app.currentStage === "Assessment" && !app.assessmentCompleted && app.status === "active" && (
                    <button className="btn btn-primary btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/assessment/${app._id}`); }}>
                      <FileText size={14} /> Take Assessment
                    </button>
                  )}
                  {app.assessmentCompleted && (
                    <button className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/assessment/${app._id}/result`); }}>
                      View Score
                    </button>
                  )}
                  {expanded === app._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expanded === app._id && (
                <div style={{ marginTop: 20 }}>
                  <StageProgressBar currentStage={app.currentStage} />

                  <div className="divider" />

                  {/* Scores */}
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
                    {app.assessmentScore !== null && app.assessmentScore !== undefined && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "12px 20px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Assessment Score</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Outfit", color: app.assessmentScore >= 60 ? "var(--success)" : "var(--danger)" }}>
                          {app.assessmentScore}%
                        </div>
                      </div>
                    )}
                    {app.interviewScore !== null && app.interviewScore !== undefined && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "12px 20px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Interview Score</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Outfit", color: "var(--accent-light)" }}>
                          {app.interviewScore}/10
                        </div>
                      </div>
                    )}
                    {app.recommendation && app.recommendation !== "pending" && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "12px 20px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Recommendation</div>
                        <RecommendationBadge rec={app.recommendation} />
                      </div>
                    )}
                  </div>

                  {/* Offer section */}
                  {app.offerDetails?.baseSalary && (
                    <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: 20, border: "1px solid var(--border)" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--success)" }}>💰 Offer Received!</h4>
                      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14, marginBottom: 16 }}>
                        <div>
                          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Base Salary</div>
                          <div style={{ fontWeight: 700, fontSize: 18 }}>₹{Number(app.offerDetails.baseSalary).toLocaleString()}</div>
                        </div>
                        {app.offerDetails.bonus && (
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Bonus</div>
                            <div style={{ fontWeight: 700 }}>₹{Number(app.offerDetails.bonus).toLocaleString()}</div>
                          </div>
                        )}
                        {app.offerDetails.equity && (
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Equity</div>
                            <div style={{ fontWeight: 700 }}>{app.offerDetails.equity}</div>
                          </div>
                        )}
                        {app.offerDetails.joiningDate && (
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Joining Date</div>
                            <div style={{ fontWeight: 600 }}>{new Date(app.offerDetails.joiningDate).toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>
                      {app.offerDetails.offerStatus === "pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-success" onClick={() => handleOfferResponse(app._id, "accepted")}>
                            <CheckCircle size={16} /> Accept Offer
                          </button>
                          <button className="btn btn-secondary" onClick={() => handleOfferResponse(app._id, "negotiating")}>
                            Negotiate
                          </button>
                          <button className="btn btn-danger" onClick={() => handleOfferResponse(app._id, "declined")}>
                            <XCircle size={16} /> Decline
                          </button>
                        </div>
                      )}
                      {app.offerDetails.offerStatus !== "pending" && (
                        <span className={`badge ${app.offerDetails.offerStatus === "accepted" ? "badge-hired" : app.offerDetails.offerStatus === "declined" ? "badge-rejected" : "badge-assessment"}`} style={{ textTransform: "capitalize" }}>
                          {app.offerDetails.offerStatus}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
