import { useState, useEffect } from "react";
import { storageLoad, storageRemove } from "./utils/storage.js";
import Sidebar from "./components/Sidebar.jsx";
import AuthPage from "./components/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HabitsPage from "./pages/HabitsPage.jsx";
import BusinessPage from "./pages/BusinessPage.jsx";

const ACCOUNTS_KEY = "accounts";
const SESSION_KEY = "session";

export default function App() {
  // ---- État : compte connecté ----
  const [user, setUser] = useState(() => {
    // Au premier rendu, on restaure la session si elle existe.
    const accounts = storageLoad(ACCOUNTS_KEY, []);
    const email = storageLoad(SESSION_KEY, null);
    return email ? accounts.find((a) => a.email === email) || null : null;
  });

  // ---- État : page active ----
  const [page, setPage] = useState("dashboard");

  // ---- Clés localStorage propres au compte connecté ----
  // (on utilise vignette `email` et pas "habits" global)
  const prefix = user ? user.email.replace(/[^a-zA-Z0-9]/g, "_") : "";
  const habitKey = prefix ? "habits_" + prefix : null;
  const entriesKey = prefix ? "business_" + prefix : null;
  const goalKey = prefix ? "business_goal_" + prefix : null;

  // ---- Données de l'utilisateur ----
  const [habits, setHabits] = useState([]);
  const [entries, setEntries] = useState([]);
  const [goal, setGoal] = useState(null);

  // useEffect : un code qui tourne après que le composant est affiché.
  // Ici, on charge les données du compte dès qu'on est connecté.
  useEffect(() => {
    if (!user) return;
    setHabits(storageLoad(habitKey, []));
    setEntries(storageLoad(entriesKey, []));
    setGoal(storageLoad(goalKey, null));
  }, [user]); // on recharge si "user" change

  // ---- Connexion réussie (appelé par AuthPage) ----
  function handleLogin(account) {
    setUser(account);
    setPage("dashboard");
  }

  // ---- Déconnexion ----
  function handleLogout() {
    storageRemove(SESSION_KEY);
    setUser(null);
    setHabits([]);
    setEntries([]);
    setGoal(null);
    setPage("dashboard");
  }

  // Si aucun utilisateur n'est connecté : on montre l'écran d'auth.
  // C'est la version React du "formulaire avant d'accéder à la plateforme".
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Sinon : sidebar + la page active.
  return (
    <div className="app">
      <Sidebar user={user} page={page} onNavigate={setPage} onLogout={handleLogout} />

      <main className="main">
        {page === "dashboard" && (
          <DashboardPage
            habits={habits}
            entries={entries}
            onNavigate={setPage}
          />
        )}

        {page === "habits" && (
          <HabitsPage
            habits={habits}
            setHabits={setHabits}
            habitKey={habitKey}
          />
        )}

        {page === "business" && (
          <BusinessPage
            entries={entries}
            setEntries={setEntries}
            entriesKey={entriesKey}
            goal={goal}
            setGoal={setGoal}
            goalKey={goalKey}
          />
        )}
      </main>
    </div>
  );
}