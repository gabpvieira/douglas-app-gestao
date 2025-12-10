import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/legacyCompat.css";
import { initializePolyfills } from "./lib/polyfills";

// Inicializa polyfills e compatibilidade para browsers legados (Chrome 109)
initializePolyfills();

createRoot(document.getElementById("root")!).render(<App />);
