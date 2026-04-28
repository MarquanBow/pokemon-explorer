import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PokedexExplorer() {
  const [generations, setGenerations] = useState([]);
  const [types, setTypes] = useState([]);
  const [abilities, setAbilities] = useState([]);

  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAbility, setSelectedAbility] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [allPokemonInGen, setAllPokemonInGen] = useState([]);
  const [typeFilteredNames, setTypeFilteredNames] = useState(null);
  const [abilityFilteredNames, setAbilityFilteredNames] = useState(null);

  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [abilityLoading, setAbilityLoading] = useState(false);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/generation")
      .then((r) => r.json()).then((d) => setGenerations(d.results));
    fetch("https://pokeapi.co/api/v2/type")
      .then((r) => r.json()).then((d) => setTypes(d.results));
    fetch("https://pokeapi.co/api/v2/ability?limit=150")
      .then((r) => r.json()).then((d) => setAbilities(d.results));
  }, []);

  useEffect(() => {
    if (!selectedGeneration) { setAllPokemonInGen([]); return; }
    setGenLoading(true);
    fetch(selectedGeneration)
      .then((r) => r.json())
      .then((d) => setAllPokemonInGen(d.pokemon_species.sort((a, b) => a.name.localeCompare(b.name))))
      .finally(() => setGenLoading(false));
  }, [selectedGeneration]);

  useEffect(() => {
    if (!selectedType) { setTypeFilteredNames(null); return; }
    setTypeLoading(true);
    fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
      .then((r) => r.json())
      .then((d) => setTypeFilteredNames(d.pokemon.map((p) => p.pokemon.name)))
      .finally(() => setTypeLoading(false));
  }, [selectedType]);

  useEffect(() => {
    if (!selectedAbility) { setAbilityFilteredNames(null); return; }
    setAbilityLoading(true);
    fetch(`https://pokeapi.co/api/v2/ability/${selectedAbility}`)
      .then((r) => r.json())
      .then((d) => setAbilityFilteredNames(d.pokemon.map((p) => p.pokemon.name)))
      .finally(() => setAbilityLoading(false));
  }, [selectedAbility]);

  useEffect(() => {
    const anyFilterActive = selectedGeneration || selectedType || selectedAbility;
    if (!anyFilterActive) { setFilteredPokemon([]); return; }

    // Wait for any in-flight filter requests before computing
    if (selectedGeneration && genLoading) return;
    if (selectedType && typeLoading) return;
    if (selectedAbility && abilityLoading) return;

    // Build candidate list as the intersection of all active filters
    let candidates = null;

    if (selectedGeneration && allPokemonInGen.length > 0) {
      candidates = allPokemonInGen.map((p) => p.name);
    }
    if (typeFilteredNames !== null) {
      candidates = candidates
        ? candidates.filter((n) => typeFilteredNames.includes(n))
        : [...typeFilteredNames];
    }
    if (abilityFilteredNames !== null) {
      candidates = candidates
        ? candidates.filter((n) => abilityFilteredNames.includes(n))
        : [...abilityFilteredNames];
    }
    if (searchTerm) {
      candidates = (candidates ?? []).filter((n) =>
        n.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPokemon((candidates ?? []).map((name) => ({ name })));
  }, [
    searchTerm, allPokemonInGen, typeFilteredNames, abilityFilteredNames,
    selectedGeneration, selectedType, selectedAbility,
    genLoading, typeLoading, abilityLoading,
  ]);

  const anyFilterActive = !!(selectedGeneration || selectedType || selectedAbility);
  const isLoading =
    (selectedGeneration && genLoading) ||
    (selectedType && typeLoading) ||
    (selectedAbility && abilityLoading);

  const selectClass =
    "px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red shadow-sm hover:border-red-200 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-red-50 text-pokemon-red text-sm font-bold px-4 py-1.5 rounded-full mb-4 border border-red-100">
            🔍 Pokédex
          </span>
          <h1 className="text-5xl font-black bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 bg-clip-text text-transparent mb-2">
            Explore All Pokémon
          </h1>
          <p className="text-gray-400 font-semibold">Filter by generation, type, and ability</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red shadow-sm w-52"
            />
            <select value={selectedGeneration} onChange={(e) => setSelectedGeneration(e.target.value)} className={selectClass}>
              <option value="">All Generations</option>
              {generations.map((gen) => (
                <option key={gen.name} value={gen.url}>
                  {gen.name.replace("generation-", "Gen ").toUpperCase()}
                </option>
              ))}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={selectClass}>
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </option>
              ))}
            </select>
            <select value={selectedAbility} onChange={(e) => setSelectedAbility(e.target.value)} className={selectClass}>
              <option value="">All Abilities</option>
              {abilities.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name.charAt(0).toUpperCase() + a.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && filteredPokemon.length > 0 && (
          <p className="text-center text-sm text-gray-400 font-semibold mb-5">
            Showing <span className="text-pokemon-red font-black">{filteredPokemon.length}</span> Pokémon
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {!anyFilterActive ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-3">🌎</div>
              <p className="text-gray-400 font-semibold">Pick a generation, type, or ability to start exploring!</p>
            </div>
          ) : isLoading ? (
            <div className="col-span-full text-center py-16">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                alt="Loading"
                className="w-12 mx-auto mb-3 animate-spin"
              />
              <p className="text-gray-400 font-semibold">Loading Pokémon...</p>
            </div>
          ) : filteredPokemon.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-3">😕</div>
              <p className="text-gray-400 font-semibold">No Pokémon match your filters.</p>
            </div>
          ) : (
            filteredPokemon.map((p) => (
              <Link
                key={p.name}
                to={`/pokemon/${p.name}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center hover:shadow-lg hover:-translate-y-1.5 hover:border-red-100 transition-all duration-200 group"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-red-50 transition-colors">
                  <img
                    src={`https://img.pokemondb.net/sprites/home/normal/${p.name}.png`}
                    alt={p.name}
                    className="w-16 h-16 group-hover:scale-110 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                <span className="text-gray-700 font-black text-xs text-center tracking-wide">
                  {p.name.toUpperCase()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
