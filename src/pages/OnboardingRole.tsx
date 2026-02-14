import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import AnimatedText from "@/components/AnimatedText";
import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";

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
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className="text-5xl mb-6"
          >
            👋
          </motion.div>

          <h2 className="text-heading text-2xl md:text-3xl lg:text-4xl mb-8 leading-snug">
            <AnimatedText text="To start, share a current or previous role:" delay={0.3} />
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="w-full max-w-md"
          >
            <input
              type="text"
              placeholder="e.g. Software Engineer, Teacher, Student..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-none bg-primary/5 text-foreground text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 focus:bg-primary/10"
              autoFocus
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-8"
          >
            <Button
              variant="hero"
              size="lg"
              className="px-16 py-6 text-base rounded-2xl"
              disabled={!role.trim()}
              onClick={handleNext}
            >
              Next
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-sm text-muted-foreground mt-6"
          >
            💡 Have a specific job title? Enter it for better matches.
          </motion.p>
        </div>
      </OnboardingShell>
    );
  }

  // Country step
  return (
    <OnboardingShell step={1} totalSteps={3}>
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
        >
          <Globe className="w-12 h-12 text-primary mb-4" />
        </motion.div>

        <h2 className="text-heading text-2xl md:text-3xl lg:text-4xl mb-2 leading-snug">
          <AnimatedText text="Where are you looking for jobs?" delay={0.2} />
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground mb-8"
        >
          We'll only show jobs from your selected country.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-wrap gap-2 justify-center mb-6 max-w-md"
        >
          {countries.map((c, i) => (
            <motion.button
              key={c}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.03, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCountry(country === c ? "" : c); setCustomCountry(""); }}
              className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                country === c
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Or type your country..."
            value={customCountry}
            onChange={(e) => { setCustomCountry(e.target.value); setCountry(""); }}
            className="w-full px-5 py-4 rounded-2xl border-none bg-primary/5 text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 focus:bg-primary/10"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="flex gap-3 mt-8 w-full max-w-sm"
        >
          <Button variant="outline" className="flex-1 rounded-2xl py-6" onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1 rounded-2xl py-6"
            disabled={!country && !customCountry}
            onClick={handleNext}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingRole;
