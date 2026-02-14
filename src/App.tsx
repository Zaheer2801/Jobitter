import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Index from "./pages/Index";
import OnboardingName from "./pages/OnboardingName";
import OnboardingRole from "./pages/OnboardingRole";
import OnboardingResume from "./pages/OnboardingResume";
import OnboardingPaths from "./pages/OnboardingPaths";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OnboardingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding/name" element={<OnboardingName />} />
            <Route path="/onboarding/role" element={<OnboardingRole />} />
            <Route path="/onboarding/resume" element={<OnboardingResume />} />
            <Route path="/onboarding/paths" element={<OnboardingPaths />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OnboardingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
