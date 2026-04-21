import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default function Navbar() {
  const { user, refreshUser } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (username.trim()) {
          await updateProfile(credential.user, { displayName: username.trim() });
          refreshUser();
        }
      }
      setShowAuth(false);
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (err) {
      setError(err.message);
    }
  };

  const switchMode = () => {
    setIsLogin((v) => !v);
    setError("");
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 ${
          active
            ? "bg-white/20 text-white shadow-inner"
            : "text-white/75 hover:text-white hover:bg-white/10"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-gradient-to-r from-red-800 via-pokemon-red to-rose-500 px-6 py-3 flex items-center shadow-lg shadow-red-900/30 relative">
      <Link to="/" className="flex items-center gap-2.5 mr-8">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg shadow-inner">
          ⚡
        </div>
        <span className="text-white font-black text-xl tracking-tight">PokéCloud</span>
      </Link>

      <div className="flex gap-1 flex-1">
        {navLink("/", "🏠 Home")}
        {navLink("/team-builder", "🛠️ Team Builder")}
        {navLink("/search", "🔍 Explore")}
      </div>

      <div className="ml-auto">
        {user ? (
          <ProfileMenu user={user} />
        ) : (
          <button
            onClick={() => setShowAuth(!showAuth)}
            className="bg-white text-pokemon-red font-black text-sm px-5 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      {showAuth && !user && (
        <div className="absolute top-full right-4 mt-2 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/20 p-6 w-72 border border-white/60"
          >
            <div className="text-center mb-5">
              <div className="text-3xl mb-1">⚡</div>
              <h3 className="font-black text-gray-800 text-lg">
                {isLogin ? "Welcome Back!" : "Join PokéCloud"}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                {isLogin ? "Sign in to your account" : "Create a free account"}
              </p>
            </div>

            {!isLogin && (
              <input
                type="text"
                placeholder="Trainer name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-pokemon-red text-sm bg-gray-50"
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-pokemon-red text-sm bg-gray-50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-pokemon-red text-sm bg-gray-50"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-rose-500 text-white font-black py-2.5 rounded-xl shadow-md shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              {isLogin ? "Login →" : "Sign Up →"}
            </button>
            <p className="text-xs text-center mt-4 text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-pokemon-red font-black hover:underline cursor-pointer"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
            {error && (
              <p className="text-red-500 text-xs text-center mt-2 bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}
          </form>
        </div>
      )}
    </nav>
  );
}
