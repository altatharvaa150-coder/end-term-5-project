import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../services/job.service";
import { applyToJob } from "../../services/application.service";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Building, Clock, Send, CheckCircle, Briefcase } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ coverLetter: "", expectedSalary: "", noticePeriod: 0 });
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    getJobById(id).then(res => setJob(res.data.job))
      .catch(() => toast.error("Job not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applyToJob({ jobId: id, ...form });
      toast.success("Application submitted! 🎉");
      setApplied(true);
      setShowApply(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  const expLabels = { entry: "Entry Level", mid: "Mid Level", senior: "Senior Level", lead: "Lead / Principal" };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!job) return <div className="empty-state"><div className="empty-state-title">Job not found</div></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate("/jobs")} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Main */}
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span className="badge badge-full-time" style={{ textTransform: "capitalize" }}>{job.jobType}</span>
              <span className={`badge badge-${job.experienceLevel}`}>{expLabels[job.experienceLevel]}</span>
              <span className={`badge badge-${job.status === "active" ? "active" : "closed"}`}>{job.status}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{job.title}</h1>
            <div style={{ display: "flex", gap: 20, fontSize: 14, color: "var(--text-secondary)", flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Building size={14} /> {job.department}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> {job.location}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Briefcase size={14} /> {job.openings} opening{job.openings > 1 ? "s" : ""}</span>
              {job.deadline && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
            </div>

            <div className="divider" />

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>About This Role</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{job.description}</p>

            {job.requirements?.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "24px 0 12px" }}>Requirements</h3>
                <ul style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 2, paddingLeft: 20 }}>
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </>
            )}

            {job.skills?.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "24px 0 12px" }}>Skills</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {job.skills.map((s, i) => <span key={i} className="badge badge-mid">{s}</span>)}
                </div>
              </>
            )}
          </div>

          {/* Assessment info */}
          {job.assessmentQuestions?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>📝 Assessment Required</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                This role includes a timed online assessment with <strong>{job.assessmentQuestions.length} questions</strong> ({job.assessmentDuration} min).
                You'll need to score at least <strong>{job.passingScore}%</strong> to move forward.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Salary */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>💰 Compensation</h3>
            {job.salaryMin && job.salaryMax ? (
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Outfit", color: "var(--accent-light)" }}>
                ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Not disclosed</div>
            )}
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>per annum</div>
          </div>

          {/* Apply */}
          <div className="card" style={{ marginBottom: 20 }}>
            {applied ? (
              <div style={{ textAlign: "center", padding: 16 }}>
                <CheckCircle size={40} color="var(--success)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--success)" }}>Application Submitted!</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>Track it from your applications page.</p>
                <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate("/my-applications")}>View My Applications</button>
              </div>
            ) : !showApply ? (
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }}
                onClick={() => setShowApply(true)} disabled={job.status !== "active"}>
                <Send size={16} /> {job.status === "active" ? "Apply Now" : "Applications Closed"}
              </button>
            ) : (
              <form onSubmit={handleApply}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Apply to {job.title}</h3>
                <div className="form-group">
                  <label className="form-label">Cover Letter (Optional)</label>
                  <textarea className="form-textarea" rows={4} placeholder="Why are you interested in this role?"
                    value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expected Salary (₹)</label>
                    <input className="form-input" type="number" placeholder="Annual CTC"
                      value={form.expectedSalary} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notice Period (days)</label>
                    <input className="form-input" type="number" placeholder="0"
                      value={form.noticePeriod} onChange={(e) => setForm({ ...form, noticePeriod: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary" disabled={applying}>
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Posted by */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Posted By</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="candidate-avatar" style={{ width: 40, height: 40 }}>
                {job.recruiter?.profilePic ? <img src={job.recruiter.profilePic} alt="" /> : job.recruiter?.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{job.recruiter?.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{job.recruiter?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
