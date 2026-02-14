import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Globe } from "lucide-react";

const roles = [
  "Retail Clerk", "Data Analyst", "Software Engineer", "Marketing Manager",
  "Product Manager", "UX Designer", "Student", "Teacher", "Healthcare Professional",
];

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "India", "France", "Netherlands", "Singapore", "UAE",
  "Brazil", "Japan", "South Korea", "Sweden", "Ireland",
];

const OnboardingRole = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [selected, setSelected] = useState(data.currentRole);
  const [custom, setCustom] = useState("");
  const [country, setCountry] = useState(data.preferredCountry);
  const [customCountry, setCustomCountry] = useState("");

  const handleNext = () => {
    update({
      currentRole: selected || custom,
      preferredCountry: country || customCountry,
    });
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

      <h2 className="text-heading text-2xl mb-2 flex items-center gap-2">
        <Globe className="w-5 h-5 text-primary" />
        Preferred job country
      </h2>
      <p className="text-muted-foreground mb-4">
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
        <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          disabled={(!selected && !custom) || (!country && !customCountry)}
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
