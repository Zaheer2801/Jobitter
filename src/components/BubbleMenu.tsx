import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BubbleMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface BubbleMenuProps {
  items: BubbleMenuItem[];
  trigger?: React.ReactNode;
  className?: string;
}

const BubbleMenu = ({ items, trigger, className = "" }: BubbleMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Trigger */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="relative z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {trigger || (
          <motion.div className="flex flex-col gap-1">
            <motion.span
              animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="block w-4 h-0.5 bg-primary-foreground rounded-full"
            />
            <motion.span
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="block w-4 h-0.5 bg-primary-foreground rounded-full"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="block w-4 h-0.5 bg-primary-foreground rounded-full"
            />
          </motion.div>
        )}
      </motion.button>

      {/* Bubble items */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-0"
              onClick={() => setOpen(false)}
            />

            {/* Items fanning out */}
            {items.map((item, i) => {
              const angle = -90 + (i * 180) / Math.max(items.length - 1, 1);
              const rad = (angle * Math.PI) / 180;
              const distance = 80;
              const x = Math.cos(rad) * distance;
              const y = Math.sin(rad) * distance;

              return (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: 1, x, y, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className="absolute z-10 top-0 left-0 flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-lg text-foreground text-sm font-medium whitespace-nowrap hover:bg-accent transition-colors"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubbleMenu;
