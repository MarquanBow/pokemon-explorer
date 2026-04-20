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
    if (!user || !window.confirm("Delete this team?")) return;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-center text-4xl font-black text-pokemon-dark mb-2">📁 Saved Teams</h1>
        <p className="text-center text-gray-400 mb-10">Manage your saved Pokémon teams</p>

        {!user && (
          <p className="text-center text-gray-400 py-16">Log in to view your saved teams.</p>
        )}

        {user && savedTeams.length === 0 && (
          <p className="text-center text-gray-400 py-16">No saved teams yet. Head to Team Builder to create one!</p>
        )}

        <div className="flex flex-col gap-4">
          {savedTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <input
                type="text"
                value={team.teamName}
                onChange={(e) => handleRename(team.id, e.target.value)}
                className="font-bold text-gray-800 text-lg w-full mb-4 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pokemon-red"
              />
              <div className="flex flex-wrap gap-3 mb-5">
                {team.pokemons.map((p) => (
                  <div key={p} className="flex flex-col items-center">
                    <img
                      src={`https://img.pokemondb.net/sprites/home/normal/${p}.png`}
                      alt={p}
                      className="w-16 h-16 bg-gray-50 rounded-xl"
                    />
                    <span className="text-xs text-gray-400 mt-1">{p}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleDelete(team.id)}
                className="bg-red-50 text-pokemon-red text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
              >
                🗑️ Delete Team
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
