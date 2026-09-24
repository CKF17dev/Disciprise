// components/HabitCard.jsx
// Une carte affichant une habitude : sa grille de jours, ses stats.
// Props reçues :
//  - habit : { id, name, duration, days: [true/false...] }
//  - onToggleDay(id, index) : cocher/décocher un jour
//  - onEdit(id) : ouvrir la modale d'édition
//  - onDelete(id) : supprimer l'habitude

import { habitStats } from "../utils/helpers.js";

export default function HabitCard({ habit, onToggleDay, onEdit, onDelete }) {
  const s = habitStats(habit);
  const todayIndex = habit.days.length - 1; // le dernier jour = "aujourd'hui"

  // On fabrique la liste des jours (JSX). .map() transforme le tableau
  // "days" en une liste de <div className="day-cell">.
  const dayCells = habit.days.map((done, index) => (
    <div
      key={index}
      className={"day-cell" + (done ? " done" : "") + (index === todayIndex ? " today" : "")}
      onClick={() => onToggleDay(habit.id, index)}
    >
      <span className="day-num">{index + 1}</span>
      <span className="day-dot" />
    </div>
  ));

  return (
    <section className="habit-card" style={{ marginBottom: 18 }}>
      {/* En-tête : nom + boutons modifer/supprimer */}
      <div className="habit-header">
        <div>
          <div className="habit-name">{habit.name}</div>
          <div className="habit-duration">Durée : {habit.duration} jours</div>
        </div>
        <div className="habit-actions">
          <button className="icon-btn" title="Modifier" onClick={() => onEdit(habit.id)}>✏️</button>
          <button className="icon-btn delete" title="Supprimer" onClick={() => onDelete(habit.id)}>🗑️</button>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="progress"><div className="progress-bar" style={{ width: s.percent + "%" }} /></div>

      {/* Statistiques */}
      <div className="habit-stats">
        <span className="habit-percent">{s.percent}%</span>
        <div className="stat">
          <span className="stat-label">Jours réalisés</span>
          <span className="stat-value">{s.done} / {habit.days.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Manqués</span>
          <span className="stat-value">{s.missed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Série actuelle</span>
          <span className="stat-value">{s.currentStreak}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Meilleure série</span>
          <span className="stat-value">{s.bestStreak}</span>
        </div>
      </div>

      {/* Grille des jours */}
      <div className="day-grid">{dayCells}</div>
    </section>
  );
}