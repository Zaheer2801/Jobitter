import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

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

  // Position items in concentric rings
  const positions = [
    { x: 0, y: -90, ring: 1 },
    { x: 85, y: -28, ring: 1 },
    { x: 53, y: 73, ring: 2 },
    { x: -53, y: 73, ring: 2 },
    { x: -85, y: -28, ring: 2 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-heading text-3xl mb-2">Your Career Paths</h2>
        <p className="text-muted-foreground">Based on your skills and experience</p>
      </motion.div>

      {/* Radar-style visualization */}
      <div className="relative w-80 h-80 md:w-96 md:h-96 mb-12">
        {/* Rings */}
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

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Rocket className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Path nodes */}
        {paths.map((path, i) => {
          const pos = positions[i];
          const scale = path.match / 100;
          return (
            <motion.div
              key={path.role}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
              className="absolute flex flex-col items-center"
              style={{
                left: `calc(50% + ${pos.x * 1.5}px)`,
                top: `calc(50% + ${pos.y * 1.5}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`rounded-2xl px-4 py-2.5 shadow-md border text-center transition-all hover:scale-105 cursor-default ${
                  path.match >= 85
                    ? "bg-primary text-primary-foreground border-primary glow-primary"
                    : path.match >= 70
                    ? "bg-card text-foreground border-primary/30"
                    : "bg-card text-foreground border-border"
                }`}
              >
                <p className="text-sm font-semibold whitespace-nowrap">{path.role}</p>
                <p className={`text-xs font-bold mt-0.5 ${
                  path.match >= 85 ? "text-primary-foreground/80" : "text-primary"
                }`}>
                  {path.match}% match
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          variant="hero"
          size="xl"
          onClick={() => navigate("/dashboard")}
          className="group"
        >
          Start Getting Jobs
          <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
};

export default OnboardingPaths;
