import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface JobitterLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { text: "text-lg", bell: 14, gap: "gap-0", eText: "text-lg" },
  md: { text: "text-2xl", bell: 20, gap: "gap-0", eText: "text-2xl" },
  lg: { text: "text-5xl md:text-6xl", bell: 40, gap: "gap-0.5", eText: "text-5xl md:text-6xl" },
  xl: { text: "text-6xl md:text-7xl", bell: 48, gap: "gap-0.5", eText: "text-6xl md:text-7xl" },
};

const JobitterLogo = ({ size = "md", className = "" }: JobitterLogoProps) => {
  const s = sizeMap[size];
  const navigate = useNavigate();
  const [showBell, setShowBell] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShowBell((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      onClick={() => navigate("/")}
      className={`inline-flex items-baseline ${s.gap} font-light tracking-tight text-foreground cursor-pointer ${className}`}
    >
      <span className={s.text}>JOBITT</span>
      <span className="relative inline-flex items-baseline" style={{ width: `${s.bell}px`, height: `${s.bell}px` }}>
        <AnimatePresence mode="wait">
          {showBell ? (
            <motion.span
              key="bell"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformOrigin: "center center" }}
            >
              <Bell
                size={s.bell}
                className="text-foreground fill-foreground"
                strokeWidth={1.5}
              />
            </motion.span>
          ) : (
            <motion.span
              key="letter"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`absolute inset-0 flex items-center justify-center ${s.eText} font-light`}
              style={{ transformOrigin: "center center" }}
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
