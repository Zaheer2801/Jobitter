import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import SplitText from "@/components/SplitText";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const OnboardingName = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [name, setName] = useState(data.candidateName);

  const handleNext = () => {
    update({ candidateName: name.trim() });
    navigate("/onboarding/role");
  };

  return (
    <OnboardingShell step={1} totalSteps={4}>
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.1 }}
          className="text-5xl md:text-6xl mb-8"
        >
          👋
        </motion.div>

        <SplitText
          text="Hi there! What's your name?"
          className="text-heading text-lg md:text-xl leading-relaxed mb-10 font-normal text-muted-foreground"
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
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            disabled={!name.trim()}
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

export default OnboardingName;
