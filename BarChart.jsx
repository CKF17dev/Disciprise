// components/BarChart.jsx
// Graphique en barres réutilisable.
// Props :
//  - bars : tableau de { label, value, display, color }
// La hauteur de chaque barre est proportionnelle à la plus grande valeur.

export default function BarChart({ bars }) {
  // Plus haute valeur -> sert de référence (100%)
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="bar-chart">
      {bars.map((bar, index) => (
        <div
          key={index}
          className={"bar" + (bar.color === "alt" ? " alt" : "")}
          style={{ height: Math.max((bar.value / max) * 100, 5) + "%" }}
        >
          {bar.display}
          <span className="bar-label">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}