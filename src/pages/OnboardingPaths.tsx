import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding, CareerPath } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion } from "framer-motion";
import { Rocket, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`;

const OnboardingPaths = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [loading, setLoading] = useState(false);
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

  const positions = [
    { x: 0, y: -90, ring: 1 },
    { x: 85, y: -28, ring: 1 },
    { x: 53, y: 73, ring: 2 },
    { x: -53, y: 73, ring: 2 },
    { x: -85, y: -28, ring: 2 },
  ];

  return (
    <OnboardingShell step={3} totalSteps={3}>
      <h2 className="text-heading text-2xl mb-2 text-center">Your Career Paths</h2>
      <p className="text-muted-foreground text-center mb-6">Based on your skills and experience</p>

      {loading ? (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-foreground font-medium">AI is analyzing your profile...</p>
          <p className="text-muted-foreground text-sm mt-1">Finding the best career paths for you</p>
        </div>
      ) : paths.length > 0 ? (
        <>
          {/* Radar visualization */}
          <div className="relative w-72 h-72 mx-auto mb-4">
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

            {paths.slice(0, 5).map((path, i) => {
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

          {/* Path details */}
          <div className="space-y-2 mb-4">
            {paths.map((path, i) => (
              <motion.div
                key={path.role}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 bg-accent/50 rounded-xl px-3 py-2"
              >
                <span className={`text-sm font-bold min-w-[40px] ${
                  path.match >= 85 ? "text-primary" : path.match >= 70 ? "text-success" : "text-muted-foreground"
                }`}>{path.match}%</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{path.role}</p>
                  {path.reason && (
                    <p className="text-xs text-muted-foreground truncate">{path.reason}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No career paths generated yet.</p>
          <Button variant="outline" className="mt-4" onClick={fetchPaths}>
            Generate Paths
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/onboarding/resume")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          variant="hero"
          className="flex-1"
          disabled={paths.length === 0}
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
