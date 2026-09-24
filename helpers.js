// utils/helpers.js — petites fonctions réutilisables (stats, formats).

// Initiales : "Charles Dupont" -> "CD"
export function initials(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 2);
}

// Format euro : 1000 -> "1 000 €"
export function formatEuro(value) {
  return value.toLocaleString("fr-FR") + " €";
}

// Stats d'une habitude : jours cochés, %, série actuelle, meilleure série.
export function habitStats(habit) {
  const done = habit.days.filter((d) => d === true).length;
  const missed = habit.days.length - done;
  const percent = habit.days.length === 0 ? 0 : Math.round((done / habit.days.length) * 100);

  // Série actuelle : nombre de "true" en fin de tableau
  let currentStreak = 0;
  for (let i = habit.days.length - 1; i >= 0; i--) {
    if (habit.days[i]) currentStreak++;
    else break;
  }

  // Meilleure série : plus longue suite de "true" n'importe où
  let bestStreak = 0;
  let temp = 0;
  for (let i = 0; i < habit.days.length; i++) {
    if (habit.days[i]) {
      temp++;
      if (temp > bestStreak) bestStreak = temp;
    } else {
      temp = 0;
    }
  }

  return { done, missed, percent, currentStreak, bestStreak };
}