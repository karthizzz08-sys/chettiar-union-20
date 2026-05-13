import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id 'root' not found in index.html");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </AuthProvider>
    </StrictMode>
  );
} catch (error) {
  console.error("Failed to render React app:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;">Failed to load application. Check console for errors.</div>`;
}
