import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "./Auth";
import { api } from "@/lib/api";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        await api("/me", { method: "GET", auth: true });
        setAuthenticated(true);
      } catch {
        localStorage.removeItem("auth_token");
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Auth />;
  }

  return <>{children}</>;
}
