import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationById, moveApplicationStage, makeOffer } from "../../services/application.service";
import { getEvaluationsByApplication } from "../../services/evaluation.service";
import { getAssessmentResult } from "../../services/assessment.service";
import toast from "react-hot-toast";
import { ArrowLeft, Send } from "lucide-react";
import StageProgressBar from "../../components/ui/StageProgressBar";
import { StageBadge, StatusBadge, RecommendationBadge } from "../../components/ui/Badges";
import ScoreMeter from "../../components/ui/ScoreMeter";

export default function CandidateDetail() {
  const { jobId, appId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [assessResult, setAssessResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerForm, setOfferForm] = useState({ baseSalary: "", bonus: "", equity: "", joiningDate: "", expiryDate: "" });
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => { fetchData(); }, [appId]);

  const fetchData = async () => {
    try {
      const appRes = await getApplicationById(appId);
      setApp(appRes.data.application);
      try { const eRes = await getEvaluationsByApplication(appId); setEvaluations(eRes.data.evaluations || []); } catch {}
      try { const aRes = await getAssessmentResult(appId); setAssessResult(aRes.data); } catch {}
    } catch {
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.baseSalary) return toast.error("Base salary is required");
    try {
      await makeOffer(appId, offerForm);
      toast.success("Offer sent to candidate!");
      setShowOffer(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create offer");
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!app) return <div className="empty-state"><div className="empty-state-title">Application not found</div></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(`/recruiter/jobs/${jobId}/pipeline`)} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Back to Pipeline
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div className="candidate-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
            {app.candidate?.profilePic ? <img src={app.candidate.profilePic} alt="" /> : app.candidate?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{app.candidate?.name}</h1>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
              <span>✉️ {app.candidate?.email}</span>
              {app.candidate?.location && <span>📍 {app.candidate.location}</span>}
              {app.candidate?.headline && <span>💼 {app.candidate.headline}</span>}
              {app.candidate?.linkedIn && <a href={app.candidate.linkedIn} target="_blank" style={{ color: "var(--info)" }}>🔗 LinkedIn</a>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <StageBadge stage={app.currentStage} />
            <StatusBadge status={app.status} />
          </div>
        </div>
        <StageProgressBar currentStage={app.currentStage} />
      </div>

      <div className="grid-2">
        {/* Left: Details */}
        <div>
          {/* Application Info */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Application Details</h3>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div><strong>Applied for:</strong> {app.job?.title}</div>
              <div><strong>Department:</strong> {app.job?.department}</div>
              {app.coverLetter && <div><strong>Cover Letter:</strong><p style={{ marginTop: 4, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{app.coverLetter}</p></div>}
              {app.expectedSalary && <div><strong>Expected Salary:</strong> ₹{app.expectedSalary?.toLocaleString()}</div>}
              {app.noticePeriod > 0 && <div><strong>Notice Period:</strong> {app.noticePeriod} days</div>}
              <div><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Skills */}
          {app.candidate?.skills?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Skills</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {app.candidate.skills.map((s, i) => <span key={i} className="badge badge-mid">{s}</span>)}
              </div>
            </div>
          )}

          {/* Stage History */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Stage History</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {app.stageHistory?.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                  <StageBadge stage={h.stage} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(h.movedAt).toLocaleString()}</span>
                  {h.notes && <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>— {h.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scores & Offer */}
        <div>
          {/* Assessment */}
          {assessResult && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📊 Assessment Results</h3>
              <ScoreMeter score={assessResult.assessmentScore || 0} label="Score" />
              <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 6 }}>
                <div>Passing Score: {assessResult.passingScore}%</div>
                <div>Status: <span style={{ fontWeight: 700, color: assessResult.passed ? "var(--success)" : "var(--danger)" }}>{assessResult.passed ? "PASSED ✓" : "FAILED ✗"}</span></div>
                {assessResult.timeTaken && <div>Time Taken: {Math.floor(assessResult.timeTaken / 60)}m {assessResult.timeTaken % 60}s</div>}
                {assessResult.recommendation && <div>Recommendation: <RecommendationBadge rec={assessResult.recommendation} /></div>}
              </div>
            </div>
          )}

          {/* Interview Evaluations */}
          {evaluations.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⭐ Interview Evaluations</h3>
              {evaluations.map((ev, i) => (
                <div key={i} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>By: {ev.interviewer?.name}</span>
                    <RecommendationBadge rec={ev.recommendation} />
                  </div>
                  <ScoreMeter score={ev.overallScore || 0} max={10} label="Overall Score" />
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {ev.criteria?.map((c, ci) => (
                      <div key={ci} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
                        <span>{c.name} ({c.weight}%)</span>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{c.score}/10</span>
                      </div>
                    ))}
                  </div>
                  {ev.strengths && <div style={{ marginTop: 8, fontSize: 12 }}><strong style={{ color: "var(--success)" }}>Strengths:</strong> {ev.strengths}</div>}
                  {ev.weaknesses && <div style={{ marginTop: 4, fontSize: 12 }}><strong style={{ color: "var(--danger)" }}>Areas to improve:</strong> {ev.weaknesses}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Offer Section */}
          {app.currentStage === "Offer" && app.status === "active" && !app.offerDetails?.baseSalary && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>💰 Create Offer</h3>
              {!showOffer ? (
                <button className="btn btn-primary" onClick={() => setShowOffer(true)} style={{ width: "100%" }}>
                  <Send size={16} /> Prepare Offer
                </button>
              ) : (
                <form onSubmit={handleMakeOffer}>
                  <div className="form-group">
                    <label className="form-label">Base Salary (₹) *</label>
                    <input className="form-input" type="number" value={offerForm.baseSalary}
                      onChange={(e) => setOfferForm({ ...offerForm, baseSalary: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Bonus (₹)</label>
                      <input className="form-input" type="number" value={offerForm.bonus}
                        onChange={(e) => setOfferForm({ ...offerForm, bonus: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Equity</label>
                      <input className="form-input" placeholder="e.g., 0.1% ESOP" value={offerForm.equity}
                        onChange={(e) => setOfferForm({ ...offerForm, equity: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Joining Date</label>
                      <input className="form-input" type="date" value={offerForm.joiningDate}
                        onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Offer Expiry</label>
                      <input className="form-input" type="date" value={offerForm.expiryDate}
                        onChange={(e) => setOfferForm({ ...offerForm, expiryDate: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-primary">Send Offer</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowOffer(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Offer details if exists */}
          {app.offerDetails?.baseSalary && (
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>💰 Offer Details</h3>
              <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 8 }}>
                <div>Base Salary: <strong>₹{Number(app.offerDetails.baseSalary).toLocaleString()}</strong></div>
                {app.offerDetails.bonus && <div>Bonus: ₹{Number(app.offerDetails.bonus).toLocaleString()}</div>}
                {app.offerDetails.equity && <div>Equity: {app.offerDetails.equity}</div>}
                {app.offerDetails.joiningDate && <div>Joining: {new Date(app.offerDetails.joiningDate).toLocaleDateString()}</div>}
                <div>Status: <span className={`badge badge-${app.offerDetails.offerStatus === "accepted" ? "hired" : app.offerDetails.offerStatus === "declined" ? "rejected" : "assessment"}`} style={{ textTransform: "capitalize" }}>{app.offerDetails.offerStatus}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
