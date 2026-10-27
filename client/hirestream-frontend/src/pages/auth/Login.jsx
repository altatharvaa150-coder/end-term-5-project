import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/auth.service";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await loginUser(form);
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const { role } = res.data.user;
      if (role === "recruiter") navigate("/recruiter/dashboard");
      else if (role === "interviewer") navigate("/interviewer/dashboard");
      else navigate("/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ HireStream</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your recruitment dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                className="form-input"
                placeholder="you@company.com"
                style={{ paddingLeft: 38 }}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPwd ? "text" : "password"}
                className="form-input"
                placeholder="��������"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider"></div>
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--accent-light)", fontWeight: 600 }}>
            Create one free
          </Link>
        </p>

        <div style={{ marginTop: 24, background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: 16, fontSize: 12, color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-secondary)" }}>Demo credentials:</strong><br />
          Recruiter: recruiter@demo.com / demo123<br />
          Candidate: candidate@demo.com / demo123<br />
          Interviewer: interviewer@demo.com / demo123
        </div>
      </div>
    </div>
  );
}
