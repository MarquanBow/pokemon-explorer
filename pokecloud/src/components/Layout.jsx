// src/components/Layout.jsx
import Navbar from "./navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: "1", padding: "2rem", background: "#f9f9f9" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
