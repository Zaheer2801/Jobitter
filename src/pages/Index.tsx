import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Briefcase, Sparkles, Bell, ArrowRight } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Career Matching", desc: "Upload your resume and discover perfect-fit roles" },
  { icon: Briefcase, title: "Fresh Jobs Daily", desc: "Scraped from top platforms, matched to your skills" },
  { icon: Bell, title: "Smart Notifications", desc: "Get alerted when high-match jobs appear" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="w-full flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-xl font-bold text-foreground tracking-tight">
          JOBITTER
        </span>
        <Button variant="ghost" size="sm" onClick={() => navigate("/onboarding/role")}>
          Sign in
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-powered career discovery
          </div>

          <h1 className="text-heading text-5xl md:text-6xl leading-tight mb-6">
            Find your next
            <br />
            <span className="text-primary">dream role</span>
          </h1>

          <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
            Upload your resume, explore career paths, and get matched with jobs that fit — automatically.
          </p>

          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate("/onboarding/role")}
            className="group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-3xl w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {features.map((f) => (
            <div key={f.title} className="card-dreamer text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-heading text-base mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
