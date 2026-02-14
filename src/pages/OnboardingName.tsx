import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import SplitText from "@/components/SplitText";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AVAILABLE_COLORS, useColorTheme } from "@/hooks/useColorTheme";

const COLOR_DISPLAY: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-emerald-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

const OnboardingName = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [name, setName] = useState(data.candidateName);
  const [color, setColor] = useState(data.favoriteColor || "green");

  // Apply theme live as user picks color
  useColorTheme(color);

  const handleNext = () => {
    update({ candidateName: name.trim(), favoriteColor: color });
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

        {/* Favorite color picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
          className="w-full max-w-md mt-8"
        >
          <p className="text-sm text-muted-foreground mb-3">Pick your favorite color</p>
          <div className="flex flex-wrap justify-center gap-3">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full transition-all duration-200 ${COLOR_DISPLAY[c]} ${
                  color === c
                    ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                    : "hover:scale-105 opacity-70 hover:opacity-100"
                }`}
                aria-label={c}
                title={c.charAt(0).toUpperCase() + c.slice(1)}
              />
            ))}
          </div>
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
