import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Briefcase, Users, BarChart3, LogOut,
  ClipboardList, Search, CheckSquare, Star
} from "lucide-react";

const RecruiterNav = () => (
  <>
    <p className="nav-label">Recruitment</p>
    <NavLink to="/recruiter/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <LayoutDashboard size={18} /> Dashboard
    </NavLink>
    <NavLink to="/recruiter/jobs/create" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <Briefcase size={18} /> Post a Job
    </NavLink>
    <NavLink to="/recruiter/analytics" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <BarChart3 size={18} /> Analytics
    </NavLink>
  </>
);

const CandidateNav = () => (
  <>
    <p className="nav-label">Job Search</p>
    <NavLink to="/jobs" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <Search size={18} /> Browse Jobs
    </NavLink>
    <NavLink to="/my-applications" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <ClipboardList size={18} /> My Applications
    </NavLink>
  </>
);

const InterviewerNav = () => (
  <>
    <p className="nav-label">Evaluations</p>
    <NavLink to="/interviewer/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <Star size={18} /> My Assignments
    </NavLink>
  </>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">⚡ HireStream</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Recruitment Pipeline
          </div>
        </div>
        <nav className="sidebar-nav">
          {user?.role === "recruiter" && <RecruiterNav />}
          {user?.role === "candidate" && <CandidateNav />}
          {user?.role === "interviewer" && <InterviewerNav />}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.profilePic ? <img src={user.profilePic} alt={user.name} /> : initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            title="Logout"
            style={{ padding: "6px" }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
