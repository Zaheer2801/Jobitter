import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion } from "framer-motion";
import { Rocket, ArrowLeft, ArrowRight } from "lucide-react";

const OnboardingPaths = () => {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const paths = data.careerPaths.length > 0
    ? data.careerPaths
    : [
        { role: "Data Analyst", match: 92 },
        { role: "BI Analyst", match: 87 },
        { role: "Data Engineer", match: 78 },
        { role: "Business Analyst", match: 75 },
        { role: "Reporting Specialist", match: 68 },
      ];

  const positions = [
    { x: 0, y: -90, ring: 1 },
    { x: 85, y: -28, ring: 1 },
    { x: 53, y: 73, ring: 2 },
    { x: -53, y: 73, ring: 2 },
    { x: -85, y: -28, ring: 2 },
  ];

  return (
    <OnboardingShell step={4} totalSteps={4}>
      <h2 className="text-heading text-2xl mb-2 text-center">Your Career Paths</h2>
      <p className="text-muted-foreground text-center mb-6">Based on your skills and experience</p>

      {/* Radar visualization */}
      <div className="relative w-72 h-72 mx-auto mb-8">
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-border"
            style={{
              width: `${ring * 33}%`,
              height: `${ring * 33}%`,
              top: `${50 - (ring * 33) / 2}%`,
              left: `${50 - (ring * 33) / 2}%`,
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
        </div>

        {paths.map((path, i) => {
          const pos = positions[i];
          return (
            <motion.div
              key={path.role}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
              className="absolute flex flex-col items-center"
              style={{
                left: `calc(50% + ${pos.x * 1.3}px)`,
                top: `calc(50% + ${pos.y * 1.3}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`rounded-2xl px-3 py-2 shadow-md border text-center transition-all hover:scale-105 cursor-default ${
                  path.match >= 85
                    ? "bg-primary text-primary-foreground border-primary glow-primary"
                    : path.match >= 70
                    ? "bg-card text-foreground border-primary/30"
                    : "bg-card text-foreground border-border"
                }`}
              >
                <p className="text-xs font-semibold whitespace-nowrap">{path.role}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${
                  path.match >= 85 ? "text-primary-foreground/80" : "text-primary"
                }`}>
                  {path.match}%
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/onboarding/skills")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          variant="hero"
          className="flex-1"
          onClick={() => navigate("/dashboard")}
        >
          Start Getting Jobs
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingPaths;
