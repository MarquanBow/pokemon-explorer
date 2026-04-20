import { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const displayName = user?.displayName || "Trainer";
  const avatar = user?.photoURL || "/default-avatar.png";

  return (
    <div ref={ref} className="relative">
      <img
        src={avatar}
        alt="Profile"
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full cursor-pointer object-cover border-2 border-white/50 hover:border-white transition-colors"
      />
      {open && (
        <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl w-56 z-50 p-4 border border-gray-100">
          <p className="font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">
            👋 {displayName}
          </p>
          <button
            onClick={() => navigate("/settings")}
            className="block w-full text-left py-2 px-2 text-gray-700 hover:text-pokemon-red hover:bg-red-50 rounded-lg transition-colors text-sm cursor-pointer"
          >
            ⚙️ Account Settings
          </button>
          <button
            onClick={() => navigate("/saved-teams")}
            className="block w-full text-left py-2 px-2 text-gray-700 hover:text-pokemon-red hover:bg-red-50 rounded-lg transition-colors text-sm cursor-pointer"
          >
            🗂️ Saved Teams
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 px-2 text-pokemon-red hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold cursor-pointer mt-1"
          >
            🚪 Log Out
          </button>
        </div>
      )}
    </div>
  );
}
