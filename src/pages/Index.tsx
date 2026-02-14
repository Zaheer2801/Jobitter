import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Compass, Zap, ChevronDown } from "lucide-react";
import JobitterLogo from "@/components/JobitterLogo";

const steps = [
  {
    num: 1,
    title: "Shape your professional story",
    desc: "Upload your resume and share your current role to showcase your unique skills and experiences.",
  },
  {
    num: 2,
    title: "Explore career possibilities",
    desc: "Discover careers that align with your background and delve deeper into those that interest you.",
  },
  {
    num: 3,
    title: "Get matched with jobs",
    desc: "Receive smart notifications when high-match jobs appear, tailored to your skills.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="w-full flex items-center justify-center py-4 border-b border-border bg-card/60 backdrop-blur-sm">
        <JobitterLogo size="sm" />
      </header>

      {/* Nav Pills */}
      <div className="w-full px-4 py-3 flex justify-center">
        <div className="flex gap-3 max-w-3xl w-full">
          <button
            className="nav-pill flex-1 justify-center"
            onClick={() => navigate("/onboarding/name")}
          >
            <Sparkles className="w-4 h-4" />
            Career Identity
          </button>
          <button
            className="nav-pill flex-1 justify-center"
            onClick={() => navigate("/onboarding/paths")}
          >
            <Compass className="w-4 h-4" />
            Explore Paths
          </button>
          <button
            className="nav-pill flex-1 justify-center"
            onClick={() => navigate("/dashboard")}
          >
            <Zap className="w-4 h-4" />
            Get Matched
          </button>
        </div>
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl relative z-10"
        >
          <h1 className="mb-5">
            <JobitterLogo size="xl" />
          </h1>

          <p className="text-muted-foreground text-lg mb-10">
            A playful way to explore career possibilities with AI
          </p>

          <Button
            onClick={() => navigate("/onboarding/name")}
            className="h-14 px-16 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all"
          >
            Start
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </motion.div>
      </main>

      {/* How it works */}
      <section className="px-4 pb-24 flex flex-col items-center">
        <h2 className="text-xl font-medium text-foreground mb-10">How it works</h2>
        <div className="max-w-2xl w-full space-y-4">
          {steps.map((step) => (
            <motion.div
              key={step.num}
              className="card-dreamer flex gap-5 items-start"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.num * 0.1 }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">{step.num}</span>
              </div>
              <div>
                <h3 className="text-heading text-base mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
