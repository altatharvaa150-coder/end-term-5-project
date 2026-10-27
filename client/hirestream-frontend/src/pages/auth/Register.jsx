import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/auth.service";
import toast from "react-hot-toast";
import { User, Mail, Lock, Briefcase } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "candidate" });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("All fields are required");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await registerUser(form);
      setUser(res.data.user);
      toast.success("Account created! Welcome to HireStream ??");
      const { role } = res.data.user;
      if (role === "recruiter") navigate("/recruiter/dashboard");
      else if (role === "interviewer") navigate("/interviewer/dashboard");
      else navigate("/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "candidate", label: "Job Seeker", desc: "Browse and apply to jobs", icon: "🔍" },
    { value: "recruiter", label: "Recruiter", desc: "Post jobs and manage pipeline", icon: "📋" },
    { value: "interviewer", label: "Interviewer", desc: "Evaluate and score candidates", icon: "⭐" },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">⚡ HireStream</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join the smarter way to hire</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type="text" className="form-input" placeholder="John Doe" style={{ paddingLeft: 38 }}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type="email" className="form-input" placeholder="you@company.com" style={{ paddingLeft: 38 }}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type="password" className="form-input" placeholder="Min 6 characters" style={{ paddingLeft: 38 }}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {roles.map((r) => (
                <button key={r.value} type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    padding: "12px 8px", borderRadius: "var(--radius-sm)", border: `2px solid ${form.role === r.value ? "var(--accent)" : "var(--border-light)"}`,
                    background: form.role === r.value ? "rgba(99,102,241,0.12)" : "var(--bg-secondary)",
                    cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: form.role === r.value ? "var(--accent-light)" : "var(--text-secondary)" }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
            {loading ? "Creating account..." : "Get Started 🚀"}
          </button>
        </form>
        <div className="divider"></div>
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-light)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
