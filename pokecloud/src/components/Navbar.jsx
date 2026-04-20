import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import ProfileMenu from "./ProfileMenu";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

  return (
    <nav className="bg-pokemon-red px-6 py-4 flex items-center relative shadow-md">
      <Link
        to="/"
        className="text-white font-black text-xl tracking-wide mr-10 hover:text-red-100 transition-colors"
      >
        PokéCloud ☁️
      </Link>

      <div className="flex gap-6 flex-1">
        <Link
          to="/"
          className="text-white/90 font-semibold hover:text-white transition-colors text-sm"
        >
          🏠 Home
        </Link>
        <Link
          to="/team-builder"
          className="text-white/90 font-semibold hover:text-white transition-colors text-sm"
        >
          🛠️ Team Builder
        </Link>
        <Link
          to="/search"
          className="text-white/90 font-semibold hover:text-white transition-colors text-sm"
        >
          🔍 Search
        </Link>
      </div>

      <div className="ml-auto">
        {user ? (
          <ProfileMenu user={user} />
        ) : (
          <button
            onClick={() => setShowAuth(!showAuth)}
            className="bg-white text-pokemon-red font-bold px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm cursor-pointer"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      {showAuth && !user && (
        <form
          onSubmit={handleSubmit}
          className="absolute top-16 right-4 bg-white rounded-2xl shadow-2xl p-6 z-50 w-72"
        >
          <h3 className="text-center font-bold text-gray-800 text-lg mb-4">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-pokemon-red text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-pokemon-red text-sm"
          />
          <button
            type="submit"
            className="w-full bg-pokemon-red text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
          <p className="text-xs text-center mt-3 text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-pokemon-red font-bold hover:underline cursor-pointer"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
          {error && (
            <p className="text-red-500 text-xs text-center mt-2">{error}</p>
          )}
        </form>
      )}
    </nav>
  );
}
