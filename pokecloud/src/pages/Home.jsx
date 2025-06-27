// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [randomFact, setRandomFact] = useState("");
  const [randomPokemon, setRandomPokemon] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    // Fetch random fact
    const factRes = await fetch("/pokemon-facts.json");
    const facts = await factRes.json();
    const fact = facts[Math.floor(Math.random() * facts.length)];
    setRandomFact(fact);

    // Fetch 3 random Pokémon
    const indices = Array.from({ length: 3 }, () => Math.floor(Math.random() * 898) + 1);
    const promises = indices.map((id) =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json())
    );
    const data = await Promise.all(promises);
    setRandomPokemon(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <div style={{
      padding: "2rem",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8f9fa, #e0f7fa)",
      fontFamily: "Segoe UI, sans-serif"
    }}>
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", color: "#d62828", fontSize: "3rem" }}
      >
        Welcome to PokéCloud! 🌥️
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: "center", marginTop: "1rem" }}
      >
        <h2 style={{ fontStyle: "italic", color: "#2b2d42" }}>🧠 Did You Know?</h2>
        <p style={{ fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto" }}>{randomFact}</p>
        <button
          onClick={fetchContent}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            border: "none",
            backgroundColor: "#0077b6",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          🔄 Refresh
        </button>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ marginTop: "3rem", textAlign: "center", color: "#1d3557" }}
      >
        🎲 Random Pokémon of the Day
      </motion.h2>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <motion.img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="Loading Pokéball"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            style={{ width: "80px" }}
          />
          <p>Fetching Pokémon...</p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "2rem"
          }}
        >
          {randomPokemon.map((p, index) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.2 }}
              style={{
                border: "2px solid #adb5bd",
                borderRadius: "12px",
                padding: "1rem",
                width: "180px",
                backgroundColor: "#fff",
                textAlign: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}
            >
              <img src={p.sprites.front_default} alt={p.name} style={{ width: "100px" }} />
              <h3 style={{ margin: "0.5rem 0", color: "#2a9d8f" }}>{p.name.toUpperCase()}</h3>
              <div>
                {p.types.map((t) => (
                  <span
                    key={t.type.name}
                    style={{
                      backgroundColor: "#edf2f4",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "999px",
                      fontSize: "0.8rem",
                      marginRight: "0.3rem",
                      color: "#495057"
                    }}
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
  );
}
