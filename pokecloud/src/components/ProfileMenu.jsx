// components/ProfileMenu.jsx
import { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        closeMenu();
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
  const avatar = user?.photoURL || "/default-avatar.png"; // make sure you have this fallback image

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <img
        src={avatar}
        alt="Profile"
        onClick={toggleMenu}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          objectFit: "cover",
          border: "2px solid #ddd",
        }}
      />
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50px",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "220px",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <p style={{ margin: "0 0 1rem", fontWeight: "bold" }}>{displayName}</p>
          <button onClick={() => navigate("/settings")} style={menuItemStyle}>⚙️ Account Settings</button>
          <button onClick={() => navigate("/saved-teams")} style={menuItemStyle}>🗂️ Saved Teams</button>
          <button onClick={handleLogout} style={{ ...menuItemStyle, color: "#e63946" }}>🚪 Log Out</button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "0.5rem 0",
  background: "none",
  border: "none",
  fontSize: "1rem",
  cursor: "pointer",
};
