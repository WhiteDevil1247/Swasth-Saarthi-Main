import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Phone, Calendar, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [profile, setProfile] = useState<{ name: string; age: number; phone: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedAge, setEditedAge] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load profile from localStorage
    const storedProfile = localStorage.getItem("user_profile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
        setEditedName(parsed.name);
        setEditedAge(parsed.age.toString());
      } catch (error) {
        console.error("Failed to parse profile:", error);
      }
    }
  }, []);

  const handleSave = () => {
    if (!editedName || !editedAge || !profile) return;

    const updatedProfile = {
      ...profile,
      name: editedName,
      age: parseInt(editedAge),
    };

    localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setIsEditing(false);

    toast({
      title: "Profile Updated! ✅",
      description: "Your changes have been saved successfully.",
      className: "bg-green-600 text-white border-green-700"
    });
  };

  const handleCancel = () => {
    if (profile) {
      setEditedName(profile.name);
      setEditedAge(profile.age.toString());
    }
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Your personal information</p>
        </div>
        <Card className="p-10 text-center">
          <UserCircle className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No profile data found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-shift mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <Card className="p-8 shadow-elevated animate-zoom-in">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative animate-logo-pulse">
              {/* Demo Profile Image - Medical Theme */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-glow">
                <UserCircle className="w-24 h-24 text-white" />
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-card animate-glow-pulse"></div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">Patient</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-6">
            {!isEditing ? (
              <>
                {/* View Mode */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <UserCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="text-lg font-semibold text-foreground">{profile.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="text-lg font-semibold text-foreground">{profile.age} years old</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="text-lg font-semibold text-foreground">{profile.phone}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="mt-2"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-age">Age</Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editedAge}
                      onChange={(e) => setEditedAge(e.target.value)}
                      className="mt-2"
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={profile.phone}
                      disabled
                      className="mt-2 bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Phone number cannot be changed
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave} size="lg" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="lg" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Additional Info Card */}
      <Card className="p-6 bg-gradient-subtle">
        <h3 className="text-lg font-semibold text-foreground mb-4">About This Profile</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Your profile information is stored locally and securely</p>
          <p>• This data helps personalize your healthcare experience</p>
          <p>• You can update your name and age at any time</p>
          <p>• Your phone number is linked to your account and cannot be changed</p>
        </div>
      </Card>
    </div>
  );
}
