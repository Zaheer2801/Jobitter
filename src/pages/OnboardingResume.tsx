import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding, ResumeProfile } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle2, FileText, ArrowRight, X, Plus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`;

const OnboardingResume = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [profile, setProfile] = useState<ResumeProfile | null>(data.resumeProfile);
  const [newSkill, setNewSkill] = useState("");
  const [enhancing, setEnhancing] = useState(false);

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip data:...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  const parseResume = useCallback(async (f: File) => {
    setFile(f);
    setParsing(true);
    try {
      const base64 = await fileToBase64(f);
      const resp = await fetch(PARSE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "parse", fileBase64: base64, fileName: f.name }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to parse resume");
      }

      const result = await resp.json();
      const parsed: ResumeProfile = result.data;
      setProfile(parsed);
      update({ resumeFile: f, resumeProfile: parsed });
      toast.success("Resume parsed successfully!");
    } catch (err: any) {
      console.error("Parse error:", err);
      toast.error(err.message || "Failed to parse resume. Please try again.");
      setFile(null);
    } finally {
      setParsing(false);
    }
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

  const handleEnhance = async () => {
    if (!profile) return;
    setEnhancing(true);
    try {
      const resp = await fetch(PARSE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "enhance",
          profileData: profile,
          currentRole: data.currentRole,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to enhance profile");
      }

      const result = await resp.json();
      const enhanced: ResumeProfile = { ...profile, ...result.data };
      setProfile(enhanced);
      update({ resumeProfile: enhanced });
      toast.success("Profile enhanced with AI!");
    } catch (err: any) {
      console.error("Enhance error:", err);
      toast.error(err.message || "Enhancement failed. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const updateField = (field: keyof ResumeProfile, value: string | string[]) => {
    if (!profile) return;
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    update({ resumeProfile: updated });
  };

  const removeSkill = (skill: string) => {
    if (!profile) return;
    updateField("skills", profile.skills.filter((s) => s !== skill));
  };

  const addSkill = () => {
    if (!profile || !newSkill.trim() || profile.skills.includes(newSkill.trim())) return;
    updateField("skills", [...profile.skills, newSkill.trim()]);
    setNewSkill("");
  };

  const handleNext = () => {
    if (!profile) return;
    update({ resumeProfile: profile });
    navigate("/onboarding/paths");
  };

  return (
    <OnboardingShell step={2} totalSteps={3}>
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
              <p className="text-foreground font-medium mb-1">Drag & drop your resume</p>
              <p className="text-muted-foreground text-sm">PDF or DOCX, up to 10MB</p>
            </div>
            <input
              id="resume-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={handleFileInput}
            />
          </motion.div>
        ) : parsing ? (
          <motion.div
            key="parsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground font-medium">AI is parsing your resume...</p>
            <p className="text-muted-foreground text-sm mt-1">{file.name}</p>
          </motion.div>
        ) : profile ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Success banner */}
            <div className="flex items-center gap-3 bg-accent rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium">Resume parsed!</p>
                <p className="text-muted-foreground text-xs flex items-center gap-1 truncate">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  {file?.name}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhance}
                disabled={enhancing}
                className="flex-shrink-0"
              >
                {enhancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {enhancing ? "Enhancing..." : "AI Enhance"}
              </Button>
            </div>

            {/* Editable fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Email</label>
                  <input
                    type="email"
                    value={profile.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Experience</label>
                <input
                  type="text"
                  value={profile.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Education</label>
                <input
                  type="text"
                  value={profile.education}
                  onChange={(e) => updateField("education", e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Summary</label>
                <textarea
                  value={profile.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Skills</label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2.5 py-1 rounded-lg text-xs font-medium"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="opacity-50 hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button variant="outline" size="sm" onClick={addSkill}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/onboarding/role")}>
          Back
        </Button>
        <Button
          variant="hero"
          className="flex-1"
          disabled={!profile}
          onClick={handleNext}
        >
          Explore Paths
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingResume;
