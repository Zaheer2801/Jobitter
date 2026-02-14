import { ReactNode } from "react";
import { motion } from "framer-motion";
import JobitterLogo from "@/components/JobitterLogo";

interface OnboardingShellProps {
  step: number;
  totalSteps: number;
  children: ReactNode;
}

const OnboardingShell = ({ step, totalSteps, children }: OnboardingShellProps) => {
  return (
    <div className="min-h-screen bg-accent/30 flex flex-col relative">
      {/* Minimal header */}
      <header className="w-full flex items-center justify-center px-6 py-4 relative z-10">
        <JobitterLogo size="sm" />
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
