import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const TYPE_COLORS = {
  fire: "#f94144", water: "#277da1", grass: "#43aa8b", electric: "#f9c74f",
  poison: "#9d4edd", flying: "#90be6d", psychic: "#f72585", bug: "#70c000",
  rock: "#9c6644", ghost: "#7b2d8b", ice: "#48cae4", dragon: "#3a0ca3",
  dark: "#4a4e69", steel: "#8d99ae", fairy: "#f4a2c0", fighting: "#e76f51",
  ground: "#d4a373", normal: "#adb5bd",
};

export default function PokemonDetail() {
  const { name } = useParams();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((data) => setDetails(data));
  }, [name]);

  if (!details)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="Loading"
            className="w-12 mx-auto mb-3 animate-spin"
          />
          <p className="text-gray-400 font-semibold">Loading...</p>
        </div>
      </div>
    );

  const primaryType = details.types[0]?.type.name;
  const primaryColor = TYPE_COLORS[primaryType] ?? "#adb5bd";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 px-6 py-12">
      <div className="max-w-md mx-auto">
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-pokemon-blue text-sm font-bold hover:underline mb-6"
        >
          ← Back to Search
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Colored header */}
          <div
            className="h-40 flex items-center justify-center relative"
            style={{ backgroundColor: primaryColor + "25" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: primaryColor }} />
            <img
              src={details.sprites.front_default}
              alt={details.name}
              className="w-36 h-36 drop-shadow-lg"
            />
          </div>

          <div className="p-6">
            <h2 className="text-3xl font-black text-gray-800 mb-1 text-center">
              {details.name.toUpperCase()}
            </h2>
            <div className="flex justify-center gap-2 mb-6">
              {details.types.map((t) => (
                <span
                  key={t.type.name}
                  className="text-white text-xs font-black px-4 py-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: TYPE_COLORS[t.type.name] ?? "#adb5bd" }}
                >
                  {t.type.name.toUpperCase()}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Height</p>
                <p className="text-gray-800 font-black text-xl">{details.height / 10}
                  <span className="text-sm font-semibold text-gray-400 ml-1">m</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Weight</p>
                <p className="text-gray-800 font-black text-xl">{details.weight / 10}
                  <span className="text-sm font-semibold text-gray-400 ml-1">kg</span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Abilities</p>
              <div className="flex flex-wrap gap-2">
                {details.abilities.map((a) => (
                  <span
                    key={a.ability.name}
                    className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-xl font-semibold"
                  >
                    {a.ability.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
