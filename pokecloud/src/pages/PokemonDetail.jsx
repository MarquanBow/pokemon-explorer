import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 px-6 py-12">
      <div className="max-w-md mx-auto">
        <Link
          to="/search"
          className="text-pokemon-blue text-sm font-semibold hover:underline mb-6 inline-block"
        >
          ← Back to Search
        </Link>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <img
            src={details.sprites.front_default}
            alt={details.name}
            className="w-40 h-40 mx-auto"
          />
          <h2 className="text-3xl font-black text-pokemon-dark mt-2 mb-6">
            {details.name.toUpperCase()}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Height</p>
              <p className="text-gray-800 font-bold text-lg">{details.height / 10} m</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Weight</p>
              <p className="text-gray-800 font-bold text-lg">{details.weight / 10} kg</p>
            </div>
          </div>

          <div className="mb-4 text-left">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Types</p>
            <div className="flex gap-2 flex-wrap">
              {details.types.map((t) => (
                <span
                  key={t.type.name}
                  className="bg-pokemon-red text-white text-sm px-3 py-1 rounded-full font-semibold"
                >
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="text-left">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Abilities</p>
            <div className="flex gap-2 flex-wrap">
              {details.abilities.map((a) => (
                <span
                  key={a.ability.name}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  {a.ability.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
