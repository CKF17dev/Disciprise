// pages/HabitsPage.jsx
// Page des habitudes : liste, ajout, modification, suppression, cocher les jours.
// Props reçues depuis App.jsx :
//  - habits : tableau des habitudes
//  - setHabits : pour mettre à jour la liste (React state)
//  - habitKey : la clé localStorage du compte (habits_<email>)
//    (la sauvegarde est faite ici via storageSave)

import { useState } from "react";
import HabitCard from "../components/HabitCard.jsx";
import { habitStats } from "../utils/helpers.js";
import { storageSave } from "../utils/storage.js";

const PRESETS = [7, 21, 30, 60, 90];

export default function HabitsPage({ habits, setHabits, habitKey }) {
  // La modale : editingId = id de l'habitude en cours (null = nouvelle)
  const [editingId, setEditingId] = useState(null);

  // Champs du formulaire modale
  const [formName, setFormName] = useState("");
  const [formDuration, setFormDuration] = useState("30");
  const [formCustom, setFormCustom] = useState("");

  // ---- Sauvegarde dans localStorage (à chaque changement) ----
  function persist(next) {
    setHabits(next);
    storageSave(habitKey, next);
  }

  // ---- Nouvel id unique ----
  function nextId() {
    if (habits.length === 0) return 1;
    return Math.max(...habits.map((h) => h.id)) + 1;
  }

  // ---- Ouvrir la modale (ajout ou édition) ----
  function openModal(id) {
    setEditingId(id === undefined ? null : id);
    if (id === undefined) {
      setFormName("");
      setFormDuration("30");
      setFormCustom("");
    } else {
      const habit = habits.find((h) => h.id === id);
      setFormName(habit.name);
      if (PRESETS.includes(habit.duration)) {
        setFormDuration(String(habit.duration));
      } else {
        setFormDuration("custom");
        setFormCustom(String(habit.duration));
      }
    }
  }

  // ---- Enregistrer (ajout ou modification) ----
  function saveHabit() {
    const duration = formDuration === "custom"
      ? parseInt(formCustom, 10)
      : parseInt(formDuration, 10);

    if (formName.trim() === "" || !duration || duration < 1) {
      alert("Veuillez saisir un nom et une durée valide.");
      return;
    }

    if (editingId === null) {
      // Ajout : tous les jours vides
      persist([
        ...habits,
        { id: nextId(), name: formName.trim(), duration, days: Array(duration).fill(false) }
      ]);
    } else {
      // Édition : on conserve les jours déjà cochés si la durée approche
      const next = habits.map((h) => {
        if (h.id !== editingId) return h;
        const newDays = Array(duration).fill(false);
        for (let i = 0; i < Math.min(h.days.length, duration); i++) {
          newDays[i] = h.days[i];
        }
        return { ...h, name: formName.trim(), duration, days: newDays };
      });
      persist(next);
    }
    setEditingId(null); // on ferme la modale
  }

  // ---- Cocher / décocher un jour ----
  function toggleDay(id, index) {
    persist(habits.map((h) => {
      if (h.id !== id) return h;
      const days = [...h.days];
      days[index] = !days[index];
      return { ...h, days };
    }));
  }

  // ---- Supprimer ----
  function deleteHabit(id) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    if (!confirm("Supprimer l'habitude « " + habit.name + " » ?")) return;
    persist(habits.filter((h) => h.id !== id));
  }

  // ---- Stats globales pour les 4 cartes KPI ----
  const count = habits.length;
  const avgPercent = count === 0
    ? 0
    : Math.round(habits.reduce((sum, h) => sum + habitStats(h).percent, 0) / count);
  const totalStreak = habits.reduce((sum, h) => sum + habitStats(h).currentStreak, 0);
  const bestStreak = habits.reduce((best, h) => Math.max(best, habitStats(h).bestStreak), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Habitudes</h1>
          <div className="subtitle">
            {count} habitude{count > 1 ? "s" : ""} active{count > 1 ? "s" : ""} · Progression moyenne {avgPercent}%
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle habitude</button>
      </div>

      {/* 4 cartes KPI */}
      <section className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card kpi">
          <div className="kpi-label">Nombre d'habitudes</div>
          <div className="kpi-value">{count}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Progression moyenne</div>
          <div className="kpi-value">{avgPercent}%</div>
          <div className="progress"><div className="progress-bar" style={{ width: avgPercent + "%" }} /></div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Série actuelle</div>
          <div className="kpi-value">{totalStreak}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Meilleure série</div>
          <div className="kpi-value">{bestStreak}</div>
        </div>
      </section>

      {/* Liste des habitudes */}
      {habits.length === 0 ? (
        <div className="empty-state">
          Aucune habitude.<br />Cliquez sur « + Nouvelle habitude » pour commencer.
        </div>
      ) : (
        habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggleDay={toggleDay}
            onEdit={openModal}
            onDelete={deleteHabit}
          />
        ))
      )}

      {/* Modale ajout / édition (affichée seulement si elle est ouverte) */}
      {editingId !== null && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingId(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId === null ? "Nouvelle habitude" : "Modifier l'habitude"}</h2>
              <button className="icon-btn" onClick={() => setEditingId(null)}>✕</button>
            </div>

            {/* Champ nom */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Nom de l'habitude</label>
              <input
                type="text"
                placeholder="Ex : Lire 20 minutes"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Champ durée */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Durée</label>
              <select value={formDuration} onChange={(e) => setFormDuration(e.target.value)}>
                <option value="7">7 jours</option>
                <option value="21">21 jours</option>
                <option value="30">30 jours</option>
                <option value="60">60 jours</option>
                <option value="90">90 jours</option>
                <option value="custom">Personnalisée…</option>
              </select>
            </div>

            {/* Durée personnalisée */}
            {formDuration === "custom" && (
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Nombre de jours</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="Ex : 45"
                  value={formCustom}
                  onChange={(e) => setFormCustom(e.target.value)}
                />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditingId(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={saveHabit}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}