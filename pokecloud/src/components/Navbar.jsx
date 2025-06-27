// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase"; // your firebase config file
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setShowAuth(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav
      style={{
        backgroundColor: "#e63946",
        padding: "1rem",
        display: "flex",
        gap: "2rem",
        justifyContent: "center",
        position: "relative",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Link to="/" style={{ color: "white", fontWeight: "bold" }}>
        🏠 Home
      </Link>
      <Link to="/team-builder" style={{ color: "white", fontWeight: "bold" }}>
        🛠️ Team Builder
      </Link>
      <Link to="/search" style={{ color: "white", fontWeight: "bold" }}>
        🔍 Search
      </Link>

      <div style={{ marginLeft: "auto", color: "white" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "white",
                color: "#e63946",
                border: "none",
                borderRadius: "4px",
                padding: "0.3rem 0.6rem",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(!showAuth)}
            style={{
              backgroundColor: "white",
              color: "#e63946",
              border: "none",
              borderRadius: "4px",
              padding: "0.3rem 0.6rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Login / Sign Up
          </button>
        )}
      </div>

      {showAuth && !user && (
        <form
          onSubmit={handleSubmit}
          style={{
            position: "absolute",
            top: "60px",
            right: "1rem",
            backgroundColor: "white",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 100,
            minWidth: "250px",
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "0.5rem",
              padding: "0.4rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "0.5rem",
              padding: "0.4rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#e63946",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "center" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                color: "#e63946",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                fontWeight: "bold",
              }}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
          {error && (
            <p style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "center" }}>
              {error}
            </p>
          )}
        </form>
      )}
    </nav>
  );
}
