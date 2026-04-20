import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

const AVATAR_OPTIONS = [
  { name: "Pikachu",    url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
  { name: "Charizard",  url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" },
  { name: "Bulbasaur",  url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
  { name: "Squirtle",   url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" },
  { name: "Mewtwo",     url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png" },
  { name: "Eevee",      url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png" },
  { name: "Gengar",     url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png" },
  { name: "Snorlax",    url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png" },
  { name: "Lucario",    url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png" },
  { name: "Gardevoir",  url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png" },
  { name: "Greninja",   url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/658.png" },
  { name: "Sylveon",    url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/700.png" },
];

function Message({ msg }) {
  if (!msg.text) return null;
  return (
    <p
      className={`text-sm font-semibold px-4 py-2.5 rounded-xl mt-3 ${
        msg.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      {msg.type === "success" ? "✅ " : "⚠️ "}
      {msg.text}
    </p>
  );
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { navigate("/"); return; }
      setUser(currentUser);
      setDisplayName(currentUser.displayName || "");
      setSelectedAvatar(currentUser.photoURL || "");
    });
    return unsubscribe;
  }, [navigate]);

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg({ text: "", type: "" });
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim() || null,
        photoURL: selectedAvatar || null,
      });
      setUser({ ...auth.currentUser });
      setProfileMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setProfileMsg({ text: err.message, type: "error" });
    }
    setProfileLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords don't match.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg({ text: "", type: "" });
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordMsg({ text: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg =
        err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
          ? "Current password is incorrect."
          : err.message;
      setPasswordMsg({ text: msg, type: "error" });
    }
    setPasswordLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pokemon-red transition-colors";

  if (!user) return null;

  const currentAvatarPreview =
    selectedAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=e63946&color=fff&size=80`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-red-50 text-pokemon-red text-sm font-bold px-4 py-1.5 rounded-full mb-4 border border-red-100">
            ⚙️ Settings
          </span>
          <h1 className="text-5xl font-black bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 bg-clip-text text-transparent mb-2">
            Account Settings
          </h1>
          <p className="text-gray-400 font-semibold">Customize your trainer profile</p>
        </div>

        {/* Current profile preview */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={currentAvatarPreview}
              alt="Your avatar"
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="font-black text-gray-800 text-xl">
              {user.displayName || "Trainer"}
            </p>
            <p className="text-gray-400 text-sm font-semibold">{user.email}</p>
          </div>
        </div>

        {/* ── Profile Section ── */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-6">
          <h2 className="font-black text-gray-800 text-lg mb-1">🧑 Profile</h2>
          <p className="text-gray-400 text-sm font-semibold mb-6">Update your username and profile icon</p>

          {/* Username */}
          <label className="block text-xs text-gray-400 uppercase font-black tracking-widest mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your trainer name..."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass + " mb-6"}
          />

          {/* Avatar picker */}
          <label className="block text-xs text-gray-400 uppercase font-black tracking-widest mb-3">
            Choose Your Trainer Icon
          </label>
          <div className="grid grid-cols-6 gap-3 mb-6">
            {AVATAR_OPTIONS.map((opt) => {
              const isSelected = selectedAvatar === opt.url;
              return (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setSelectedAvatar(opt.url)}
                  title={opt.name}
                  className={`relative p-1.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:scale-110 ${
                    isSelected
                      ? "border-pokemon-red bg-red-50 shadow-md shadow-red-200"
                      : "border-gray-100 bg-gray-50 hover:border-red-200"
                  }`}
                >
                  <img src={opt.url} alt={opt.name} className="w-full aspect-square" />
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pokemon-red rounded-full flex items-center justify-center">
                      <span className="text-white text-xs leading-none">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 font-semibold mb-5">
            Selected: <span className="text-gray-600 font-black">
              {AVATAR_OPTIONS.find((o) => o.url === selectedAvatar)?.name ?? "None"}
            </span>
          </p>

          <button
            onClick={handleSaveProfile}
            disabled={profileLoading}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black rounded-xl shadow-md shadow-red-400/30 hover:shadow-red-400/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {profileLoading ? "Saving..." : "💾 Save Profile"}
          </button>
          <Message msg={profileMsg} />
        </div>

        {/* ── Security Section ── */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
          <h2 className="font-black text-gray-800 text-lg mb-1">🔒 Security</h2>
          <p className="text-gray-400 text-sm font-semibold mb-6">Change your account password</p>

          <label className="block text-xs text-gray-400 uppercase font-black tracking-widest mb-2">
            Current Password
          </label>
          <div className="relative mb-4">
            <input
              type={showCurrentPw ? "text" : "password"}
              placeholder="Enter current password..."
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-sm font-bold"
            >
              {showCurrentPw ? "Hide" : "Show"}
            </button>
          </div>

          <label className="block text-xs text-gray-400 uppercase font-black tracking-widest mb-2">
            New Password
          </label>
          <div className="relative mb-4">
            <input
              type={showNewPw ? "text" : "password"}
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowNewPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-sm font-bold"
            >
              {showNewPw ? "Hide" : "Show"}
            </button>
          </div>

          <label className="block text-xs text-gray-400 uppercase font-black tracking-widest mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Re-enter new password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass + " mb-5"}
          />

          {/* Password strength hint */}
          {newPassword.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor:
                        newPassword.length >= lvl * 3
                          ? lvl <= 1 ? "#f94144" : lvl <= 2 ? "#f9c74f" : lvl <= 3 ? "#0077b6" : "#43aa8b"
                          : "#e5e7eb",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {newPassword.length < 3 ? "Weak" : newPassword.length < 6 ? "Fair" : newPassword.length < 9 ? "Good" : "Strong"}
              </span>
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            className="px-6 py-3 bg-gradient-to-r from-pokemon-blue to-blue-500 text-white font-black rounded-xl shadow-md shadow-blue-400/30 hover:shadow-blue-400/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {passwordLoading ? "Updating..." : "🔑 Change Password"}
          </button>
          <Message msg={passwordMsg} />
        </div>
      </div>
    </div>
  );
}
