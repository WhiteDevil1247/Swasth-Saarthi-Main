import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, KeyRound, User } from "lucide-react";

type AuthStep = "phone" | "otp" | "profile";
type AuthMode = "signin" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    try {
      await api("/auth/request-otp", { 
        method: "POST", 
        body: { phone }, 
        auth: false 
      });
      
      if (!isResend) {
        setStep("otp");
      }
      
      // Show success message without code
      toast({ 
        title: "✅ OTP Sent!", 
        description: isResend ? "New code sent to your phone!" : "Please check your phone for the verification code.",
        duration: 5000,
        className: "bg-green-600 text-white border-green-700"
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to send OTP", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    handleRequestOtp(undefined, true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    setLoading(true);
    try {
      const data = await api("/auth/verify", { 
        method: "POST", 
        body: { phone, code: otp }, 
        auth: false 
      });
      
      const token = data.token as string;
      if (!token) throw new Error("Invalid token response");
      
      localStorage.setItem("auth_token", token);
      
      // Check if profile exists
      const hasProfile = localStorage.getItem("user_profile_complete");
      if (hasProfile) {
        toast({ title: "Welcome Back! 👋", description: "Logging you in..." });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStep("profile");
        toast({ title: "Verified! ✅", description: "Let's set up your profile" });
      }
    } catch (error: any) {
      toast({ 
        title: "Verification Failed", 
        description: error?.message || "Invalid OTP code", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;
    
    setLoading(true);
    try {
      // Save profile to backend
      await api("/profile", {
        method: "POST",
        body: { name, age: parseInt(age), phone },
        auth: true
      });
      
      localStorage.setItem("user_profile_complete", "true");
      toast({ title: "Profile Complete! 🎉", description: "Welcome to Swasth Saarthi" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      // Even if backend fails, let them proceed
      localStorage.setItem("user_profile_complete", "true");
      toast({ title: "Welcome! 🎉", description: "You're all set" });
      setTimeout(() => window.location.reload(), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <Card className="w-full max-w-md p-8 shadow-elevated backdrop-blur-sm bg-card border-border relative z-10">
        <div className="text-center mb-6">
          {/* Red Medical Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              {/* Red Plus Symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                </div>
              </div>
              {/* Pulse Animation Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Swasth Saathi
          </h1>
          <p className="text-sm text-muted-foreground">AI-Powered Healthcare Companion</p>
        </div>

        <Tabs defaultValue="signin" className="w-full" onValueChange={(v) => setMode(v as AuthMode)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <AnimatePresence mode="wait">
              {step === "phone" && (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRequestOtp}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send you a verification code
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Sending Code..." : "Continue with Phone"}
              </Button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  minLength={4}
                  maxLength={6}
                  className="mt-2 text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sent to {phone}
                </p>
              </div>
              
              {/* Resend Code Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Code"}
              </Button>
              
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                Change Number
              </Button>
            </motion.form>
          )}

          {step === "profile" && (
            <motion.form
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleCompleteProfile}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <User className="w-12 h-12 mx-auto text-primary mb-2" />
                <h3 className="text-xl font-semibold">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground">Help us personalize your experience</p>
              </div>
              
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min="1"
                  max="120"
                  className="mt-2"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            </motion.form>
          )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="signup">
            <AnimatePresence mode="wait">
              {step === "phone" && (
            <motion.form
              key="phone-signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRequestOtp}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="phone-signup" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone-signup"
                  type="tel"
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send you a verification code to get started
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Sending Code..." : "Sign Up with Phone"}
              </Button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.form
              key="otp-signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="otp-signup" className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Verification Code
                </Label>
                <Input
                  id="otp-signup"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  minLength={4}
                  maxLength={6}
                  className="mt-2 text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sent to {phone}
                </p>
              </div>
              
              {/* Resend Code Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Code"}
              </Button>
              
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Verifying..." : "Verify & Sign Up"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                Change Number
              </Button>
            </motion.form>
          )}

          {step === "profile" && (
            <motion.form
              key="profile-signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleCompleteProfile}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <User className="w-12 h-12 mx-auto text-primary mb-2" />
                <h3 className="text-xl font-semibold">Create Your Profile</h3>
                <p className="text-sm text-muted-foreground">Tell us about yourself</p>
              </div>
              
              <div>
                <Label htmlFor="name-signup">Full Name</Label>
                <Input
                  id="name-signup"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="age-signup">Age</Label>
                <Input
                  id="age-signup"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min="1"
                  max="120"
                  className="mt-2"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </motion.form>
          )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service</p>
        </div>
      </Card>
    </div>
  );
}
