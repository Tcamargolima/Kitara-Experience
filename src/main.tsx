import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker ONLY in production.
// In dev/preview, a SW can cache older Vite prebundles (node_modules/.vite/deps)
// and cause duplicate React instances → "Invalid hook call" / useEffect null.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("🎪 SW registered:", registration);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
