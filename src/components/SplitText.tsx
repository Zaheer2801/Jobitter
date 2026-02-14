import { motion } from "framer-motion";
import { useMemo } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  splitType?: "chars" | "words";
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

const SplitText = ({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.04,
  duration = 0.6,
  splitType = "chars",
  tag: Tag = "h2",
}: SplitTextProps) => {
  const elements = useMemo(() => {
    if (splitType === "words") {
      return text.split(" ").map((word, i) => ({ char: word, isSpace: false, key: i }));
    }
    return text.split("").map((char, i) => ({
      char,
      isSpace: char === " ",
      key: i,
    }));
  }, [text, splitType]);

  return (
    <Tag className={`${className} flex flex-wrap justify-center`}>
      {elements.map(({ char, isSpace, key }) =>
        isSpace ? (
          <span key={key} className="inline-block" style={{ width: "0.3em" }} />
        ) : (
          <motion.span
            key={key}
            initial={{
              opacity: 0,
              y: 40,
              rotateX: 90,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
            }}
            transition={{
              delay: delay + key * staggerDelay,
              duration,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-block"
            style={{
              marginRight: splitType === "words" ? "0.3em" : undefined,
            }}
          >
            {char}
          </motion.span>
        )
      )}
    </Tag>
  );
};

export default SplitText;
