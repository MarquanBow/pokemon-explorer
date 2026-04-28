import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { saveTeam, getTeams, deleteTeam, updateTeam } from "../api";
import { useAuth } from "../context/AuthContext";

const TYPE_COLORS = {
  fire: "#f94144", water: "#277da1", grass: "#43aa8b", electric: "#f9c74f",
  poison: "#9d4edd", flying: "#90be6d", psychic: "#f72585", bug: "#70c000",
  rock: "#9c6644", ghost: "#7b2d8b", ice: "#48cae4", dragon: "#3a0ca3",
  dark: "#4a4e69", steel: "#8d99ae", fairy: "#f4a2c0", fighting: "#e76f51",
  ground: "#d4a373", normal: "#adb5bd",
};

const VERSION_GROUPS = [
  { name: "champions", label: "Pokémon Champions" },
  { name: "scarlet-violet", label: "Scarlet / Violet" },
  { name: "the-indigo-disk", label: "The Indigo Disk" },
  { name: "the-teal-mask", label: "The Teal Mask" },
  { name: "legends-arceus", label: "Legends: Arceus" },
  { name: "brilliant-diamond-shining-pearl", label: "Brilliant Diamond / Shining Pearl" },
  { name: "the-crown-tundra", label: "Crown Tundra" },
  { name: "the-isle-of-armor", label: "Isle of Armor" },
  { name: "sword-shield", label: "Sword / Shield" },
  { name: "lets-go-pikachu-lets-go-eevee", label: "Let's Go Pikachu / Eevee" },
  { name: "ultra-sun-ultra-moon", label: "Ultra Sun / Ultra Moon" },
  { name: "sun-moon", label: "Sun / Moon" },
  { name: "omega-ruby-alpha-sapphire", label: "Omega Ruby / Alpha Sapphire" },
  { name: "x-y", label: "X / Y" },
  { name: "black-2-white-2", label: "Black 2 / White 2" },
  { name: "black-white", label: "Black / White" },
  { name: "heartgold-soulsilver", label: "HeartGold / SoulSilver" },
  { name: "platinum", label: "Platinum" },
  { name: "diamond-pearl", label: "Diamond / Pearl" },
  { name: "firered-leafgreen", label: "FireRed / LeafGreen" },
  { name: "emerald", label: "Emerald" },
  { name: "ruby-sapphire", label: "Ruby / Sapphire" },
  { name: "crystal", label: "Crystal" },
  { name: "gold-silver", label: "Gold / Silver" },
  { name: "yellow", label: "Yellow" },
  { name: "red-blue", label: "Red / Blue" },
];

const METHOD_ORDER = { "level-up": 0, machine: 1, tutor: 2, egg: 3 };
const METHOD_LABELS = { "level-up": "Lv", machine: "TM", tutor: "Tutor", egg: "Egg" };

function getAvailableMoves(allMoves, selectedGame) {
  return allMoves
    .map((m) => {
      const relevant = selectedGame
        ? m.versionDetails.filter((v) => v.versionGroup === selectedGame)
        : m.versionDetails;
      return { name: m.name, details: relevant };
    })
    .filter((m) => m.details.length > 0)
    .sort((a, b) => {
      if (selectedGame) {
        const aBest = Math.min(...a.details.map((d) => METHOD_ORDER[d.method] ?? 99));
        const bBest = Math.min(...b.details.map((d) => METHOD_ORDER[d.method] ?? 99));
        if (aBest !== bBest) return aBest - bBest;
        if (aBest === 0) {
          const aLv = Math.min(...a.details.filter((d) => d.method === "level-up").map((d) => d.level));
          const bLv = Math.min(...b.details.filter((d) => d.method === "level-up").map((d) => d.level));
          return aLv - bLv;
        }
      }
      return a.name.localeCompare(b.name);
    });
}

const ALL_TYPES = [
  "normal","fire","water","electric","grass","ice","fighting","poison",
  "ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
];

const STAT_LABELS = {
  hp: "HP", attack: "Atk", defense: "Def",
  "special-attack": "SpA", "special-defense": "SpD", speed: "Spe",
};

const STAT_COLORS = {
  hp: "#ff5959", attack: "#f5ac78", defense: "#fae078",
  "special-attack": "#9db7f5", "special-defense": "#a7db8d", speed: "#fa92b2",
};

// Offensive effectiveness: OFFENSE[attackType][defenseType] = multiplier (omitted = 1)
const OFFENSE = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

function getMult(attackType, defTypes) {
  return defTypes.reduce((mult, dt) => mult * (OFFENSE[attackType]?.[dt] ?? 1), 1);
}

// Returns set of defending types that are covered (≥2x) by any of the given attacking types
function getOffensiveCoverage(attackTypes) {
  const covered = new Set();
  for (const at of attackTypes) {
    for (const dt of ALL_TYPES) {
      if ((OFFENSE[at]?.[dt] ?? 1) >= 2) covered.add(dt);
    }
  }
  return covered;
}

// For each attacking type, counts how many team Pokemon take ≥2x from it
function getDefensiveWeaknesses(team) {
  const weakTo = {};
  for (const at of ALL_TYPES) {
    weakTo[at] = team.filter((p) => getMult(at, p.types) >= 2).length;
  }
  return weakTo;
}

function TypeBadge({ type }) {
  return (
    <span
      className="text-white text-xs px-2.5 py-0.5 rounded-full font-bold capitalize"
      style={{ backgroundColor: TYPE_COLORS[type] ?? "#adb5bd" }}
    >
      {type}
    </span>
  );
}

function MiniStatBar({ stat }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-bold text-gray-400 w-7 text-right shrink-0">
        {STAT_LABELS[stat.stat.name] ?? stat.stat.name}
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full"
          style={{
            width: `${Math.min(100, (stat.base_stat / 255) * 100)}%`,
            backgroundColor: STAT_COLORS[stat.stat.name] ?? "#adb5bd",
          }}
        />
      </div>
      <span className="text-xs font-black text-gray-600 w-6 shrink-0">{stat.base_stat}</span>
    </div>
  );
}

function TypeCoveragePanel({ team }) {
  // Offensive: use selected move types; fall back to Pokemon types if no moves chosen
  const attackTypes = [...new Set(
    team.flatMap((p) =>
      p.moves.length > 0 ? p.moves.map((m) => m.type) : p.types
    )
  )];
  const covered = getOffensiveCoverage(attackTypes);
  const weakTo = getDefensiveWeaknesses(team);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-3">
          Offensive Coverage
          <span className="text-gray-300 font-semibold ml-1 normal-case">
            ({covered.size}/18 types covered)
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => (
            <span
              key={t}
              className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize transition-opacity"
              style={{
                backgroundColor: covered.has(t) ? (TYPE_COLORS[t] ?? "#adb5bd") : "#f1f5f9",
                color: covered.has(t) ? "white" : "#94a3b8",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-3">
          Team Weaknesses
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const count = weakTo[t];
            if (count === 0) return null;
            return (
              <span
                key={t}
                className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize text-white"
                style={{ backgroundColor: TYPE_COLORS[t] ?? "#adb5bd", opacity: count >= 2 ? 1 : 0.6 }}
              >
                {t} ×{count}
              </span>
            );
          })}
        </div>
        {ALL_TYPES.every((t) => weakTo[t] === 0) && (
          <p className="text-gray-400 text-sm font-semibold">No weaknesses! 🏆</p>
        )}
      </div>
    </div>
  );
}

export default function TeamBuilder() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [savedTeams, setSavedTeams] = useState([]);
  const [teamName, setTeamName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [allNames, setAllNames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const [moveTypeCache, setMoveTypeCache] = useState({});
  const [loadingMove, setLoadingMove] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!user) { setSavedTeams([]); setTeam([]); setTeamName(""); return; }
    getTeams(user.uid)
      .then((res) => setSavedTeams(res?.data ?? []))
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, [user]);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1302")
      .then((r) => r.json())
      .then((d) => setAllNames(d.results.map((p) => p.name)));
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const matches = allNames
      .filter((n) => n.includes(term))
      .sort((a, b) => {
        const aStarts = a.startsWith(term), bStarts = b.startsWith(term);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [searchTerm, allNames]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPokemon = async (name) => {
    setSearchError("");
    setSearchResult(null);
    setSearchLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!res.ok) throw new Error("Pokémon not found");
      const data = await res.json();
      const allMoves = data.moves.map((m) => ({
        name: m.move.name,
        versionDetails: m.version_group_details.map((v) => ({
          method: v.move_learn_method.name,
          level: v.level_learned_at,
          versionGroup: v.version_group.name,
        })),
      }));
      setSearchResult({
        name: data.name,
        types: data.types.map((t) => t.type.name),
        sprite: data.sprites.front_default,
        stats: data.stats,
        allMoves,
        selectedMoves: [],
      });
    } catch (err) {
      setSearchError(err.message);
    }
    setSearchLoading(false);
  };

  const handleSelectSuggestion = (name) => { setSearchTerm(name); fetchPokemon(name); };
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") fetchPokemon(searchTerm);
    else if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleToggleMove = async (moveName) => {
    const isSelected = searchResult.selectedMoves.find((m) => m.name === moveName);
    if (isSelected) {
      setSearchResult((prev) => ({
        ...prev,
        selectedMoves: prev.selectedMoves.filter((m) => m.name !== moveName),
      }));
      return;
    }
    if (searchResult.selectedMoves.length >= 4) return;

    let moveType = moveTypeCache[moveName];
    if (!moveType) {
      setLoadingMove(moveName);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
        const data = await res.json();
        moveType = data.type.name;
        setMoveTypeCache((prev) => ({ ...prev, [moveName]: moveType }));
      } catch {
        moveType = "normal";
      }
      setLoadingMove(null);
    }

    setSearchResult((prev) => ({
      ...prev,
      selectedMoves: [...prev.selectedMoves, { name: moveName, type: moveType }],
    }));
  };

  const addToTeam = (pokemon) => {
    if (team.length >= 6) { toast.error("Team is full! Max 6 Pokémon."); return; }
    if (team.find((p) => p.name === pokemon.name)) { toast.warning("Already in your team!"); return; }
    setTeam([...team, {
      name: pokemon.name,
      types: pokemon.types,
      sprite: pokemon.sprite,
      stats: pokemon.stats,
      moves: pokemon.selectedMoves,
    }]);
    setSearchResult(null);
    setSearchTerm("");
  };

  const removeFromTeam = (name) => setTeam(team.filter((p) => p.name !== name));

  const handleSaveTeam = async () => {
    if (!user) { toast.error("Please log in to save your team."); return; }
    if (!teamName) { toast.error("Give your team a name first."); return; }
    if (team.length === 0) { toast.error("Add at least one Pokémon to your team."); return; }
    const saving = toast.loading("Saving your team...");
    try {
      await saveTeam({
        userId: user.uid,
        teamName,
        pokemons: team.map((p) => ({ name: p.name, moves: p.moves })),
      });
      toast.success("Team saved!", { id: saving });
      setTeamName(""); setTeam([]);
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) {
      console.error("Error saving team", err);
      toast.error("Failed to save. The server may be starting up — try again.", { id: saving });
    }
  };

  const handleDelete = async (teamId) => {
    if (!user) return;
    toast("Delete this team?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteTeam(user.uid, teamId);
            const res = await getTeams(user.uid);
            setSavedTeams(res?.data ?? []);
            toast.success("Team deleted.");
          } catch (err) {
            console.error("Failed to delete team", err);
            toast.error("Could not delete team.");
          }
        },
      },
      cancel: { label: "Cancel" },
    });
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
          <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">Team Name</p>
          <input
            type="text"
            placeholder="e.g. Dream Team, Champion Squad..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red mb-5 bg-gray-50"
          />

          <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">Game</p>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red mb-5 bg-gray-50 text-gray-700"
          >
            <option value="">Any Game (show all moves)</option>
            {VERSION_GROUPS.map((g) => (
              <option key={g.name} value={g.name}>{g.label}</option>
            ))}
          </select>

          <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">Add Pokémon</p>
          <div className="relative" ref={searchRef}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Start typing a name… (e.g. pika)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red bg-gray-50 pr-10"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-pokemon-red border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fetchPokemon(searchTerm)}
                className="px-6 py-3 bg-gradient-to-r from-pokemon-blue to-blue-500 text-white font-black rounded-xl shadow-md shadow-blue-400/30 hover:shadow-blue-400/50 hover:scale-105 transition-all duration-200 cursor-pointer text-sm shrink-0"
              >
                Search
              </button>
            </div>

            <AnimatePresence>
              {showSuggestions && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 right-14 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20"
                >
                  {suggestions.map((name) => (
                    <li
                      key={name}
                      onMouseDown={() => handleSelectSuggestion(name)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${name}.png`}
                        alt={name}
                        className="w-8 h-8"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <span className="text-sm font-bold text-gray-700 capitalize">{name}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {searchError && (
            <p className="text-red-500 text-sm font-semibold mt-3 bg-red-50 px-4 py-2 rounded-xl">{searchError}</p>
          )}
        </div>

        {/* Search Result — expanded card with stats + move picker */}
        {searchResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-400" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: sprite, types, stats */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img src={searchResult.sprite} alt={searchResult.name} className="w-20 h-20" />
                  <div>
                    <h3 className="font-black text-gray-800 text-xl capitalize mb-1">{searchResult.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {searchResult.types.map((t) => <TypeBadge key={t} type={t} />)}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">Base Stats</p>
                <div className="space-y-1.5">
                  {searchResult.stats.map((s) => <MiniStatBar key={s.stat.name} stat={s} />)}
                </div>
              </div>

              {/* Right: move picker */}
              <div>
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">
                  Select Moves
                  <span className="text-gray-300 font-semibold ml-1 normal-case">
                    ({searchResult.selectedMoves.length}/4)
                  </span>
                </p>

                {/* Selected moves */}
                {searchResult.selectedMoves.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {searchResult.selectedMoves.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => handleToggleMove(m.name)}
                        className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1 rounded-lg capitalize"
                        style={{ backgroundColor: TYPE_COLORS[m.type] ?? "#adb5bd" }}
                      >
                        {m.name.replace(/-/g, " ")}
                        <span className="opacity-70">✕</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Move list */}
                <div className="h-44 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50">
                  {getAvailableMoves(searchResult.allMoves, selectedGame).map((move) => {
                    const isSelected = searchResult.selectedMoves.find((m) => m.name === move.name);
                    const isLoading = loadingMove === move.name;
                    const isDisabled = !isSelected && searchResult.selectedMoves.length >= 4;
                    const cachedType = moveTypeCache[move.name];
                    const primaryDetail = move.details.reduce((best, d) =>
                      (METHOD_ORDER[d.method] ?? 99) < (METHOD_ORDER[best.method] ?? 99) ? d : best,
                      move.details[0]
                    );
                    const methodLabel = primaryDetail
                      ? primaryDetail.method === "level-up"
                        ? `Lv.${primaryDetail.level}`
                        : METHOD_LABELS[primaryDetail.method] ?? primaryDetail.method
                      : null;
                    return (
                      <button
                        key={move.name}
                        onClick={() => handleToggleMove(move.name)}
                        disabled={isDisabled || isLoading}
                        className={`w-full text-left px-3 py-2 text-sm font-semibold capitalize flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-red-50 text-pokemon-red"
                            : isDisabled
                            ? "text-gray-300 cursor-not-allowed"
                            : "hover:bg-red-50 text-gray-700 cursor-pointer"
                        }`}
                      >
                        <span>{move.name.replace(/-/g, " ")}</span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {isLoading && (
                            <div className="w-3 h-3 border-2 border-pokemon-red border-t-transparent rounded-full animate-spin" />
                          )}
                          {!isLoading && cachedType && !isSelected && (
                            <span
                              className="text-xs text-white px-1.5 py-0.5 rounded font-bold"
                              style={{ backgroundColor: TYPE_COLORS[cachedType] ?? "#adb5bd" }}
                            >
                              {cachedType}
                            </span>
                          )}
                          {selectedGame && methodLabel && !isSelected && (
                            <span className="text-xs font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                              {methodLabel}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Click a move to select it — type loads on first click.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => addToTeam(searchResult)}
                className="px-8 py-3 bg-gradient-to-r from-pokemon-teal to-teal-500 text-white font-black rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer text-sm"
              >
                + Add to Team
              </button>
            </div>
          </motion.div>
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                    <div className="text-5xl mb-2">🎯</div>
                    <p className="text-gray-400 font-semibold text-sm">Search for a Pokémon above to build your team!</p>
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
                      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-44"
                    >
                      <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />
                      <div className="p-3">
                        <div className="w-20 h-20 mx-auto rounded-xl flex items-center justify-center mb-1" style={{ backgroundColor: primaryColor + "18" }}>
                          <img src={p.sprite} alt={p.name} className="w-16 h-16" />
                        </div>
                        <h3 className="font-black text-gray-800 text-xs mb-1.5 capitalize text-center">{p.name}</h3>
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {p.types.map((type) => (
                            <span key={type} className="text-white text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: TYPE_COLORS[type] ?? "#adb5bd" }}>
                              {type}
                            </span>
                          ))}
                        </div>

                        {/* Mini stat bars */}
                        {p.stats && (
                          <div className="space-y-0.5 mb-2">
                            {p.stats.map((s) => <MiniStatBar key={s.stat.name} stat={s} />)}
                          </div>
                        )}

                        {/* Selected moves */}
                        {p.moves.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {p.moves.map((m) => (
                              <span
                                key={m.name}
                                className="text-white text-xs px-1.5 py-0.5 rounded font-bold capitalize"
                                style={{ backgroundColor: TYPE_COLORS[m.type] ?? "#adb5bd", fontSize: "9px" }}
                              >
                                {m.name.replace(/-/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}

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

        {/* Type Coverage */}
        {team.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-black text-gray-700 mb-5">⚔️ Type Coverage</h2>
            <TypeCoveragePanel team={team} />
          </div>
        )}

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
                      {t.pokemons.map((p) => {
                        const pokeName = typeof p === "string" ? p : p.name;
                        const pokeMoves = typeof p === "string" ? [] : (p.moves ?? []);
                        return (
                          <div key={pokeName} className="flex flex-col items-center gap-1">
                            <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                              <img src={`https://img.pokemondb.net/sprites/home/normal/${pokeName}.png`} alt={pokeName} className="w-12 h-12" />
                            </div>
                            <span className="text-xs text-gray-400 font-semibold capitalize">{pokeName}</span>
                            {pokeMoves.length > 0 && (
                              <div className="flex flex-wrap gap-0.5 justify-center max-w-16">
                                {pokeMoves.map((m) => (
                                  <span
                                    key={m.name}
                                    className="text-white font-bold capitalize rounded"
                                    style={{ backgroundColor: TYPE_COLORS[m.type] ?? "#adb5bd", fontSize: "8px", padding: "1px 4px" }}
                                  >
                                    {m.name.replace(/-/g, " ")}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
