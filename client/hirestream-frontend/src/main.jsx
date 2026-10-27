import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#131929",
              color: "#f1f5f9",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "10px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#131929" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#131929" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
