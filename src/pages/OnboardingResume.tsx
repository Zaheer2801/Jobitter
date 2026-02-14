import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle2, FileText, ArrowRight } from "lucide-react";

const OnboardingResume = () => {
  const navigate = useNavigate();
  const { update } = useOnboarding();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState(false);

  // Mock resume parsing — in production this calls an edge function
  const parseResume = useCallback((f: File) => {
    setFile(f);
    setTimeout(() => {
      update({
        resumeFile: f,
        resumeParsed: {
          name: "John Doe",
          skills: ["SQL", "Python", "Tableau", "Excel", "Data Modeling"],
          experience: "3 years as Data Analyst",
          education: "MS Information Systems",
        },
        confirmedSkills: ["SQL", "Python", "Tableau", "Excel", "Data Modeling"],
      });
      setParsed(true);
    }, 1500);
  }, [update]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseResume(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseResume(f);
  };

  return (
    <OnboardingShell step={2} totalSteps={4}>
      <h2 className="text-heading text-2xl mb-2">Upload your resume</h2>
      <p className="text-muted-foreground mb-6">
        We'll extract your skills and experience to find perfect matches.
      </p>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/40"
              }`}
              onClick={() => document.getElementById("resume-input")?.click()}
            >
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">
                Drag & drop your resume
              </p>
              <p className="text-muted-foreground text-sm">PDF or DOCX, up to 10MB</p>
            </div>
            <input
              id="resume-input"
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileInput}
            />
          </motion.div>
        ) : !parsed ? (
          <motion.div
            key="parsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground font-medium">Parsing your resume...</p>
            <p className="text-muted-foreground text-sm mt-1">{file.name}</p>
          </motion.div>
        ) : (
          <motion.div
            key="parsed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 bg-accent rounded-xl p-4">
              <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
              <div>
                <p className="text-foreground font-medium">Resume parsed successfully!</p>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {file?.name}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Detected Profile
                </span>
                <p className="text-foreground font-medium mt-1">
                  John Doe · Data Analyst · 3 yrs exp
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Skills Found
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["SQL", "Python", "Tableau", "Excel", "Data Modeling"].map((s) => (
                    <span
                      key={s}
                      className="bg-accent text-accent-foreground px-2.5 py-1 rounded-lg text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Education
                </span>
                <p className="text-foreground text-sm mt-1">MS Information Systems</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/onboarding/role")}>
          Back
        </Button>
        <Button
          variant="hero"
          className="flex-1"
          disabled={!parsed}
          onClick={() => navigate("/onboarding/skills")}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {!file && (
        <button
          onClick={() => {
            // Skip resume upload with mock data
            update({
              resumeParsed: {
                name: "John Doe",
                skills: ["SQL", "Python", "Tableau", "Excel", "Data Modeling"],
                experience: "3 years as Data Analyst",
                education: "MS Information Systems",
              },
              confirmedSkills: ["SQL", "Python", "Tableau", "Excel", "Data Modeling"],
            });
            navigate("/onboarding/skills");
          }}
          className="w-full text-center text-sm text-muted-foreground hover:text-primary mt-4 transition-colors"
        >
          Skip for now →
        </button>
      )}
    </OnboardingShell>
  );
};

export default OnboardingResume;
