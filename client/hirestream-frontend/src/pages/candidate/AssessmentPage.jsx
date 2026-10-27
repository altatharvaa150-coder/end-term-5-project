import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startAssessment, submitAssessment } from "../../services/assessment.service";
import toast from "react-hot-toast";
import { Clock, AlertTriangle, Send } from "lucide-react";

export default function AssessmentPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadAssessment();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [applicationId]);

  const loadAssessment = async () => {
    try {
      const res = await startAssessment(applicationId);
      setQuestions(res.data.questions);
      setAnswers(new Array(res.data.questions.length).fill(""));
      setTimeRemaining(res.data.timeRemaining);
      setDuration(res.data.duration);

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load assessment");
      if (err.response?.status === 400) {
        navigate(`/assessment/${applicationId}/result`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    toast("⏰ Time's up! Auto-submitting your answers...", { icon: "⚠️" });
    try {
      await submitAssessment(applicationId, { answers });
      navigate(`/assessment/${applicationId}/result`);
    } catch {
      toast.error("Failed to auto-submit");
    }
  }, [applicationId, answers, submitted, navigate]);

  const handleSubmit = async () => {
    const unanswered = answers.filter(a => !a).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`)) return;
    }
    setSubmitting(true);
    try {
      await submitAssessment(applicationId, { answers });
      clearInterval(timerRef.current);
      toast.success("Assessment submitted!");
      navigate(`/assessment/${applicationId}/result`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const setAnswer = (idx, value) => {
    const updated = [...answers];
    updated[idx] = value;
    setAnswers(updated);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timerClass = timeRemaining <= 60 ? "urgent" : timeRemaining <= 300 ? "warning" : "ok";
  const answeredCount = answers.filter(a => a).length;

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="assessment-container">
        {/* Timer Bar */}
        <div className="timer-bar">
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Time Remaining</div>
            <div className={`timer-value ${timerClass}`}>
              <Clock size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Progress</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {answeredCount} / {questions.length} answered
            </div>
            <div className="score-bar" style={{ width: 120, height: 4, marginTop: 4 }}>
              <div className="score-fill" style={{ width: `${(answeredCount / questions.length) * 100}%`, background: "var(--accent)" }} />
            </div>
          </div>
        </div>

        {/* Warning */}
        {timeRemaining <= 120 && timeRemaining > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: 13 }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <span style={{ color: "var(--danger)", fontWeight: 600 }}>Less than 2 minutes remaining! Your assessment will auto-submit when time runs out.</span>
          </div>
        )}

        {/* Questions */}
        {questions.map((q, idx) => (
          <div key={q._id || idx} className={`question-card ${answers[idx] ? "answered" : ""}`}>
            <div className="question-number">Question {idx + 1} of {questions.length} • {q.points} points</div>
            <div className="question-text">{q.questionText}</div>

            {q.type === "mcq" ? (
              <div>
                {q.options?.map((opt, oIdx) => (
                  <button key={oIdx} type="button"
                    className={`option-btn ${answers[idx] === opt ? "selected" : ""}`}
                    onClick={() => setAnswer(idx, opt)}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${answers[idx] === opt ? "var(--accent)" : "var(--border-light)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, background: answers[idx] === opt ? "var(--accent)" : "transparent", color: answers[idx] === opt ? "white" : "var(--text-muted)" }}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea className="form-textarea" rows={4} placeholder="Type your answer here..."
                value={answers[idx]} onChange={(e) => setAnswer(idx, e.target.value)} />
            )}
          </div>
        ))}

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}
            style={{ minWidth: 240 }}>
            <Send size={18} />
            {submitting ? "Submitting..." : `Submit Assessment (${answeredCount}/${questions.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
