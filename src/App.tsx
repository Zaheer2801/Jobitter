import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { useColorTheme } from "@/hooks/useColorTheme";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import OnboardingName from "./pages/OnboardingName";
import OnboardingRole from "./pages/OnboardingRole";
import OnboardingResume from "./pages/OnboardingResume";
import OnboardingPaths from "./pages/OnboardingPaths";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ColorThemeApplier = () => {
  const { data } = useOnboarding();
  useColorTheme(data.favoriteColor);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/onboarding/name" element={<PageTransition><OnboardingName /></PageTransition>} />
        <Route path="/onboarding/role" element={<PageTransition><OnboardingRole /></PageTransition>} />
        <Route path="/onboarding/resume" element={<PageTransition><OnboardingResume /></PageTransition>} />
        <Route path="/onboarding/paths" element={<PageTransition><OnboardingPaths /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OnboardingProvider>
          <ColorThemeApplier />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
export default App;
