import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface JobitterLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { text: "text-lg", bell: 14 },
  md: { text: "text-2xl", bell: 20 },
  lg: { text: "text-5xl md:text-6xl", bell: 40 },
  xl: { text: "text-6xl md:text-7xl", bell: 48 },
};

const JobitterLogo = ({ size = "md", className = "" }: JobitterLogoProps) => {
  const s = sizeMap[size];
  const navigate = useNavigate();
  const [showBell, setShowBell] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShowBell((prev) => !prev), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      onClick={() => navigate("/")}
      className={`inline-flex items-baseline tracking-tight text-foreground cursor-pointer select-none ${s.text} ${className}`}
      style={{ perspective: "400px", fontFamily: "'Comfortaa', sans-serif", fontWeight: 700 }}
    >
      JOBITT
      <AnimatePresence mode="wait">
        {showBell ? (
          <motion.span
            key="bell"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" as const }}
            className="inline-flex items-baseline"
            style={{ transformOrigin: "center center", backfaceVisibility: "hidden", display: "inline-flex" }}
          >
            <motion.span
              animate={{ rotate: [0, 12, -12, 8, -8, 4, -4, 0] }}
              transition={{ duration: 0.6, ease: "easeInOut" as const, delay: 0.35 }}
              className="inline-flex items-baseline"
            >
              <Bell
                size={s.bell}
                className="text-foreground fill-foreground"
                strokeWidth={1.5}
                style={{ verticalAlign: "baseline", marginBottom: "-0.1em" }}
              />
            </motion.span>
          </motion.span>
        ) : (
          <motion.span
            key="letter"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" as const }}
            style={{ transformOrigin: "center center", backfaceVisibility: "hidden" }}
          >
            E
          </motion.span>
        )}
      </AnimatePresence>
      R
    </span>
  );
};

export default JobitterLogo;
