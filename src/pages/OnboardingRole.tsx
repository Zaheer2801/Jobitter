import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const roles = [
  "Retail Clerk", "Data Analyst", "Software Engineer", "Marketing Manager",
  "Product Manager", "UX Designer", "Student", "Teacher", "Healthcare Professional",
];

const OnboardingRole = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [selected, setSelected] = useState(data.currentRole);
  const [custom, setCustom] = useState("");

  const handleNext = () => {
    update({ currentRole: selected || custom });
    navigate("/onboarding/resume");
  };

  return (
    <OnboardingShell step={1} totalSteps={3}>
      <h2 className="text-heading text-2xl mb-2">What's your current role?</h2>
      <p className="text-muted-foreground mb-6">
        This helps us tailor career paths for you.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {roles.map((role, i) => (
          <motion.button
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => { setSelected(selected === role ? "" : role); setCustom(""); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              selected === role
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent"
            }`}
          >
            {role}
          </motion.button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Or type your role..."
        value={custom}
        onChange={(e) => { setCustom(e.target.value); setSelected(""); }}
        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-6"
      />

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          disabled={!selected && !custom}
          onClick={handleNext}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingRole;
