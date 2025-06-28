// src/pages/SavedTeams.jsx
import { useState, useEffect } from "react";
import { getTeams, deleteTeam, updateTeam } from "../api";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function SavedTeams() {
  const [user, setUser] = useState(null);
  const [savedTeams, setSavedTeams] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const res = await getTeams(currentUser.uid);
        setSavedTeams(res.data);
      }
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (teamId) => {
    if (!user) return;
    if (!window.confirm("Delete this team?")) return;
    await deleteTeam(user.uid, teamId);
    const res = await getTeams(user.uid);
    setSavedTeams(res.data);
  };

  const handleRename = async (teamId, newName) => {
    if (!user) return;
    await updateTeam(user.uid, teamId, { teamName: newName });
    const res = await getTeams(user.uid);
    setSavedTeams(res.data);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", color: "#023047" }}>📁 Your Saved Teams</h1>
      {savedTeams.length === 0 && <p style={{ textAlign: "center" }}>No saved teams yet.</p>}
      {savedTeams.map((team) => (
        <div key={team.id} style={{ margin: "1rem 0", padding: "1rem", background: "#f1faee", borderRadius: "10px" }}>
          <input
            type="text"
            value={team.teamName}
            onChange={(e) => handleRename(team.id, e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {team.pokemons.map((p) => (
              <img
                key={p}
                src={`https://img.pokemondb.net/sprites/home/normal/${p}.png`}
                alt={p}
                width={60}
              />
            ))}
          </div>
          <button
            onClick={() => handleDelete(team.id)}
            style={{ marginTop: "0.5rem", background: "#ef233c", color: "#fff", border: "none", borderRadius: "6px", padding: "0.4rem 1rem" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
