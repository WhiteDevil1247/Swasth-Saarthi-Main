import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Heart,
  MessageSquare,
  Hospital,
  Video,
  Users,
  AlertCircle,
  Settings,
  Menu,
  X,
  LogOut,
  Accessibility,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FloatingChatButton from "./FloatingChatButton";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Heart, label: "HealthVault", path: "/health-vault" },
  { icon: MessageSquare, label: "AI Companion", path: "/ai-companion" },
  { icon: Hospital, label: "Hospital Navigator", path: "/hospital-navigator" },
  { icon: Video, label: "Teleconsultation", path: "/teleconsultation" },
  { icon: Users, label: "NGO Hub", path: "/ngo-hub" },
  { icon: Accessibility, label: "Accessibility Hub", path: "/accessibility" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_profile_complete");
    
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    
    // Navigate to home, which will show Auth via ProtectedRoute
    navigate("/");
    
    // Force page reload to trigger auth check
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>


      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen transition-transform duration-300",
          "w-64 bg-sidebar border-r border-sidebar-border shadow-elevated",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8 px-2 pt-4">
            <div className="relative">
              <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-shift px-4 py-3 rounded-xl bg-gradient-primary/10 shadow-lg backdrop-blur-sm border border-primary/20">
                Swasth Saathi
              </h1>
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-xl rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    "text-sm font-medium",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Emergency and Logout buttons */}
          <div className="space-y-2">
            <Link to="/emergency" onClick={() => setSidebarOpen(false)}>
              <Button
                variant="destructive"
                className="w-full bg-emergency hover:bg-emergency/90 shadow-emergency"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                Emergency Mode
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 lg:p-8 max-w-7xl">{children}</div>
      </main>

      {/* Floating Chat Button - only show on non-chat pages */}
      {location.pathname !== "/ai-companion" && <FloatingChatButton />}
    </div>
  );
}
