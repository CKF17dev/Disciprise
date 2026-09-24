// utils/storage.js — stockage des données (localStorage).
// Même rôle que l'ancien storage.js du frontend sans React.

// LIRE une valeur. "fallback" = valeur par défaut si rien n'existe.
export function storageLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // localStorage indisponible -> on ignore
  }
  return fallback;
}

// ÉCRIRE une valeur.
export function storageSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // on ignore silencieusement
  }
}

// SUPPRIMER une valeur.
export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // on ignore silencieusement
  }
}