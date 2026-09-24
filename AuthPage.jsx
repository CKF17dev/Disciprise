// components/AuthPage.jsx
// Écran d'inscription / connexion (le premier écran vu).

import { useState } from "react";
import { storageLoad, storageSave } from "../utils/storage.js";

const ACCOUNTS_KEY = "accounts"; // tous les comptes créés
const SESSION_KEY = "session";   // email du compte connecté

// Ce composant reçoit deux "props" (paramètres) de App.jsx :
//  - onLogin(account) : appelé après un login/register réussi
//    pour que App.jsx affiche la vraie application.
export default function AuthPage({ onLogin }) {
  // useState : un état que React surveille.
  // Ici on sait si on affiche "Inscription" ou "Connexion".
  const [mode, setMode] = useState("register");

  // Champs du formulaire (saisie utilisateur)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birth, setBirth] = useState("");
  const [error, setError] = useState("");

  // Liste des comptes déjà créés
  const accounts = storageLoad(ACCOUNTS_KEY, []);

  // Trouve un compte par email
  const findAccount = () => accounts.find((a) => a.email === email.toLowerCase().trim());

  // ---- INSCRIPTION ----
  function register() {
    setError("");

    // Validations simples
    if (!name.trim() || !email || !password || !birth) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (!email.includes("@")) {
      setError("Adresse email invalide.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (findAccount()) {
      setError("Un compte existe déjà avec cet email. Connectez-vous.");
      setMode("login");
      return;
    }

    // Création du compte + connexion immédiate
    const account = { name: name.trim(), email: email.toLowerCase().trim(), password, birth };
    accounts.push(account);
    storageSave(ACCOUNTS_KEY, accounts);
    storageSave(SESSION_KEY, account.email);

    onLogin(account); // on prévient App.jsx que l'utilisateur est connecté
  }

  // ---- CONNEXION ----
  function login() {
    setError("");
    const account = findAccount();
    if (!account || account.password !== password) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    storageSave(SESSION_KEY, account.email);
    onLogin(account);
  }

  // Soumission du formulaire selon le mode
  function handleSubmit(e) {
    e.preventDefault(); // on bloque le rechargement de la page
    if (mode === "register") register();
    else login();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-icon" style={{ margin: "0 auto 16px", width: 54, height: 54, fontSize: 26 }}>
          D
        </div>

        {/* Onglets Inscription / Connexion */}
        <div className="auth-tabs">
          <button type="button" className="auth-tab"
            onClick={() => { setMode("register"); setError(""); }}>
            Inscription
          </button>
          <button type="button" className="auth-tab"
            onClick={() => { setMode("login"); setError(""); }}>
            Connexion
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <h2>Créer mon compte</h2>
              <p>Une seule fois, vos données restent confidentielles.</p>

              <input type="text" placeholder="Nom complet"
                value={name} onChange={(e) => setName(e.target.value)} />
              <input type="email" placeholder="Adresse email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Mot de passe (6 caractères min.)"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type="date" value={birth}
                onChange={(e) => setBirth(e.target.value)} />
            </>
          ) : (
            <>
              <h2>Bon retour !</h2>
              <p>Connectez-vous pour retrouver vos données.</p>

              <input type="email" placeholder="Adresse email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Mot de passe"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary">
            {mode === "register" ? "S'inscrire" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}