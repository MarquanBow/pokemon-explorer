import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const TYPE_COLORS = {
  fire: "#f94144", water: "#277da1", grass: "#43aa8b", electric: "#f9c74f",
  poison: "#9d4edd", flying: "#90be6d", psychic: "#f72585", bug: "#70c000",
  rock: "#9c6644", ghost: "#7b2d8b", ice: "#48cae4", dragon: "#3a0ca3",
  dark: "#4a4e69", steel: "#8d99ae", fairy: "#f4a2c0", fighting: "#e76f51",
  ground: "#d4a373", normal: "#adb5bd",
};

export default function Home() {
  const [randomFact, setRandomFact] = useState("");
  const [randomPokemon, setRandomPokemon] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    const factRes = await fetch("/pokemon-facts.json");
    const facts = await factRes.json();
    setRandomFact(facts[Math.floor(Math.random() * facts.length)]);

    const indices = Array.from({ length: 3 }, () => Math.floor(Math.random() * 898) + 1);
    const data = await Promise.all(
      indices.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json()))
    );
    setRandomPokemon(data);
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-red-50 text-pokemon-red text-sm font-bold px-4 py-1.5 rounded-full mb-5 border border-red-100">
            ⚡ Your Pokémon Command Center
          </span>
          <h1 className="text-6xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-rose-500 to-red-600 bg-clip-text text-transparent">
              PokéCloud ☁️
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Build the perfect team, explore every Pokémon, and become the ultimate Trainer.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/team-builder"
              className="px-7 py-3.5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black rounded-2xl shadow-lg shadow-red-400/40 hover:shadow-red-400/60 hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              🛠️ Build a Team
            </Link>
            <Link
              to="/search"
              className="px-7 py-3.5 bg-white text-pokemon-red font-black rounded-2xl shadow-md border border-red-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              🔍 Explore Pokédex
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Fact Card */}
      <div className="max-w-5xl mx-auto px-6 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 max-w-2xl mx-auto relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-400 to-orange-400 rounded-t-3xl" />
          <div className="text-5xl text-red-100 font-black leading-none mb-3 select-none">"</div>
          <p className="text-gray-700 text-lg leading-relaxed font-semibold -mt-4">{randomFact}</p>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">🧠 Pokémon Fact</span>
            <button
              onClick={fetchContent}
              className="px-4 py-2 bg-gradient-to-r from-pokemon-blue to-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-400/30 hover:shadow-blue-400/50 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              🔄 New Fact
            </button>
          </div>
        </motion.div>
      </div>

      {/* Random Pokemon */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-2xl font-black text-gray-700 mb-8"
        >
          🎲 Random Pokémon of the Day
        </motion.h2>

        {loading ? (
          <div className="text-center py-12">
            <motion.img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Loading"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-16 mx-auto mb-3"
            />
            <p className="text-gray-400 font-semibold">Fetching Pokémon...</p>
          </div>
        ) : (
          <div className="flex gap-6 justify-center flex-wrap">
            {randomPokemon.map((p, index) => {
              const primaryType = p.types[0]?.type.name;
              const typeColor = TYPE_COLORS[primaryType] ?? "#adb5bd";
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * index }}
                  className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-52 text-center group"
                >
                  <div className="h-2 w-full" style={{ backgroundColor: typeColor }} />
                  <div className="p-5">
                    <div
                      className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: typeColor + "18" }}
                    >
                      <img src={p.sprites.front_default} alt={p.name} className="w-20 h-20 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-black text-gray-800 text-sm tracking-wide mb-2">
                      {p.name.toUpperCase()}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-1">
                      {p.types.map((t) => (
                        <span
                          key={t.type.name}
                          className="text-white text-xs px-2.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: TYPE_COLORS[t.type.name] ?? "#adb5bd" }}
                        >
                          {t.type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
