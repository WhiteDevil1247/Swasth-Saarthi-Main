import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import HospitalNavigator from "./pages/HospitalNavigator";
import NGOHub from "./pages/NGOHub";
import EmergencyQR from "./pages/EmergencyQR";
import AIHealthTimeline from "./pages/AIHealthTimeline";
import VernacularAssistant from "./pages/VernacularAssistant";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <nav className="sticky top-0 z-50 backdrop-blur bg-background/70 border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-4 items-center">
            <Link className="font-bold tracking-wide neon-text" to="/">SwasthSaathi</Link>
            <div className="flex gap-3 text-sm">
              <Link to="/hospitals">Hospitals</Link>
              <Link to="/ngos">NGOs</Link>
              <Link to="/emergency-qr">Emergency QR</Link>
              <Link to="/ai-health-timeline">AI Timeline</Link>
              <Link to="/assistant">Assistant</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4 fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hospitals" element={<HospitalNavigator />} />
            <Route path="/ngos" element={<NGOHub />} />
            <Route path="/emergency-qr" element={<EmergencyQR />} />
            <Route path="/ai-health-timeline" element={<AIHealthTimeline />} />
            <Route path="/assistant" element={<VernacularAssistant />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
