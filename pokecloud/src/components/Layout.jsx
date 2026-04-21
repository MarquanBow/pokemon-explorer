import { Toaster } from "sonner";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "Nunito, sans-serif",
            fontWeight: 700,
            borderRadius: "16px",
          },
          classNames: {
            toast: "shadow-xl",
          },
        }}
      />
    </div>
  );
}
