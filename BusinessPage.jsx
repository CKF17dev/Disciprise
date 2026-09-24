
import { useState } from "react";
import BarChart from "../components/BarChart.jsx";
import { formatEuro } from "../utils/helpers.js";
import { storageSave } from "../utils/storage.js";

export default function BusinessPage({ entries, setEntries, entriesKey, goal, setGoal, goalKey }) {
  // Formulaire de saisie d'une entrée
  const [type, setType] = useState("revenue");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [label, setLabel] = useState("");

  // Champs objectif
  const [goalAmount, setGoalAmount] = useState("");
  const [goalForecast, setGoalForecast] = useState("");

  // ---- Ajouter une entrée ----
  function addEntry(e) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0 || date === "" || label.trim() === "") {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const id = entries.length === 0 ? 1 : Math.max(...entries.map((en) => en.id)) + 1;
    const next = [...entries, { id, type, amount: value, date, label: label.trim() }];
    setEntries(next);
    storageSave(entriesKey, next);
    setAmount("");
    setLabel("");
  }

  // ---- Supprimer une entrée ----
  function deleteEntry(id) {
    const next = entries.filter((en) => en.id !== id);
    setEntries(next);
    storageSave(entriesKey, next);
  }

  // ---- Enregistrer l'objectif ----
  function saveGoal() {
    const value = parseInt(goalAmount, 10);
    if (value <= 0) {
      alert("Veuillez saisir un objectif valide.");
      return;
    }
    const next = { amount: value, forecast: goalForecast ? parseInt(goalForecast, 10) : null };
    setGoal(next);
    storageSave(goalKey, next);
  }

  // ---- Totaux calculés ----
  let invested = 0, expenses = 0, revenue = 0;
  entries.forEach((en) => {
    if (en.type === "invest") invested += en.amount;
    else if (en.type === "expense") expenses += en.amount;
    else if (en.type === "revenue") revenue += en.amount;
  });
  const profit = revenue - expenses;
  const roi = invested === 0 ? 0 : Math.round((profit / invested) * 100);
  const empty = entries.length === 0;

  // ---- Graphique : revenus par mois ----
  const byMonth = {};
  entries.forEach((en) => {
    if (en.type !== "revenue") return;
    const month = en.date.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + en.amount;
  });
  const revenueBars = Object.keys(byMonth).sort().map((month) => ({
    label: new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
    value: byMonth[month],
    display: byMonth[month]
  }));

  // ---- Graphique : dépenses vs revenus (mois en cours) ----
  const nowMonth = new Date().toISOString().slice(0, 7);
  let monthRevenue = 0, monthExpenses = 0;
  entries.forEach((en) => {
    if (!en.date.startsWith(nowMonth)) return;
    if (en.type === "revenue") monthRevenue += en.amount;
    else if (en.type === "expense") monthExpenses += en.amount;
  });

  // ---- Progression vers l'objectif ----
  const goalPercent = goal ? Math.min(100, Math.round((revenue / goal.amount) * 100)) : 0;

  // ---- Tableau (les plus récentes en premier) ----
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  const typeLabel = (t) => (t === "revenue" ? "Revenu" : t === "expense" ? "Dépense" : "Invest.");
  const badgeClass = (t) => (t === "revenue" ? "income" : t === "expense" ? "expense" : "invest");

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Business</h1>
          <div className="subtitle">Suivi de vos investissements, revenus et objectifs</div>
        </div>
      </div>

      {/* 4 KPI */}
      <section className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card kpi">
          <div className="kpi-label">Investi</div>
          <div className="kpi-value">{empty ? "—" : formatEuro(invested)}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Revenus</div>
          <div className="kpi-value">{empty ? "—" : formatEuro(revenue)}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Dépenses</div>
          <div className="kpi-value">{empty ? "—" : formatEuro(expenses)}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Bénéfice</div>
          <div className="kpi-value">{empty ? "—" : formatEuro(profit)}</div>
          <div className="kpi-trend">{empty ? "Aucune entrée" : "ROI : " + roi + "%"}</div>
        </div>
      </section>

      {/* Objectif */}
      <section className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">Objectif de revenus</div>
        <div className="form-row">
          <div className="form-group">
            <label>Objectif (€)</label>
            <input type="number" min="0" placeholder="Ex : 1000"
              value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Prévision fin de période (€)</label>
            <input type="number" min="0" placeholder="Ex : 1500"
              value={goalForecast} onChange={(e) => setGoalForecast(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={saveGoal}>Enregistrer l'objectif</button>

        {goal && (
          <div style={{ marginTop: 16 }}>
            <div className="progress" style={{ height: 14 }}>
              <div className="progress-bar" style={{ width: goalPercent + "%" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
              <span>{formatEuro(revenue)} / {formatEuro(goal.amount)} · Atteint : {goalPercent}%</span>
              <span>{goal.forecast !== null ? "Prévision : " + formatEuro(goal.forecast) : ""}</span>
            </div>
          </div>
        )}
      </section>

      {/* Graphiques */}
      <section className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">Évolution des revenus <span className="muted">par mois</span></div>
          {revenueBars.length === 0 ? (
            <div className="empty-state small">Aucun revenu saisi.</div>
          ) : (
            <BarChart bars={revenueBars} />
          )}
        </div>

        <div className="card">
          <div className="card-title">Dépenses vs Revenus <span className="muted">ce mois-ci</span></div>
          {monthRevenue === 0 && monthExpenses === 0 ? (
            <div className="empty-state small">Aucune entrée ce mois-ci.</div>
          ) : (
            <BarChart
              bars={[
                { label: "Revenus", value: monthRevenue, display: monthRevenue },
                { label: "Dépenses", value: monthExpenses, display: monthExpenses, color: "alt" }
              ]}
            />
          )}
        </div>
      </section>

      {/* Tableau + formulaire */}
      <section className="grid grid-2">
        <div className="card">
          <div className="card-title">Transactions <span className="muted">toutes</span></div>
          {sorted.length === 0 ? (
            <div className="empty-state small">Aucune transaction.<br />Ajoutez votre première entrée.</div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Libellé</th><th>Type</th><th>Montant</th><th></th></tr>
              </thead>
              <tbody>
                {sorted.map((en) => (
                  <tr key={en.id}>
                    <td>{en.date}</td>
                    <td>{en.label}</td>
                    <td><span className={"badge " + badgeClass(en.type)}>{typeLabel(en.type)}</span></td>
                    <td>{en.type === "revenue" ? "+" : "-"} {formatEuro(en.amount)}</td>
                    <td>
                      <button className="icon-btn delete" title="Supprimer"
                        onClick={() => deleteEntry(en.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formulaire d'entrée */}
        <div className="card">
          <div className="card-title">Ajouter une entrée</div>
          <form onSubmit={addEntry}>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="revenue">Revenu</option>
                  <option value="expense">Dépense</option>
                  <option value="invest">Investissement</option>
                </select>
              </div>
              <div className="form-group">
                <label>Montant (€)</label>
                <input type="number" min="0" step="0.01" placeholder="0"
                  value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Libellé</label>
                <input type="text" placeholder="Ex : Publicité"
                  value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Enregistrer</button>
          </form>
        </div>
      </section>
    </>
  );
}