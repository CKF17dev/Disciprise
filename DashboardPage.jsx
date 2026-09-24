// pages/DashboardPage.jsx
// Vue d'ensemble : du jour, stats globales, aperçu business, graphique 7 jours.
// Props :
//  - habits, entries : les données partagées
//  - onNavigate(page) : pour aller vers une autre page

import BarChart from "../components/BarChart.jsx";
import { habitStats, formatEuro } from "../utils/helpers.js";

export default function DashboardPage({ habits, entries, onNavigate }) {
  // ---- Date du jour en français ----
  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  // ---- Section "Aujourd'hui" ----
  const todayIndex = (h) => h.days.length - 1; // dernier jour = aujourd'hui

  const total = habits.length;
  let doneToday = 0;
  habits.forEach((h) => { if (h.days[todayIndex(h)] === true) doneToday++; });
  const remaining = total - doneToday;
  const percentToday = total === 0 ? 0 : Math.round((doneToday / total) * 100);

  const totalStreak = habits.reduce((sum, h) => sum + habitStats(h).currentStreak, 0);
  const bestStreak = habits.reduce((best, h) => Math.max(best, habitStats(h).bestStreak), 0);

  // ---- Aperçu business ----
  let invested = 0, expenses = 0, revenue = 0;
  entries.forEach((en) => {
    if (en.type === "invest") invested += en.amount;
    else if (en.type === "expense") expenses += en.amount;
    else if (en.type === "revenue") revenue += en.amount;
  });
  const profit = revenue - expenses;
  const roi = invested === 0 ? 0 : Math.round((profit / invested) * 100);
  const bizEmpty = entries.length === 0;

  // ---- Graphique : 7 derniers jours ----
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }

  const weekBars = days.map((date, colIndex) => {
    const offset = 6 - colIndex; // 0 = aujourd'hui
    let eligible = 0, doneCount = 0;
    habits.forEach((h) => {
      const index = todayIndex(h) - offset;
      if (index >= 0) {
        eligible++;
        if (h.days[index] === true) doneCount++;
      }
    });
    const percent = eligible === 0 ? 0 : Math.round((doneCount / eligible) * 100);
    return {
      label: date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
      value: percent,
      display: percent + "%"
    };
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="subtitle">{todayLabel} · Vue d'ensemble de votre progression</div>
        </div>
      </div>

      {/* 4 KPI du jour */}
      <section className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card kpi">
          <div className="kpi-label">Habitudes du jour</div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-trend">
            {total === 0 ? "Aucune habitude" : doneToday + " réalisée(s) · " + remaining + " restante(s)"}
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Progression du jour</div>
          <div className="kpi-value">{total === 0 ? "—" : percentToday + "%"}</div>
          <div className="progress"><div className="progress-bar" style={{ width: percentToday + "%" }} /></div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Série actuelle</div>
          <div className="kpi-value">{totalStreak}</div>
          <div className="kpi-trend up">En cours</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Meilleure série</div>
          <div className="kpi-value">{bestStreak}</div>
        </div>
      </section>

      {/* Colonnes : Aujourd'hui + Business */}
      <section className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">Aujourd'hui
            <span className="muted">{total === 0 ? "—" : doneToday + " / " + total + " terminées"}</span>
          </div>

          {total === 0 ? (
            <div className="empty-state small">Aucune habitude active.<br />Créez-en une dans la section Habitudes.</div>
          ) : (
            habits.map((h) => {
              const done = h.days[todayIndex(h)] === true;
              return (
                <div key={h.id} className={"today-item" + (done ? " done" : "")}>
                  <div className="today-check" />
                  <div className="today-name">{h.name}</div>
                  <div className="today-status">{done ? "Terminé" : "À faire"}</div>
                </div>
              );
            })
          )}

          <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => onNavigate("habits")}>
            Voir mes habitudes
          </button>
        </div>

        <div className="card">
          <div className="card-title">Business <span className="muted">Total toutes périodes</span></div>

          <section className="grid grid-2" style={{ gap: 12 }}>
            <div className="kpi">
              <div className="kpi-label">Revenus</div>
              <div className="kpi-value">{bizEmpty ? "—" : formatEuro(revenue)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Dépenses</div>
              <div className="kpi-value">{bizEmpty ? "—" : formatEuro(expenses)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Investi</div>
              <div className="kpi-value">{bizEmpty ? "—" : formatEuro(invested)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Bénéfice</div>
              <div className="kpi-value">{bizEmpty ? "—" : formatEuro(profit)}</div>
              <div className="kpi-trend">{bizEmpty ? "Aucune donnée" : "ROI : " + roi + "%"}</div>
            </div>
          </section>

          <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => onNavigate("business")}>
            Voir le détail business
          </button>
        </div>
      </section>

      {/* Graphique 7 derniers jours */}
      <section className="card">
        <div className="card-title">Progression des habitudes — 7 derniers jours</div>
        {habits.length === 0 ? (
          <div className="empty-state small">Aucune donnée pour le graphique.</div>
        ) : (
          <BarChart bars={weekBars} />
        )}
      </section>
    </>
  );
}