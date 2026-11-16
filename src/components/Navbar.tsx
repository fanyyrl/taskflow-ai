import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tugas" },
  { to: "/planner", label: "AI Planner" },
  { to: "/learn", label: "Materi" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <span className="brand">TaskFlow AI</span>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <span className="nav-user">{user?.email}</span>
        <button className="btn light" onClick={logout}>
          Keluar
        </button>
      </div>
    </header>
  );
}
