import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveTeam, getTeams, deleteTeam, updateTeam } from "../api";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const TYPE_COLORS = {
  fire: "#f94144", water: "#277da1", grass: "#43aa8b", electric: "#f9c74f",
  poison: "#9d4edd", flying: "#90be6d", psychic: "#f72585", bug: "#70c000",
  rock: "#9c6644", ghost: "#7b2d8b", ice: "#48cae4", dragon: "#3a0ca3",
  dark: "#4a4e69", steel: "#8d99ae", fairy: "#f4a2c0", fighting: "#e76f51",
  ground: "#d4a373", normal: "#adb5bd",
};

export default function TeamBuilder() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [savedTeams, setSavedTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) { setSavedTeams([]); setTeam([]); setTeamName(""); return; }
    getTeams(user.uid)
      .then((res) => setSavedTeams(res?.data ?? []))
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, [user]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setSearchError("");
    setSearchResult(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      if (!res.ok) throw new Error("Pokémon not found");
      const data = await res.json();
      setSearchResult({ name: data.name, types: data.types.map((t) => t.type.name), sprite: data.sprites.front_default });
    } catch (error) {
      setSearchError(error.message);
    }
  };

  const addToTeam = (pokemon) => {
    if (team.length >= 6) return alert("Team is full! Max 6 Pokémon.");
    if (team.find((p) => p.name === pokemon.name)) return alert("Already in team!");
    setTeam([...team, pokemon]);
    setSearchResult(null);
    setSearchTerm("");
  };

  const removeFromTeam = (name) => setTeam(team.filter((p) => p.name !== name));

  const handleSaveTeam = async () => {
    if (!user) return alert("Please log in to save your team.");
    if (!teamName) return alert("Enter a team name.");
    if (team.length === 0) return alert("Add at least one Pokémon to your team.");
    try {
      await saveTeam({ userId: user.uid, teamName, pokemons: team.map((p) => p.name) });
      alert("Team saved!");
      setTeamName(""); setTeam([]);
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) {
      console.error("Error saving team", err);
      alert("Failed to save team.");
    }
  };

  const handleDelete = async (teamId) => {
    if (!user || !window.confirm("Delete this team?")) return;
    try {
      await deleteTeam(user.uid, teamId);
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) { console.error("Failed to delete team", err); }
  };

  const handleRename = async (teamId, newName) => {
    if (!user) return;
    try {
      await updateTeam(user.uid, teamId, { teamName: newName });
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) { console.error("Failed to rename team", err); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-red-50 text-pokemon-red text-sm font-bold px-4 py-1.5 rounded-full mb-4 border border-red-100">
            🛠️ Team Builder
          </span>
          <h1 className="text-5xl font-black bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 bg-clip-text text-transparent mb-2">
            Build Your Team
          </h1>
          <p className="text-gray-400 font-semibold">Add up to 6 Pokémon and save your squad</p>
        </div>

        {/* Search Panel */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-8">
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-3">Team Name</p>
          <input
            type="text"
            placeholder="e.g. Dream Team, Champion Squad..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red mb-5 bg-gray-50"
          />
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-3">Add Pokémon</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name (e.g. pikachu)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red bg-gray-50"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-pokemon-blue to-blue-500 text-white font-black rounded-xl shadow-md shadow-blue-400/30 hover:shadow-blue-400/50 hover:scale-105 transition-all duration-200 cursor-pointer text-sm"
            >
              Search
            </button>
          </div>
          {searchError && (
            <p className="text-red-500 text-sm font-semibold mt-3 bg-red-50 px-4 py-2 rounded-xl">{searchError}</p>
          )}
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 w-52 text-center overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-400" />
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-2 bg-gray-50">
                <img src={searchResult.sprite} alt={searchResult.name} className="w-20 h-20" />
              </div>
              <h3 className="font-black text-gray-800 text-sm mb-2">{searchResult.name.toUpperCase()}</h3>
              <div className="flex flex-wrap justify-center gap-1 mb-4">
                {searchResult.types.map((type) => (
                  <span key={type} className="text-white text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: TYPE_COLORS[type] ?? "#adb5bd" }}>
                    {type}
                  </span>
                ))}
              </div>
              <button
                onClick={() => addToTeam(searchResult)}
                className="w-full bg-gradient-to-r from-pokemon-teal to-teal-500 text-white font-black py-2 rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer text-sm"
              >
                + Add to Team
              </button>
            </motion.div>
          </div>
        )}

        {/* Current Team */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-700">Your Team</h2>
            <span className="bg-red-50 text-pokemon-red text-sm font-black px-3 py-1 rounded-full border border-red-100">
              {team.length} / 6
            </span>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 min-h-48 border border-blue-100">
            <div className="flex gap-4 justify-center flex-wrap">
              <AnimatePresence>
                {team.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                  >
                    <div className="text-5xl mb-2">🎯</div>
                    <p className="text-gray-400 font-semibold text-sm">Search for a Pokémon to add it to your team!</p>
                  </motion.div>
                )}
                {team.map((p) => {
                  const primaryColor = TYPE_COLORS[p.types[0]] ?? "#adb5bd";
                  return (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-40 text-center"
                    >
                      <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />
                      <div className="p-4">
                        <div className="w-20 h-20 mx-auto rounded-xl flex items-center justify-center mb-1" style={{ backgroundColor: primaryColor + "18" }}>
                          <img src={p.sprite} alt={p.name} className="w-16 h-16" />
                        </div>
                        <h3 className="font-black text-gray-800 text-xs mb-2">{p.name.toUpperCase()}</h3>
                        <div className="flex flex-wrap justify-center gap-1 mb-3">
                          {p.types.map((type) => (
                            <span key={type} className="text-white text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: TYPE_COLORS[type] ?? "#adb5bd" }}>
                              {type}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => removeFromTeam(p.name)}
                          className="w-full bg-red-50 text-pokemon-red text-xs font-black py-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mb-14">
          <button
            onClick={handleSaveTeam}
            disabled={!user}
            className={`px-10 py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all duration-200 cursor-pointer ${
              user
                ? "bg-gradient-to-r from-red-600 to-rose-500 shadow-red-400/30 hover:shadow-red-400/50 hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            💾 Save Team
          </button>
          {!user && (
            <p className="text-gray-400 text-sm font-semibold mt-2">Log in to save your team.</p>
          )}
        </div>

        {/* Saved Teams */}
        {user && savedTeams.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-gray-700 mb-6 text-center">📁 Saved Teams</h2>
            <div className="flex flex-col gap-4">
              {savedTeams.map((t) => (
                <div key={t.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <input
                      type="text"
                      value={t.teamName}
                      onChange={(e) => handleRename(t.id, e.target.value)}
                      className="font-black text-gray-800 text-base flex-1 bg-transparent border-b-2 border-transparent hover:border-red-200 focus:border-pokemon-red focus:outline-none transition-colors pb-0.5"
                    />
                    <span className="text-xs text-gray-400 font-semibold bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                      {t.pokemons.length} Pokémon
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-3 mb-4">
                      {t.pokemons.map((name) => (
                        <div key={name} className="flex flex-col items-center gap-1">
                          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                            <img src={`https://img.pokemondb.net/sprites/home/normal/${name}.png`} alt={name} className="w-12 h-12" />
                          </div>
                          <span className="text-xs text-gray-400 font-semibold">{name}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="bg-red-50 text-pokemon-red text-xs font-black px-4 py-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer border border-red-100"
                    >
                      🗑️ Delete Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
