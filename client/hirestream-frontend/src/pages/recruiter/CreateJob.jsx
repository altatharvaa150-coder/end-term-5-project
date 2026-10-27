import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../../services/job.service";
import { getInterviewers } from "../../services/auth.service";
import toast from "react-hot-toast";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [interviewers, setInterviewers] = useState([]);
  const [form, setForm] = useState({
    title: "", department: "", description: "", requirements: "",
    location: "Remote", jobType: "full-time", salaryMin: "", salaryMax: "",
    experienceLevel: "mid", skills: "", assessmentDuration: 30,
    passingScore: 60, deadline: "", openings: 1, assignedInterviewers: [],
  });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    getInterviewers().then(res => setInterviewers(res.data.interviewers || [])).catch(() => {});
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 10 }]);
  };

  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.department || !form.description) return toast.error("Title, department and description are required");
    setLoading(true);
    try {
      await createJob({ ...form, assessmentQuestions: questions });
      toast.success("Job posted successfully! 🎉");
      navigate("/recruiter/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="page-title">Create Job Posting</h1>
        <p className="page-subtitle">Define the role, requirements, and assessment questions</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 Basic Information</h3>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input className="form-input" placeholder="e.g. Senior React Developer" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select Department</option>
                {["Engineering", "Design", "Product", "Marketing", "Sales", "HR", "Finance", "Operations", "Data Science", "DevOps"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select className="form-input" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead / Principal</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" rows={5} placeholder="Describe the role, responsibilities..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Requirements (one per line)</label>
            <textarea className="form-textarea" rows={4} placeholder="3+ years of React experience&#10;Familiarity with Node.js..."
              value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="Remote / City" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select className="form-input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Salary (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 800000" value={form.salaryMin}
                onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Salary (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 1500000" value={form.salaryMax}
                onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <input className="form-input" placeholder="React, Node.js, MongoDB..." value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Openings</label>
              <input className="form-input" type="number" min={1} value={form.openings}
                onChange={(e) => setForm({ ...form, openings: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Application Deadline</label>
            <input className="form-input" type="date" value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          {interviewers.length > 0 && (
            <div className="form-group">
              <label className="form-label">Assign Interviewers</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {interviewers.map(iv => (
                  <button key={iv._id} type="button"
                    onClick={() => {
                      const current = form.assignedInterviewers;
                      setForm({
                        ...form,
                        assignedInterviewers: current.includes(iv._id)
                          ? current.filter(id => id !== iv._id)
                          : [...current, iv._id]
                      });
                    }}
                    className={`btn btn-sm ${form.assignedInterviewers.includes(iv._id) ? "btn-primary" : "btn-secondary"}`}>
                    {iv.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assessment */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>📝 Assessment Configuration</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
              <Plus size={14} /> Add Question
            </button>
          </div>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input className="form-input" type="number" min={5} value={form.assessmentDuration}
                onChange={(e) => setForm({ ...form, assessmentDuration: parseInt(e.target.value) || 30 })} />
            </div>
            <div className="form-group">
              <label className="form-label">Passing Score (%)</label>
              <input className="form-input" type="number" min={0} max={100} value={form.passingScore}
                onChange={(e) => setForm({ ...form, passingScore: parseInt(e.target.value) || 60 })} />
            </div>
          </div>

          {questions.length === 0 && (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-state-title">No assessment questions</div>
              <div className="empty-state-desc">Add MCQ or text questions for automated candidate screening</div>
            </div>
          )}

          {questions.map((q, idx) => (
            <div key={idx} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: 20, marginBottom: 16, border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-light)" }}>Question {idx + 1}</span>
                <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={() => removeQuestion(idx)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="form-group">
                <input className="form-input" placeholder="Enter your question..." value={q.questionText}
                  onChange={(e) => updateQuestion(idx, "questionText", e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={q.type} onChange={(e) => updateQuestion(idx, "type", e.target.value)}>
                    <option value="mcq">Multiple Choice</option>
                    <option value="text">Text Answer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Points</label>
                  <input className="form-input" type="number" min={1} value={q.points}
                    onChange={(e) => updateQuestion(idx, "points", parseInt(e.target.value) || 10)} />
                </div>
              </div>
              {q.type === "mcq" && (
                <>
                  <label className="form-label" style={{ marginBottom: 8 }}>Options</label>
                  {q.options.map((opt, oIdx) => (
                    <input key={oIdx} className="form-input" placeholder={`Option ${oIdx + 1}`}
                      style={{ marginBottom: 8 }} value={opt} onChange={(e) => updateOption(idx, oIdx, e.target.value)} />
                  ))}
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label className="form-label">Correct Answer (must match one option exactly)</label>
                    <input className="form-input" placeholder="Correct answer text" value={q.correctAnswer}
                      onChange={(e) => updateQuestion(idx, "correctAnswer", e.target.value)} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? "Publishing..." : "Publish Job Posting"}
        </button>
      </form>
    </div>
  );
}
