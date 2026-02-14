import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding, CareerPath } from "@/contexts/OnboardingContext";
import SplitText from "@/components/SplitText";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import JobitterLogo from "@/components/JobitterLogo";

const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`;

// Generate well-spaced positions for bubbles using golden angle distribution
const generatePositions = (count: number) => {
  const positions: { x: number; y: number; scale: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°

  for (let i = 0; i < count; i++) {
    const angle = goldenAngle * i;
    const radius = 180 + (i % 3) * 80 + (i * 20);
    const clampedRadius = Math.min(radius, 340);
    positions.push({
      x: Math.cos(angle) * clampedRadius,
      y: Math.sin(angle) * (clampedRadius * 0.6), // squish vertically to avoid overflow
      scale: 1,
    });
  }
  return positions;
};

const getRoleDescription = (role: string): string[] => {
  const lower = role.toLowerCase();
  if (lower.includes("analyst")) return ["Analyze data trends & patterns", "Create reports & dashboards", "Drive data-informed decisions"];
  if (lower.includes("engineer")) return ["Design & build systems", "Write clean, scalable code", "Collaborate with cross-functional teams"];
  if (lower.includes("manager")) return ["Lead & mentor team members", "Set goals & track progress", "Coordinate cross-team projects"];
  if (lower.includes("designer")) return ["Create intuitive user experiences", "Build design systems & prototypes", "Conduct user research"];
  if (lower.includes("developer")) return ["Build & maintain applications", "Debug & optimize performance", "Implement new features"];
  if (lower.includes("scientist")) return ["Build predictive models", "Analyze complex datasets", "Present actionable insights"];
  if (lower.includes("intern")) return ["Learn industry best practices", "Support team projects", "Gain hands-on experience"];
  if (lower.includes("lead")) return ["Guide technical direction", "Mentor junior members", "Deliver high-impact projects"];
  if (lower.includes("consultant")) return ["Advise on best practices", "Solve complex problems", "Deliver client solutions"];
  return ["Drive key initiatives", "Collaborate with teams", "Deliver impactful results"];
};

const OnboardingPaths = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [paths, setPaths] = useState<CareerPath[]>(data.careerPaths);

  useEffect(() => {
    if (paths.length === 0 && data.resumeProfile) {
      fetchPaths();
    }
  }, []);

  const fetchPaths = async () => {
    if (!data.resumeProfile) return;
    setLoading(true);
    try {
      const resp = await fetch(PARSE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "career-paths",
          currentRole: data.currentRole,
          profileData: data.resumeProfile,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to generate paths");
      }

      const result = await resp.json();
      const generated: CareerPath[] = result.data.paths;
      setPaths(generated);
      update({ careerPaths: generated });
    } catch (err: any) {
      console.error("Career paths error:", err);
      toast.error(err.message || "Failed to generate career paths.");
    } finally {
      setLoading(false);
    }
  };

  const bubblePositions = useMemo(() => generatePositions(paths.length || 5), [paths.length]);

  const getMatchColor = (match: number) => {
    if (match >= 90) return "bg-primary text-primary-foreground";
    if (match >= 80) return "bg-primary/80 text-primary-foreground";
    return "bg-card text-foreground border border-border";
  };

  const getDotColor = (match: number) => {
    if (match >= 85) return "bg-success";
    return "bg-primary";
  };

  return (
    <div className="min-h-screen bg-accent/20 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/onboarding/resume")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <JobitterLogo size="sm" />
        <div className="w-8" />
      </header>

      {/* Progress */}
      <div className="h-1 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex gap-3 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-4 h-4 rounded-full bg-primary"
              />
            ))}
          </div>
          <SplitText
            text="AI is finding your career paths..."
            className="text-heading text-lg md:text-xl font-normal text-muted-foreground"
            splitType="words"
            staggerDelay={0.08}
            tag="h3"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-muted-foreground text-sm mt-3"
          >
            Analyzing your skills and experience
          </motion.p>
        </div>
      ) : paths.length > 0 ? (
        <div className="flex-1 flex flex-col">
          {/* Scatter visualization - full width */}
          <div className="relative w-full h-[500px] md:h-[550px] overflow-hidden">
            {/* Central glowing orb */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                {/* Outer glow */}
                <div className="w-48 h-48 rounded-full bg-gradient-radial from-primary/10 via-primary/5 to-transparent absolute -inset-8" />
                {/* Inner circle */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 via-accent/40 to-primary/10 border border-primary/10 flex flex-col items-center justify-center shadow-2xl shadow-primary/10 backdrop-blur-sm">
                  <p className="text-muted-foreground text-xs font-medium">Explore paths</p>
                  <p className="text-muted-foreground text-xs">based on...</p>
                  <div className="flex gap-1 mt-2 text-lg">🎓💪</div>
                </div>
              </motion.div>
            </div>

            {/* Scattered career bubbles */}
            {paths.map((path, i) => {
              const pos = bubblePositions[i];
              if (!pos) return null;
              const isHighMatch = path.match >= 85;

              return (
                <motion.div
                  key={path.role}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: pos.scale,
                    x: [pos.x - 8, pos.x + 8, pos.x - 5, pos.x + 5, pos.x - 8],
                    y: [pos.y + 6, pos.y - 6, pos.y + 4, pos.y - 8, pos.y + 6],
                  }}
                  transition={{
                    opacity: { delay: 0.5 + i * 0.12, duration: 0.4 },
                    scale: { delay: 0.5 + i * 0.12, type: "spring", stiffness: 120, damping: 14 },
                    x: { delay: 0.5 + i * 0.12, duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut" },
                    y: { delay: 0.5 + i * 0.12, duration: 10 + i * 1.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                  whileHover={{ scale: 1.15, zIndex: 50 }}
                  onHoverStart={() => setHoveredPath(path.role)}
                  onHoverEnd={() => setHoveredPath(null)}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ zIndex: hoveredPath === path.role ? 50 : isHighMatch ? 5 : 2 }}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getDotColor(path.match)}`} />
                    <span className="text-foreground text-sm font-medium">{path.role}</span>
                  </div>

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {hoveredPath === path.role && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-2xl shadow-xl p-4 min-w-[200px] max-w-[240px] z-50"
                      >
                        <p className="text-xs font-semibold text-foreground mb-2">Key Responsibilities</p>
                        <ul className="space-y-1.5">
                          {getRoleDescription(path.role).map((desc, di) => (
                            <li key={di} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {desc}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 pt-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground/60">{path.match}% match</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-4 left-6 flex gap-4"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                Database result
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-success" />
                AI result
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex gap-3 mt-auto max-w-sm mx-auto w-full px-6 py-6"
          >
            <Button
              variant="outline"
              className="flex-1 rounded-2xl py-7 text-base"
              onClick={() => navigate("/onboarding/resume")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="hero"
              className="flex-1 rounded-2xl py-7 text-base"
              disabled={paths.length === 0}
              onClick={async () => {
                try {
                  await supabase.from("job_alert_profiles").insert({
                    positions: paths.map((p) => p.role),
                    skills: data.resumeProfile?.skills || [],
                    role_title: data.currentRole,
                    preferred_country: data.preferredCountry || null,
                  });
                } catch (e) {
                  console.error("Failed to save profile:", e);
                }
                navigate("/auth");
              }}
            >
              Start Getting Jobs
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">No career paths generated yet.</p>
          <Button variant="hero" onClick={fetchPaths} className="rounded-2xl px-10 py-6">
            Generate Paths
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingPaths;
