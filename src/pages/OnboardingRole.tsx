import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Globe } from "lucide-react";

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "India", "France", "Netherlands", "Singapore", "UAE",
  "Brazil", "Japan", "South Korea", "Sweden", "Ireland",
];

const OnboardingRole = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [role, setRole] = useState(data.currentRole);
  const [country, setCountry] = useState(data.preferredCountry);
  const [customCountry, setCustomCountry] = useState("");
  const [step, setStep] = useState<"role" | "country">("role");

  const handleNext = () => {
    if (step === "role") {
      setStep("country");
      return;
    }
    update({
      currentRole: role,
      preferredCountry: country || customCountry,
    });
    navigate("/onboarding/resume");
  };

  const handleBack = () => {
    if (step === "country") {
      setStep("role");
      return;
    }
    navigate("/");
  };

  if (step === "role") {
    return (
      <OnboardingShell step={1} totalSteps={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-lg mx-auto"
        >
          <h2 className="text-heading text-2xl md:text-3xl mb-3">
            👋 To start, share a current or previous role:
          </h2>

          <input
            type="text"
            placeholder="e.g. Software Engineer, Teacher, Student..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-none bg-accent/60 text-foreground text-lg placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6 mt-4"
            autoFocus
          />

          <Button
            variant="hero"
            size="lg"
            className="px-12 text-base"
            disabled={!role.trim()}
            onClick={handleNext}
          >
            Next
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            💡 Have a specific job title? Enter it here for better matches.
          </p>
        </motion.div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step={1} totalSteps={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <h2 className="text-heading text-2xl md:text-3xl mb-2 flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          Where are you looking for jobs?
        </h2>
        <p className="text-muted-foreground mb-6">
          We'll only show jobs from your selected country.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {countries.map((c, i) => (
            <motion.button
              key={c}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => { setCountry(country === c ? "" : c); setCustomCountry(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                country === c
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Or type your country..."
          value={customCountry}
          onChange={(e) => { setCustomCountry(e.target.value); setCountry(""); }}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-6"
        />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            disabled={!country && !customCountry}
            onClick={handleNext}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </OnboardingShell>
  );
};

export default OnboardingRole;
