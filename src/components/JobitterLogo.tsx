import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface JobitterLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { text: "text-lg", bell: 14, gap: "gap-0" },
  md: { text: "text-2xl", bell: 20, gap: "gap-0" },
  lg: { text: "text-5xl md:text-6xl", bell: 40, gap: "gap-0.5" },
  xl: { text: "text-6xl md:text-7xl", bell: 48, gap: "gap-0.5" },
};

const bellRing = {
  animate: {
    rotate: [0, 12, -12, 8, -8, 4, -4, 0],
    transition: { duration: 0.6, ease: "easeInOut" as const, delay: 0.35 },
  },
};

const flipIn = {
  initial: { rotateY: 90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 },
  transition: { duration: 0.4, ease: "easeInOut" as const },
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
      className={`inline-flex items-baseline ${s.gap} font-light tracking-tight text-foreground cursor-pointer select-none ${className}`}
      style={{ perspective: "400px" }}
    >
      <span className={s.text}>JOBITT</span>
      <span
        className="relative inline-flex items-baseline"
        style={{ width: `${s.bell * 0.75}px`, height: "1em" }}
      >
        <AnimatePresence mode="wait">
          {showBell ? (
            <motion.span
              key="bell"
              {...flipIn}
              className="absolute inset-0 flex items-end justify-center"
              style={{ transformOrigin: "center center", backfaceVisibility: "hidden" }}
            >
              <motion.span {...bellRing} className="inline-flex" style={{ marginBottom: "-0.05em" }}>
                <Bell
                  size={s.bell}
                  className="text-foreground fill-foreground"
                  strokeWidth={1.5}
                />
              </motion.span>
            </motion.span>
          ) : (
            <motion.span
              key="letter"
              {...flipIn}
              className={`absolute inset-0 flex items-end justify-center ${s.text} font-light leading-none`}
              style={{ transformOrigin: "center center", backfaceVisibility: "hidden" }}
            >
              E
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className={s.text}>R</span>
    </span>
  );
};

export default JobitterLogo;
