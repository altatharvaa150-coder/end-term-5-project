import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyJobs, deleteJob } from "../../services/job.service";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Briefcase, Users, Plus, ChevronRight, Trash2, ExternalLink, Clock } from "lucide-react";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await getMyJobs();
      setJobs(res.data.jobs);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this job posting?")) return;
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(j => j._id !== jobId));
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const activeJobs = jobs.filter(j => j.status === "active");
  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="page-subtitle">Here's your recruitment overview</p>
          </div>
          <Link to="/recruiter/jobs/create" className="btn btn-primary">
            <Plus size={16} /> Post New Job
          </Link>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Total Jobs", value: jobs.length, icon: Briefcase, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
          { label: "Active Jobs", value: activeJobs.length, icon: ExternalLink, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
          { label: "Total Applications", value: totalApps, icon: Users, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
          { label: "Closed Jobs", value: jobs.filter(j => j.status === "closed").length, icon: Clock, color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Job Postings</h2>
        <Link to="/recruiter/analytics" className="btn btn-secondary btn-sm">View Analytics</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No jobs posted yet</div>
          <div className="empty-state-desc" style={{ marginBottom: 20 }}>Start by creating your first job posting</div>
          <Link to="/recruiter/jobs/create" className="btn btn-primary">Post First Job</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jobs.map((job) => (
            <div key={job._id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer" }}
              onClick={() => navigate(`/recruiter/jobs/${job._id}/pipeline`)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</h3>
                  <span className={`badge ${job.status === "active" ? "badge-active" : "badge-closed"}`}>{job.status}</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span>📍 {job.location}</span>
                  <span>🏢 {job.department}</span>
                  <span>👥 {job.applicationCount || 0} applications</span>
                  <span>💼 {job.openings} opening{job.openings > 1 ? "s" : ""}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(job._id, e)}>
                  <Trash2 size={14} />
                </button>
                <button className="btn btn-secondary btn-sm">
                  Pipeline <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
