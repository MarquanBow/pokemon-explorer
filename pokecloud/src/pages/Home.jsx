import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-pokemon-red text-5xl font-black mb-2"
        >
          Welcome to PokéCloud! 🌥️
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-400 text-lg mb-10"
        >
          Your ultimate Pokémon team management hub
        </motion.p>

        {/* Fact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-8 mb-14 max-w-2xl mx-auto border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3">🧠 Did You Know?</h2>
          <p className="text-gray-600 text-lg leading-relaxed italic">{randomFact}</p>
          <button
            onClick={fetchContent}
            className="mt-5 px-5 py-2.5 bg-pokemon-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm cursor-pointer"
          >
            🔄 New Fact & Pokémon
          </button>
        </motion.div>

        {/* Random Pokemon */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center text-2xl font-bold text-gray-800 mb-6"
        >
          🎲 Random Pokémon of the Day
        </motion.h2>

        {loading ? (
          <div className="text-center mt-8">
            <motion.img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Loading Pokéball"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-20 mx-auto"
            />
            <p className="text-gray-400 mt-3">Fetching Pokémon...</p>
          </div>
        ) : (
          <div className="flex gap-6 justify-center flex-wrap">
            {randomPokemon.map((p, index) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.15 }}
                className="bg-white rounded-2xl p-6 w-48 text-center shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <img
                  src={p.sprites.front_default}
                  alt={p.name}
                  className="w-28 h-28 mx-auto"
                />
                <h3 className="font-black text-pokemon-teal text-sm mt-1 tracking-wide">
                  {p.name.toUpperCase()}
                </h3>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {p.types.map((t) => (
                    <span
                      key={t.type.name}
                      className="bg-gray-100 text-gray-500 text-xs px-2.5 py-0.5 rounded-full"
                    >
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
