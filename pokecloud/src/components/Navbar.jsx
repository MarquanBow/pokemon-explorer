// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      backgroundColor: "#e63946",
      padding: "1rem",
      display: "flex",
      gap: "2rem",
      justifyContent: "center"
    }}>
      <Link to="/" style={{ color: "white", fontWeight: "bold" }}>🏠 Home</Link>
      <Link to="/team-builder" style={{ color: "white", fontWeight: "bold" }}>🛠️ Team Builder</Link>
      <Link to="/search" style={{ color: "white", fontWeight: "bold" }}>🔍 Search</Link>
    </nav>
  );
}
