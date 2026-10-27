import { useState, useEffect } from "react";
import { getRecruiterAnalytics } from "../../services/analytics.service";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#3b82f6", "#10b981", "#ef4444"];
const REC_COLORS = { strong_hire: "#059669", hire: "#10b981", lean_hire: "#f59e0b", no_hire: "#ef4444", strong_no_hire: "#dc2626" };
const REC_LABELS = { strong_hire: "Strong Hire", hire: "Hire", lean_hire: "Lean Hire", no_hire: "No Hire", strong_no_hire: "Strong No Hire" };

export default function RecruiterAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecruiterAnalytics().then(res => setAnalytics(res.data.analytics))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!analytics) return <div className="empty-state"><div className="empty-state-title">No data available</div></div>;

  const funnelData = Object.entries(analytics.stageCounts).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(analytics.statusCounts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const recData = Object.entries(analytics.recommendations || {}).map(([key, value]) => ({ name: REC_LABELS[key] || key, value, key }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📊 Recruitment Analytics</h1>
        <p className="page-subtitle">Data-driven insights into your hiring pipeline</p>
      </div>

      {/* Top Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Total Jobs", value: analytics.totalJobs, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
          { label: "Total Applications", value: analytics.totalApplications, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
          { label: "Hired", value: analytics.hiredCount, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
          { label: "Avg Time to Hire", value: `${analytics.avgTimeToHire}d`, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {s.label === "Total Jobs" ? "📋" : s.label === "Total Applications" ? "👥" : s.label === "Hired" ? "✅" : "⏱️"}
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Pipeline Funnel */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData}>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131929", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#f1f5f9" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {funnelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Application Status</h3>
          {statusData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={4}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#131929", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#f1f5f9" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {statusData.map((s, i) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{s.name}</span>
                    <span style={{ fontWeight: 700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-desc">No data yet</div></div>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Applications Over Time */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Applications (Last 30 Days)</h3>
          {analytics.applicationsOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.applicationsOverTime}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#131929", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#f1f5f9" }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#areaColor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-desc">No recent applications</div></div>
          )}
        </div>

        {/* Recommendation Distribution */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Recommendation Breakdown</h3>
          {recData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "#131929", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#f1f5f9" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {recData.map((entry) => <Cell key={entry.key} fill={REC_COLORS[entry.key] || "#6366f1"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-desc">No evaluations yet</div></div>
          )}
        </div>
      </div>

      {/* Per-Job Stats */}
      {analytics.jobStats?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Per-Job Breakdown</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Applications</th>
                  <th>Active</th>
                  <th>Rejected</th>
                  <th>Hired</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analytics.jobStats.map((j) => (
                  <tr key={j.jobId}>
                    <td style={{ fontWeight: 600 }}>{j.title}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{j.department}</td>
                    <td>{j.totalApplications}</td>
                    <td><span className="badge badge-active">{j.active}</span></td>
                    <td><span className="badge badge-rejected">{j.rejected}</span></td>
                    <td><span className="badge badge-hired">{j.hired}</span></td>
                    <td style={{ fontWeight: 700, color: j.conversionRate >= 20 ? "var(--success)" : "var(--warning)" }}>{j.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assessment Pass Rate */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Assessment Pass Rate</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "Outfit", color: analytics.assessmentPassRate >= 50 ? "var(--success)" : "var(--warning)" }}>
            {analytics.assessmentPassRate}%
          </div>
          <div style={{ flex: 1 }}>
            <div className="score-bar" style={{ height: 12 }}>
              <div className="score-fill" style={{ width: `${analytics.assessmentPassRate}%`, background: analytics.assessmentPassRate >= 50 ? "var(--success)" : "var(--warning)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
