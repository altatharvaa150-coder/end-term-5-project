import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationById } from "../../services/application.service";
import { submitEvaluation, getDefaultCriteria } from "../../services/evaluation.service";
import { getAssessmentResult } from "../../services/assessment.service";
import toast from "react-hot-toast";
import { ArrowLeft, Send } from "lucide-react";
import StageProgressBar from "../../components/ui/StageProgressBar";
import ScoreMeter from "../../components/ui/ScoreMeter";
import { StageBadge, RecommendationBadge } from "../../components/ui/Badges";

export default function ScorecardPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [assessResult, setAssessResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [criteria, setCriteria] = useState([
    { name: "Technical Skills", weight: 35, score: 5, comment: "" },
    { name: "Problem Solving", weight: 25, score: 5, comment: "" },
    { name: "Communication", weight: 20, score: 5, comment: "" },
    { name: "System Design", weight: 20, score: 5, comment: "" },
  ]);
  const [recommendation, setRecommendation] = useState("hire");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [interviewDuration, setInterviewDuration] = useState(60);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appRes = await getApplicationById(applicationId);
        setApp(appRes.data.application);
        try { const aRes = await getAssessmentResult(applicationId); setAssessResult(aRes.data); } catch {}
        try {
          const cRes = await getDefaultCriteria();
          if (cRes.data.criteria) {
            setCriteria(cRes.data.criteria.map(c => ({ ...c, score: 5, comment: "" })));
          }
        } catch {}
      } catch {
        toast.error("Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [applicationId]);

  const updateCriterion = (idx, field, value) => {
    const updated = [...criteria];
    updated[idx][field] = value;
    setCriteria(updated);
  };

  const getWeightedScore = () => {
    const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
    const weighted = criteria.reduce((s, c) => s + c.score * c.weight, 0);
    return totalWeight > 0 ? (weighted / totalWeight).toFixed(2) : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitEvaluation({
        applicationId,
        criteria,
        recommendation,
        strengths,
        weaknesses,
        generalNotes,
        interviewDuration,
      });
      toast.success("Evaluation submitted! 🎉");
      navigate("/interviewer/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const recOptions = [
    { value: "strong_hire", label: "Strong Hire", color: "#059669", desc: "Exceptional — must hire" },
    { value: "hire", label: "Hire", color: "#10b981", desc: "Good — meets all expectations" },
    { value: "lean_hire", label: "Lean Hire", color: "#f59e0b", desc: "Borderline — some concerns" },
    { value: "no_hire", label: "No Hire", color: "#ef4444", desc: "Below bar — significant gaps" },
    { value: "strong_no_hire", label: "Strong No Hire", color: "#dc2626", desc: "Clear reject" },
  ];

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!app) return <div className="empty-state"><div className="empty-state-title">Application not found</div></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate("/interviewer/dashboard")} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="page-header">
        <h1 className="page-title">Interview Scorecard ⭐</h1>
        <p className="page-subtitle">Evaluate {app.candidate?.name} for {app.job?.title}</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
        {/* Left: Candidate Info */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div className="candidate-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
                {app.candidate?.profilePic ? <img src={app.candidate.profilePic} alt="" /> : app.candidate?.name?.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{app.candidate?.name}</h3>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{app.candidate?.email}</div>
                {app.candidate?.headline && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{app.candidate.headline}</div>}
              </div>
            </div>
            {app.candidate?.skills?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {app.candidate.skills.map((s, i) => <span key={i} className="badge badge-mid">{s}</span>)}
              </div>
            )}
            <StageProgressBar currentStage={app.currentStage} />
          </div>

          {/* Assessment Results */}
          {assessResult && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📊 Assessment Results</h3>
              <ScoreMeter score={assessResult.assessmentScore || 0} label="Assessment Score" />
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                {assessResult.passed ? "✅ Passed" : "❌ Failed"} (required: {assessResult.passingScore}%)
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {app.coverLetter && (
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Cover Letter</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{app.coverLetter}</p>
            </div>
          )}
        </div>

        {/* Right: Scorecard Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {/* Criteria Scoring */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Evaluation Criteria</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Rate each criterion from 1-10. Scores are weighted automatically.</p>

              {criteria.map((c, idx) => (
                <div key={idx} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{c.name} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({c.weight}%)</span></span>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "Outfit", color: c.score >= 7 ? "var(--success)" : c.score >= 5 ? "var(--warning)" : "var(--danger)" }}>
                      {c.score}/10
                    </span>
                  </div>
                  <input type="range" min={1} max={10} value={c.score}
                    onChange={(e) => updateCriterion(idx, "score", parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--accent)", marginBottom: 8 }} />
                  <input className="form-input" placeholder="Optional comment..." value={c.comment}
                    onChange={(e) => updateCriterion(idx, "comment", e.target.value)}
                    style={{ fontSize: 12, padding: 8 }} />
                </div>
              ))}

              <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700 }}>Weighted Overall Score</span>
                <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "Outfit", color: "var(--accent-light)" }}>
                  {getWeightedScore()}/10
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recommendation</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recOptions.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setRecommendation(opt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all 0.2s",
                      border: `2px solid ${recommendation === opt.value ? opt.color : "var(--border-light)"}`,
                      background: recommendation === opt.value ? `${opt.color}15` : "var(--bg-secondary)",
                    }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: recommendation === opt.value ? opt.color : "var(--text-primary)" }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Detailed Feedback</h3>
              <div className="form-group">
                <label className="form-label">Key Strengths</label>
                <textarea className="form-textarea" rows={3} placeholder="What did the candidate do well?"
                  value={strengths} onChange={(e) => setStrengths(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Areas for Improvement</label>
                <textarea className="form-textarea" rows={3} placeholder="Where could they improve?"
                  value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">General Notes</label>
                <textarea className="form-textarea" rows={2} placeholder="Any additional observations..."
                  value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Interview Duration (minutes)</label>
                <input className="form-input" type="number" min={10} max={300} value={interviewDuration}
                  onChange={(e) => setInterviewDuration(parseInt(e.target.value) || 60)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: "100%" }}>
              <Send size={18} />
              {submitting ? "Submitting Evaluation..." : "Submit Evaluation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
