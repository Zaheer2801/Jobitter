import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingShell from "@/components/OnboardingShell";
import { motion } from "framer-motion";
import { X, Plus, ArrowRight } from "lucide-react";

const OnboardingSkills = () => {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();
  const [skills, setSkills] = useState<string[]>(
    data.confirmedSkills.length > 0
      ? data.confirmedSkills
      : ["SQL", "Python", "Tableau", "Excel", "Data Modeling"]
  );
  const [newSkill, setNewSkill] = useState("");

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleNext = () => {
    update({
      confirmedSkills: skills,
      careerPaths: [
        { role: "Data Analyst", match: 92 },
        { role: "BI Analyst", match: 87 },
        { role: "Data Engineer", match: 78 },
        { role: "Business Analyst", match: 75 },
        { role: "Reporting Specialist", match: 68 },
      ],
    });
    navigate("/onboarding/paths");
  };

  return (
    <OnboardingShell step={3} totalSteps={4}>
      <h2 className="text-heading text-2xl mb-2">Confirm your skills</h2>
      <p className="text-muted-foreground mb-6">
        Extracted from your resume. Edit or add more below.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-xl text-sm font-medium group"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.span>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add a skill..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
        <Button variant="outline" size="default" onClick={addSkill}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {data.resumeParsed && (
        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Education:</span>{" "}
            {data.resumeParsed.education}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">Experience:</span>{" "}
            {data.resumeParsed.experience}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/onboarding/resume")}>
          Back
        </Button>
        <Button variant="hero" className="flex-1" disabled={skills.length === 0} onClick={handleNext}>
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingSkills;
