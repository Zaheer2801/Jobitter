import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import SplitText from "@/components/SplitText";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, ChevronDown, Check } from "lucide-react";

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
  const [step, setStep] = useState<"role" | "country">("role");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    if (step === "role") {
      setStep("country");
      return;
    }
    update({
      currentRole: role,
      preferredCountry: country,
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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="w-full max-w-md relative"
              ref={dropdownRef}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-6 py-5 rounded-2xl bg-card border-2 border-border text-foreground text-base flex items-center justify-between hover:border-primary/40 transition-all duration-200"
              >
                <span className={country ? "text-foreground" : "text-muted-foreground/40"}>
                  {country || "Select a country..."}
                </span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-border">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-accent/50 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-60 overflow-y-auto py-2">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c) => (
                        <li key={c}>
                          <button
                            type="button"
                            onClick={() => {
                              setCountry(c);
                              setDropdownOpen(false);
                              setSearch("");
                            }}
                            className={`w-full px-5 py-3 text-left text-sm flex items-center justify-between hover:bg-accent/60 transition-colors ${
                              country === c ? "text-primary font-medium bg-primary/5" : "text-foreground"
                            }`}
                          >
                            {c}
                            {country === c && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-5 py-3 text-sm text-muted-foreground">No countries found</li>
                    )}
                  </ul>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex gap-3 mt-10 w-full max-w-sm"
            >
              <Button variant="outline" className="flex-1 rounded-2xl py-7 text-base" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1 rounded-2xl py-7 text-base"
                disabled={!country}
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
