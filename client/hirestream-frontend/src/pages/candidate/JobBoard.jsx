import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../../services/job.service";
import toast from "react-hot-toast";
import { MapPin, Building, Clock, DollarSign, Search, Filter } from "lucide-react";

export default function JobBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "", jobType: "", experienceLevel: "" });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();
      setJobs(res.data.jobs);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchDept = !filters.department || j.department === filters.department;
    const matchType = !filters.jobType || j.jobType === filters.jobType;
    const matchExp = !filters.experienceLevel || j.experienceLevel === filters.experienceLevel;
    return matchSearch && matchDept && matchType && matchExp;
  });

  const departments = [...new Set(jobs.map(j => j.department))];
  const expLabels = { entry: "Entry", mid: "Mid", senior: "Senior", lead: "Lead" };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Find Your Next Role 🚀</h1>
        <p className="page-subtitle">Browse {jobs.length} open positions across teams</p>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input className="search-input" style={{ width: "100%", paddingLeft: 36 }}
            placeholder="Search jobs, skills, departments..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" value={filters.jobType} onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
        <select className="filter-select" value={filters.experienceLevel} onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}>
          <option value="">All Levels</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No jobs found</div>
          <div className="empty-state-desc">Try adjusting your filters or search term</div>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map((job) => (
            <div key={job._id} className="job-card" onClick={() => navigate(`/jobs/${job._id}`)}>
              <div>
                <h3 className="job-card-title">{job.title}</h3>
                <div className="job-card-company">
                  <Building size={14} /> {job.recruiter?.name || "Company"} • {job.department}
                </div>
              </div>
              <div className="job-card-meta">
                <span className="badge badge-full-time" style={{ textTransform: "capitalize" }}>{job.jobType}</span>
                <span className={`badge badge-${job.experienceLevel}`}>{expLabels[job.experienceLevel]}</span>
                <span className="badge badge-applied"><MapPin size={10} /> {job.location}</span>
              </div>
              {job.skills?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {job.skills.slice(0, 4).map((s, i) => (
                    <span key={i} style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "3px 8px", borderRadius: 4 }}>{s}</span>
                  ))}
                  {job.skills.length > 4 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{job.skills.length - 4}</span>}
                </div>
              )}
              <div className="job-card-footer">
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {job.salaryMin && job.salaryMax
                    ? `₹${(job.salaryMin / 100000).toFixed(1)}L - ₹${(job.salaryMax / 100000).toFixed(1)}L`
                    : "Salary not disclosed"}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {job.applicationCount || 0} applied • {job.openings} opening{job.openings > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
