import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssessmentResult } from "../../services/assessment.service";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import ScoreMeter from "../../components/ui/ScoreMeter";
import { RecommendationBadge } from "../../components/ui/Badges";

export default function AssessmentResult() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssessmentResult(applicationId)
      .then(res => setResult(res.data))
      .catch(() => toast.error("Failed to load results"))
      .finally(() => setLoading(false));
  }, [applicationId]);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!result) return <div className="empty-state"><div className="empty-state-title">No results found</div></div>;

  return (
    <div className="page-container">
      <div className="assessment-container">
        <button onClick={() => navigate("/my-applications")} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to Applications
        </button>

        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          {result.passed ? (
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 20 }} />
          ) : (
            <XCircle size={64} color="var(--danger)" style={{ marginBottom: 20 }} />
          )}

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {result.passed ? "Congratulations! You Passed! 🎉" : "Assessment Completed"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>
            {result.passed
              ? "Great job! You've met the passing criteria. The recruiter will review your application."
              : "Unfortunately, you did not meet the minimum passing score. Don't worry — keep trying!"}
          </p>

          {/* Score Circle */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 32 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                background: `conic-gradient(${result.passed ? "var(--success)" : "var(--danger)"} ${(result.assessmentScore / 100) * 360}deg, var(--bg-secondary) 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 96, height: 96, borderRadius: "50%", background: "var(--bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                }}>
                  <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "Outfit", color: result.passed ? "var(--success)" : "var(--danger)" }}>
                    {result.assessmentScore}%
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Your Score</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "16px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Passing Score</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{result.passingScore}%</div>
            </div>
            {result.timeTaken && (
              <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "16px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Time Taken</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  <Clock size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                </div>
              </div>
            )}
            {result.recommendation && (
              <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "16px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Recommendation</div>
                <RecommendationBadge rec={result.recommendation} />
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => navigate("/my-applications")}>
            View My Applications
          </button>
        </div>
      </div>
    </div>
  );
}
