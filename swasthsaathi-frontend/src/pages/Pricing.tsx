import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Users, Sparkles } from "lucide-react";

const pricingPlans = [
  {
    id: "free",
    title: "Start Free",
    subtitle: "Access all features for 1 month — no card required.",
    price: "₹0",
    period: "/month for 1 month",
    note: "Upgrade anytime.",
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    icon: Sparkles,
    features: [
      "Full access to all features",
      "Health tracking & analytics",
      "AI health assistant",
      "Medical records storage",
      "Basic reports",
    ],
    highlighted: false,
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "premium",
    title: "Go Premium",
    subtitle: "Unlock full analytics, smart reports, and 24x7 AI health assistant.",
    price: "₹499",
    period: "/month",
    badge: "Recommended",
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    icon: Zap,
    features: [
      "Everything in Free Trial",
      "Advanced analytics & insights",
      "Smart health reports",
      "24x7 AI health assistant",
      "Priority customer support",
      "Unlimited storage",
      "Export & sharing options",
    ],
    highlighted: true,
    color: "from-blue-600 to-purple-600",
  },
  {
    id: "enterprise",
    title: "For Clinics & Teams",
    subtitle: "Custom dashboard, patient sync, and data insights for teams.",
    price: "Contact Us",
    period: "",
    buttonText: "Book a Demo",
    buttonVariant: "outline" as const,
    icon: Users,
    features: [
      "Everything in Premium",
      "Custom dashboard & branding",
      "Multi-user access",
      "Patient data sync",
      "Team collaboration tools",
      "Dedicated account manager",
      "API access & integrations",
    ],
    highlighted: false,
    color: "from-indigo-500 to-blue-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-teal-500 to-purple-600 bg-clip-text text-transparent">
            Select Your SwasthSaathi Plan
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start your health journey with SwasthSaathi. Get <span className="font-semibold text-teal-600">1 month of free access</span> to all features, then upgrade to premium for continued care and advanced insights.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={plan.highlighted ? "lg:scale-105" : ""}
              >
                <Card
                  className={`relative h-full p-8 transition-all duration-300 ${
                    plan.highlighted
                      ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                      : "border shadow-lg hover:shadow-xl"
                  } bg-card backdrop-blur-sm`}
                >
                  {/* Recommended Badge */}
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 shadow-lg">
                      {plan.badge}
                    </Badge>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} p-3 mb-6 shadow-lg`}>
                    <Icon className="w-full h-full text-white" />
                  </div>

                  {/* Plan Title */}
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">
                    {plan.subtitle}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${plan.id === 'enterprise' ? 'text-2xl' : ''}`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground text-sm">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.note && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {plan.note}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.buttonVariant}
                    size="lg"
                    className={`w-full mb-8 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                        : plan.id === "free"
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        : ""
                    } transition-all duration-300 hover:scale-105`}
                  >
                    {plan.buttonText}
                  </Button>

                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Trusted by Healthcare Professionals</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of users who trust SwasthSaathi for their health management needs. 
              All plans include enterprise-grade security, HIPAA compliance, and 24/7 data protection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Target Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,200+</div>
                <div className="text-sm text-muted-foreground">Expected Partner Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">100K+</div>
                <div className="text-sm text-muted-foreground">Projected Consultations</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
