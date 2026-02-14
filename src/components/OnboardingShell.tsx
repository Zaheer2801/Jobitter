import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import JobitterLogo from "@/components/JobitterLogo";
import Prism from "@/components/Prism";

interface OnboardingShellProps {
  step: number;
  totalSteps: number;
  children: ReactNode;
}

const OnboardingShell = ({ step, totalSteps, children }: OnboardingShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-accent/30 flex flex-col relative">
      {/* Prism background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Prism
          animationType="hover"
          scale={5}
          glow={0.8}
          noise={0}
          transparent={true}
          timeScale={0.2}
          hoverStrength={1.5}
          suspendWhenOffscreen
        />
      </div>
      {/* Minimal header */}
      <header className="w-full flex items-center justify-between px-6 py-4 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </button>
        <JobitterLogo size="sm" />
        <div className="w-16" />
      </header>

      {/* Progress bar - thin at top */}
      <div className="w-full px-0 relative z-10">
        <div className="h-1 bg-secondary">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Full-screen centered content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingShell;
