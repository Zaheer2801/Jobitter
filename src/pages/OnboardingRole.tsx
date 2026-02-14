import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import SplitText from "@/components/SplitText";
import { motion, AnimatePresence } from "framer-motion";
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
    navigate("/onboarding/name");
  };

  return (
    <OnboardingShell step={2} totalSteps={4}>
      <AnimatePresence mode="wait">
        {step === "role" ? (
          <motion.div
            key="role"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center text-center"
          >
            <SplitText
              text={`Nice to meet you, ${data.candidateName || "there"}! Share a current or previous role:`}
              className="text-heading text-2xl md:text-3xl lg:text-4xl leading-snug mb-10"
              delay={0.3}
              splitType="words"
              staggerDelay={0.06}
              tag="h2"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md"
            >
              <input
                type="text"
                placeholder="e.g. Software Engineer, Teacher, Student..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl border-none bg-primary/5 text-foreground text-lg placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 focus:bg-primary/10 focus:shadow-lg focus:shadow-primary/5"
                autoFocus
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-10"
            >
              <Button
                variant="hero"
                size="lg"
                className="px-16 py-7 text-base rounded-2xl"
                disabled={!role.trim()}
                onClick={handleNext}
              >
                Next
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="text-sm text-muted-foreground mt-8"
            >
              💡 Have a specific job title? Enter it for better matches.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="country"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <Globe className="w-14 h-14 text-primary mb-6" />
            </motion.div>

            <SplitText
              text="Where are you looking for jobs?"
              className="text-heading text-2xl md:text-3xl lg:text-4xl leading-snug mb-3"
              delay={0.2}
              splitType="words"
              staggerDelay={0.06}
              tag="h2"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground mb-10"
            >
              We'll only show jobs from your selected country.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex flex-wrap gap-2.5 justify-center mb-8 max-w-lg"
            >
              {countries.map((c, i) => (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 1 + i * 0.04,
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { setCountry(country === c ? "" : c); setCustomCountry(""); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                    country === c
                      ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/25"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {c}
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="w-full max-w-md"
            >
              <input
                type="text"
                placeholder="Or type your country..."
                value={customCountry}
                onChange={(e) => { setCustomCountry(e.target.value); setCountry(""); }}
                className="w-full px-6 py-5 rounded-2xl border-none bg-primary/5 text-foreground text-base placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 focus:bg-primary/10"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.5 }}
              className="flex gap-3 mt-10 w-full max-w-sm"
            >
              <Button variant="outline" className="flex-1 rounded-2xl py-7 text-base" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1 rounded-2xl py-7 text-base"
                disabled={!country && !customCountry}
                onClick={handleNext}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingShell>
  );
};

export default OnboardingRole;
