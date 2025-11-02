import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Lock, User, Phone, Calendar } from "lucide-react";

const settingsSections = [
  {
    title: "Profile",
    icon: User,
    settings: [
      { label: "Edit Profile", action: true },
      { label: "Medical Information", action: true },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    settings: [
      { label: "Medication Reminders", toggle: true },
      { label: "Appointment Alerts", toggle: true },
      { label: "Health Tips", toggle: true },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Lock,
    settings: [
      { label: "Two-Factor Authentication", toggle: true },
      { label: "Biometric Login", toggle: true },
    ],
  },
];

export default function Settings() {
  const [profile, setProfile] = useState<{ name: string; age: number; phone: string } | null>(null);

  useEffect(() => {
    // Load profile from localStorage
    const storedProfile = localStorage.getItem("user_profile");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error("Failed to parse profile:", error);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* User Profile Card */}
      {profile && (
        <Card className="p-6 shadow-card bg-gradient-subtle">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">{profile.name}</h2>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{profile.age} years old</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              </div>
              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <Label htmlFor={setting.label} className="text-foreground cursor-pointer">
                      {setting.label}
                    </Label>
                    {setting.toggle ? (
                      <Switch id={setting.label} />
                    ) : (
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
