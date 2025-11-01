import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Update CSS variables for a subtle glow cursor effect
window.addEventListener("mousemove", (e) => {
  document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
  document.documentElement.style.setProperty("--my", `${e.clientY}px`);
});

createRoot(document.getElementById("root")!).render(<App />);
