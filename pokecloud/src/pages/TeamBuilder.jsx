import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveTeam, getTeams, deleteTeam, updateTeam } from "../api";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function TeamBuilder() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [savedTeams, setSavedTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedTeams([]);
      setTeam([]);
      setTeamName("");
      return;
    }
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
      setSearchResult({
        name: data.name,
        types: data.types.map((t) => t.type.name),
        sprite: data.sprites.front_default,
      });
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
      alert("Team saved successfully!");
      setTeamName("");
      setTeam([]);
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
    } catch (err) {
      console.error("Failed to delete team", err);
    }
  };

  const handleRename = async (teamId, newName) => {
    if (!user) return;
    try {
      await updateTeam(user.uid, teamId, { teamName: newName });
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) {
      console.error("Failed to rename team", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center text-4xl font-black text-pokemon-red mb-2">🛠️ Team Builder</h1>
        <p className="text-center text-gray-400 mb-10">Build and save your ultimate Pokémon team</p>

        {/* Team Name + Search */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pokemon-red"
            />
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search Pokémon by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pokemon-red"
            />
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-pokemon-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {searchError && (
          <p className="text-center text-red-500 text-sm mb-4">{searchError}</p>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 w-52 text-center"
            >
              <img src={searchResult.sprite} alt={searchResult.name} className="w-28 h-28 mx-auto" />
              <h3 className="font-black text-pokemon-dark text-sm mt-1">
                {searchResult.name.toUpperCase()}
              </h3>
              <div className="flex flex-wrap justify-center gap-1 mt-2 mb-4">
                {searchResult.types.map((type) => (
                  <span
                    key={type}
                    className="text-white text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: getTypeColor(type) }}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <button
                onClick={() => addToTeam(searchResult)}
                className="w-full bg-pokemon-teal text-white font-semibold py-2 rounded-xl hover:bg-teal-700 transition-colors text-sm cursor-pointer"
              >
                + Add to Team
              </button>
            </motion.div>
          </div>
        )}

        {/* Current Team */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-pokemon-dark mb-4 text-center">
            Your Team ({team.length}/6)
          </h2>
          <div className="bg-blue-50 rounded-2xl p-6 min-h-48 border border-blue-100">
            <div className="flex gap-4 justify-center flex-wrap">
              <AnimatePresence>
                {team.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 text-sm self-center py-8"
                  >
                    Search for Pokémon above to build your team!
                  </motion.p>
                )}
                {team.map((p) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 w-44 text-center"
                  >
                    <img src={p.sprite} alt={p.name} className="w-24 h-24 mx-auto" />
                    <h3 className="font-black text-pokemon-dark text-xs mt-1">
                      {p.name.toUpperCase()}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-1 mt-2 mb-3">
                      {p.types.map((type) => (
                        <span
                          key={type}
                          className="text-white text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => removeFromTeam(p.name)}
                      className="w-full bg-red-50 text-pokemon-red text-xs font-semibold py-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleSaveTeam}
            disabled={!user}
            className={`px-10 py-3 rounded-xl font-bold text-white text-base transition-colors cursor-pointer ${
              user
                ? "bg-pokemon-blue hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            💾 Save Team
          </button>
          {!user && (
            <p className="text-red-500 text-sm mt-2">Please log in to save your team.</p>
          )}
        </div>

        {/* Saved Teams */}
        {user && savedTeams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-pokemon-dark mb-6 text-center">📁 Saved Teams</h2>
            <div className="flex flex-col gap-4">
              {savedTeams.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <input
                    type="text"
                    value={t.teamName}
                    onChange={(e) => handleRename(t.id, e.target.value)}
                    className="font-bold text-gray-800 text-base w-full mb-4 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pokemon-red"
                  />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {t.pokemons.map((name) => (
                      <div key={name} className="flex flex-col items-center">
                        <img
                          src={`https://img.pokemondb.net/sprites/home/normal/${name}.png`}
                          alt={name}
                          className="w-14 h-14 bg-gray-50 rounded-xl"
                        />
                        <span className="text-xs text-gray-400 mt-1">{name}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="bg-red-50 text-pokemon-red text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    🗑️ Delete Team
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTypeColor(type) {
  const colors = {
    fire: "#f94144",
    water: "#277da1",
    grass: "#43aa8b",
    electric: "#f9c74f",
    poison: "#9d4edd",
    flying: "#90be6d",
    psychic: "#f72585",
    bug: "#70e000",
    rock: "#9c6644",
    ghost: "#7b2d8b",
    ice: "#48cae4",
    dragon: "#3a0ca3",
    dark: "#4a4e69",
    steel: "#8d99ae",
    fairy: "#f4a2c0",
    fighting: "#e76f51",
    ground: "#d4a373",
    normal: "#adb5bd",
  };
  return colors[type] ?? "#adb5bd";
}
