import { Bell } from "lucide-react";

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

const JobitterLogo = ({ size = "md", className = "" }: JobitterLogoProps) => {
  const s = sizeMap[size];

  return (
    <span className={`inline-flex items-baseline ${s.gap} font-light tracking-tight text-foreground ${className}`}>
      <span className={s.text}>JOBITT</span>
      <Bell
        size={s.bell}
        className="text-foreground fill-foreground relative"
        style={{ marginBottom: "-0.05em" }}
        strokeWidth={1.5}
      />
      <span className={s.text}>R</span>
    </span>
  );
};

export default JobitterLogo;
