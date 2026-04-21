import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getTeams, deleteTeam, updateTeam } from "../api";
import { useAuth } from "../context/AuthContext";

export default function SavedTeams() {
  const { user } = useAuth();
  const [savedTeams, setSavedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTeams = useCallback(async (uid) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeams(uid);
      setSavedTeams(res.data ?? []);
    } catch (err) {
      const isTimeout = err.code === "ECONNABORTED";
      setError(
        isTimeout
          ? "The server is taking a while to start up. Please try again."
          : "Could not load your teams. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user === undefined) return; // auth still initialising
    if (!user) { setLoading(false); return; }
    loadTeams(user.uid);
  }, [user, loadTeams]);

  const handleDelete = async (teamId) => {
    if (!user || !window.confirm("Delete this team?")) return;
    await deleteTeam(user.uid, teamId);
    loadTeams(user.uid);
  };

  const handleRename = async (teamId, newName) => {
    if (!user) return;
    await updateTeam(user.uid, teamId, { teamName: newName });
    loadTeams(user.uid);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-red-50 text-pokemon-red text-sm font-bold px-4 py-1.5 rounded-full mb-4 border border-red-100">
            📁 My Teams
          </span>
          <h1 className="text-5xl font-black bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 bg-clip-text text-transparent mb-2">
            Saved Teams
          </h1>
          <p className="text-gray-400 font-semibold">Manage and rename your Pokémon squads</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Loading"
              className="w-12 mx-auto mb-3 animate-spin"
            />
            <p className="text-gray-500 font-semibold">Loading your teams...</p>
            <p className="text-gray-400 text-xs mt-1">This may take a moment if the server is starting up.</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-md border border-red-100">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-gray-700 font-black text-xl mb-2">Something went wrong</p>
            <p className="text-gray-400 font-semibold text-sm mb-6 max-w-xs mx-auto">{error}</p>
            <button
              onClick={() => loadTeams(user.uid)}
              className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black rounded-2xl shadow-md shadow-red-400/30 hover:shadow-red-400/50 hover:-translate-y-0.5 transition-all duration-200 text-sm cursor-pointer"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Not logged in */}
        {!loading && !error && !user && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-md border border-gray-100">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-700 font-black text-xl mb-2">Log in to view your teams</p>
            <p className="text-gray-400 font-semibold text-sm">Your saved Pokémon teams will appear here.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && user && savedTeams.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-md border border-gray-100">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-700 font-black text-xl mb-2">No teams saved yet</p>
            <p className="text-gray-400 font-semibold text-sm mb-6">Head over to Team Builder to create your first squad!</p>
            <Link
              to="/team-builder"
              className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black rounded-2xl shadow-md shadow-red-400/30 hover:shadow-red-400/50 hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              🛠️ Build a Team
            </Link>
          </div>
        )}

        {/* Teams list */}
        {!loading && !error && user && savedTeams.length > 0 && (
          <div className="flex flex-col gap-5">
            {savedTeams.map((team, idx) => (
              <div
                key={team.id}
                className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="w-7 h-7 bg-gradient-to-br from-red-500 to-rose-400 text-white text-xs font-black rounded-full flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={team.teamName}
                    onChange={(e) => handleRename(team.id, e.target.value)}
                    className="font-black text-gray-800 text-lg flex-1 bg-transparent border-b-2 border-transparent hover:border-red-200 focus:border-pokemon-red focus:outline-none transition-colors pb-0.5"
                  />
                  <span className="text-xs text-gray-400 font-bold bg-white px-2.5 py-1 rounded-lg border border-gray-200 shrink-0">
                    {team.pokemons.length} / 6
                  </span>
                </div>

                <div className="px-6 py-5">
                  <div className="flex flex-wrap gap-4 mb-5">
                    {team.pokemons.map((p) => (
                      <Link key={p} to={`/pokemon/${p}`} className="flex flex-col items-center gap-1 group">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-red-50 group-hover:scale-110 transition-all duration-200">
                          <img
                            src={`https://img.pokemondb.net/sprites/home/normal/${p}.png`}
                            alt={p}
                            className="w-14 h-14"
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-bold group-hover:text-pokemon-red transition-colors">{p}</span>
                      </Link>
                    ))}
                    {Array.from({ length: 6 - team.pokemons.length }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                          <span className="text-gray-300 text-lg">+</span>
                        </div>
                        <span className="text-xs text-gray-200 font-bold">empty</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDelete(team.id)}
                    className="bg-red-50 text-pokemon-red text-xs font-black px-4 py-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer border border-red-100"
                  >
                    🗑️ Delete Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
