// components/Sidebar.jsx
// Barre latérale avec la navigation. Elle reçoit des props :
//  - user : le compte connecté (pour afficher le nom)
//  - page : la page active ("dashboard", "habits", "business")
//  - onNavigate(page) : pour changer de page
//  - onLogout() : pour se déconnecter

import { initials } from "../utils/helpers.js";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "habits", label: "Habitudes", icon: "✓" },
  { id: "business", label: "Business", icon: "$" }
];

export default function Sidebar({ user, page, onNavigate, onLogout }) {
  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">D</div>
        <div>
          <div className="logo-text">Disciprise</div>
          <div className="logo-sub">Version 0.2 · React</div>
        </div>
      </div>

      {/* Liens de navigation : on génère un bouton par élément de NAV_ITEMS */}
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={"nav-link" + (page === item.id ? " active" : "")}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      {/* Pied de sidebar : utilisateur + déconnexion */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{user ? initials(user.name) : "–"}</div>
          <div>{user ? user.name : "—"}</div>
        </div>
        <button className="btn btn-outline" style={{ width: "100%", marginTop: 10, fontSize: 12, padding: 8 }}
          onClick={onLogout}>
          Se déconnecter
        </button>
      </div>
    </nav>
  );
}