// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#222",
      color: "#eee",
      padding: "1rem",
      textAlign: "center"
    }}>
      <p>PokéCloud © {new Date().getFullYear()} — Built with ❤️ by Marquan Bowman</p>
      <p style={{ fontSize: "0.9rem", color: "#bbb" }}>
        Data from <a href="https://pokeapi.co" target="_blank" rel="noreferrer" style={{ color: "#90e0ef" }}>PokéAPI</a>
      </p>
    </footer>
  );
}
