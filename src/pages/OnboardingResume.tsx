import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding, ResumeProfile } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import AnimatedText from "@/components/AnimatedText";
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
        resolve(result.split(",")[1]);
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
      <div className="flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                className="text-5xl mb-6"
              >
                📄
              </motion.div>

              <h2 className="text-heading text-2xl md:text-3xl lg:text-4xl mb-3 leading-snug">
                <AnimatedText text="Now, let's see your resume:" delay={0.3} />
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-muted-foreground mb-8"
              >
                We'll extract your skills and experience to find perfect matches.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-16 transition-all duration-300 cursor-pointer group ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                  onClick={() => document.getElementById("resume-input")?.click()}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground/60 group-hover:text-primary mx-auto mb-4 transition-colors" />
                  </motion.div>
                  <p className="text-foreground font-medium text-lg mb-1">Drag & drop your resume</p>
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-6"
              >
                <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/onboarding/role")}>
                  Back
                </Button>
              </motion.div>
            </motion.div>
          ) : parsing ? (
            <motion.div
              key="parsing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
              />
              <h3 className="text-heading text-xl mb-2">
                <AnimatedText text="AI is reading your resume..." delay={0.2} />
              </h3>
              <p className="text-muted-foreground text-sm">{file.name}</p>
            </motion.div>
          ) : profile ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full text-left"
            >
              {/* Success banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 bg-primary/5 rounded-2xl p-4 mb-6"
              >
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium">Resume parsed!</p>
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
                  className="flex-shrink-0 rounded-xl"
                >
                  {enhancing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {enhancing ? "Enhancing..." : "AI Enhance"}
                </Button>
              </motion.div>

              {/* Editable fields */}
              <div className="space-y-4">
                {[
                  { label: "Name", field: "name" as const, value: profile.name, type: "text" },
                ].map((item, i) => (
                  <motion.div
                    key={item.field}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</label>
                    <input
                      type={item.type}
                      value={item.value}
                      onChange={(e) => updateField(item.field, e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border-none bg-primary/5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Email</label>
                    <input
                      type="email"
                      value={profile.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="your@email.com"
                      className="w-full mt-1 px-4 py-3 rounded-xl border-none bg-primary/5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full mt-1 px-4 py-3 rounded-xl border-none bg-primary/5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </motion.div>

                {[
                  { label: "Experience", field: "experience" as const, value: profile.experience },
                  { label: "Education", field: "education" as const, value: profile.education },
                ].map((item, i) => (
                  <motion.div
                    key={item.field}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.46 + i * 0.08 }}
                  >
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateField(item.field, e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border-none bg-primary/5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.62 }}
                >
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Summary</label>
                  <textarea
                    value={profile.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    rows={3}
                    className="w-full mt-1 px-4 py-3 rounded-xl border-none bg-primary/5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
                  />
                </motion.div>

                {/* Skills */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Skills</label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {profile.skills.map((skill, si) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.75 + si * 0.03 }}
                        className="inline-flex items-center gap-1 bg-primary/10 text-foreground px-3 py-1.5 rounded-full text-xs font-medium"
                      >
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="opacity-50 hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      className="flex-1 px-4 py-3 rounded-xl border-none bg-primary/5 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <Button variant="outline" size="sm" onClick={addSkill} className="rounded-xl">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex gap-3 mt-8"
              >
                <Button variant="outline" className="flex-1 rounded-2xl py-6" onClick={() => navigate("/onboarding/role")}>
                  Back
                </Button>
                <Button
                  variant="hero"
                  className="flex-1 rounded-2xl py-6"
                  disabled={!profile}
                  onClick={handleNext}
                >
                  Explore Paths
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingResume;
