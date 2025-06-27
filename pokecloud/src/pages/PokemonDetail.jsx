// src/pages/PokemonDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PokemonDetail() {
  const { name } = useParams();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((data) => setDetails(data));
  }, [name]);

  if (!details) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{details.name.toUpperCase()}</h2>
      <img
        src={details.sprites.front_default}
        alt={details.name}
        width="120"
      />
      <p>Height: {details.height}</p>
      <p>Weight: {details.weight}</p>
      <p>
        Types:{" "}
        {details.types.map((t) => t.type.name).join(", ")}
      </p>
      <p>
        Abilities:{" "}
        {details.abilities.map((a) => a.ability.name).join(", ")}
      </p>
    </div>
  );
}
