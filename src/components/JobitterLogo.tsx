import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const bellColors = [
  "hsl(152, 68%, 42%)", // primary green
  "hsl(34, 95%, 55%)",  // warm orange
  "hsl(340, 75%, 55%)", // vibrant pink
  "hsl(210, 85%, 55%)", // bright blue
  "hsl(280, 70%, 55%)", // purple
  "hsl(45, 95%, 55%)",  // golden yellow
];

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
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBell((prev) => {
        if (prev) return false; // switching to E
        // switching to bell — pick next color
        setColorIndex((ci) => (ci + 1) % bellColors.length);
        return true;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const bellColor = bellColors[colorIndex];

  return (
    <span
      onClick={() => navigate("/")}
      className={`inline-flex items-baseline tracking-tight text-foreground cursor-pointer select-none ${s.text} ${className}`}
      style={{ perspective: "400px", fontFamily: "'Nunito', sans-serif", fontWeight: 900 }}
    >
      JOBITT
      <AnimatePresence mode="wait">
        {showBell ? (
          <motion.span
            key="bell"
            initial={{ rotateY: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotateY: 0, opacity: 1, scale: [1.25, 0.95, 1.05, 1] }}
            exit={{ rotateY: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
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
                className="transition-colors duration-300"
                strokeWidth={1.5}
                style={{ verticalAlign: "baseline", marginBottom: "-0.1em", color: bellColor, fill: bellColor }}
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
