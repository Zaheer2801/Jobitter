import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Bell, Search, Heart, ExternalLink, MapPin, DollarSign,
  Briefcase, Star, TrendingUp, Loader2, RefreshCw,
  MessageCircle, Check, LogOut, User,
} from "lucide-react";
import JobitterLogo from "@/components/JobitterLogo";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SCRAPE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-jobs`;

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  salaryRange: string;
  matchScore: number;
  matchedSkills: string[];
  postedAgo: string;
  url: string;
  saved: boolean;
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role_title: string | null;
  preferred_country: string | null;
  skills: string[];
}

const WhatsAppWebhookCard = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter your Zapier webhook URL");
      return;
    }
    setSaving(true);
    try {
      const { data: profiles } = await supabase
        .from("job_alert_profiles")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1);

      if (profiles && profiles.length > 0) {
        await supabase
          .from("job_alert_profiles")
          .update({ zapier_webhook_url: webhookUrl })
          .eq("id", profiles[0].id);
      }
      setSaved(true);
      toast.success("WhatsApp alerts enabled! You'll get hourly job notifications.");
    } catch (e) {
      toast.error("Failed to save webhook URL");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-dreamer p-5 border-primary/20 bg-accent/50">
      <h4 className="text-heading text-sm flex items-center gap-2 mb-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        WhatsApp Alerts
      </h4>
      <p className="text-xs text-muted-foreground mb-3">
        Get hourly job alerts on WhatsApp via Zapier.
      </p>
      {saved ? (
        <div className="flex items-center gap-2 text-success text-sm">
          <Check className="w-4 h-4" />
          <span>Alerts active — checking every hour!</span>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="https://hooks.zapier.com/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="text-xs"
          />
          <Button variant="hero" size="sm" className="w-full" onClick={saveWebhook} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enable WhatsApp Alerts"}
          </Button>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { data } = useOnboarding();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (profileData) {
        setProfile(profileData as unknown as Profile);
      }
    };
    fetchProfile();
  }, [user]);

  // Save onboarding data to profile
  useEffect(() => {
    if (!user || !data.resumeProfile) return;
    const updateProfile = async () => {
      await supabase
        .from("profiles")
        .update({
          role_title: data.currentRole,
          preferred_country: data.preferredCountry,
          skills: data.resumeProfile?.skills || [],
          summary: data.resumeProfile?.summary || "",
          display_name: data.candidateName || data.resumeProfile?.name || undefined,
        })
        .eq("user_id", user.id);
    };
    updateProfile();
  }, [user, data.resumeProfile]);

  const fetchJobs = async () => {
    const positions = data.careerPaths.map((p) => p.role);
    const skills = profile?.skills?.length ? profile.skills : data.resumeProfile?.skills || [];
    const country = profile?.preferred_country || data.preferredCountry || "";

    if (positions.length === 0) {
      toast.error("No positions found. Complete onboarding first.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(SCRAPE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ positions, skills, country }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to fetch jobs");
      }

      const result = await resp.json();
      const fetchedJobs: Job[] = (result.jobs || []).map((j: any, i: number) => ({
        ...j,
        id: `job-${i}`,
        saved: false,
      }));
      setJobs(fetchedJobs);

      if (fetchedJobs.length === 0) {
        toast.info("No jobs found. Try broadening your positions.");
      } else {
        toast.success(`Found ${fetchedJobs.length} real job listings!`);
      }
    } catch (err: any) {
      console.error("Job fetch error:", err);
      toast.error(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.careerPaths.length > 0) {
      fetchJobs();
    }
  }, []);

  const toggleSave = (id: string) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, saved: !j.saved } : j)));

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const savedCount = jobs.filter((j) => j.saved).length;

  const displayName = profile?.display_name || data.candidateName || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displaySkills = profile?.skills?.length ? profile.skills : data.resumeProfile?.skills || [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <JobitterLogo size="sm" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {jobs.length}
              </span>
            </div>

            {/* Profile avatar with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    {profile?.role_title && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {profile.role_title}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-destructive hover:bg-accent/60 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Main feed */}
        <div className="flex-1">
          {/* Search bar */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <Button variant="outline" size="default" onClick={fetchJobs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Loading */}
          {loading && jobs.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-foreground font-medium">Scraping real jobs from the web...</p>
              <p className="text-muted-foreground text-sm mt-1">Searching Indeed, LinkedIn, Glassdoor & more</p>
            </div>
          ) : filteredJobs.length === 0 && !loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No jobs found. Complete onboarding or refresh.</p>
              <Button variant="hero" onClick={fetchJobs}>Search Jobs</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.sort((a, b) => b.matchScore - a.matchScore).map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-dreamer p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-heading text-base">{job.title}</h3>
                        {job.matchScore >= 85 && (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            🔥 HOT
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        job.matchScore >= 85 ? "text-primary" : job.matchScore >= 70 ? "text-success" : "text-muted-foreground"
                      }`}>
                        {job.matchScore}%
                      </div>
                      <span className="text-xs text-muted-foreground">match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.workMode}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salaryRange}</span>
                    <span className="text-xs">{job.postedAgo}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-xs text-muted-foreground">Matches:</span>
                    {job.matchedSkills.map((s) => (
                      <span key={s} className="bg-accent text-accent-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                        ✅ {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="hero"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(job.url, "_blank")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Apply Now
                    </Button>
                    <Button
                      variant={job.saved ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSave(job.id)}
                    >
                      <Heart className={`w-3.5 h-3.5 ${job.saved ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="hidden lg:block w-72 space-y-4">
          {/* Profile card */}
          <div className="card-dreamer p-5">
            <div className="flex items-center gap-3 mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.role_title || data.currentRole}</p>
                {profile?.preferred_country && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {profile.preferred_country}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card-dreamer p-5">
            <h4 className="text-heading text-sm flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              Your Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.slice(0, 10).map((skill) => (
                <span key={skill} className="text-foreground text-xs font-medium bg-accent px-2.5 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="card-dreamer p-5">
            <h4 className="text-heading text-sm flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              Searching For
            </h4>
            {data.careerPaths.slice(0, 5).map((p) => (
              <div key={p.role} className="flex items-center justify-between mb-2">
                <span className="text-foreground text-xs">{p.role}</span>
                <span className="text-primary text-xs font-bold">{p.match}%</span>
              </div>
            ))}
          </div>

          <div className="card-dreamer p-5">
            <h4 className="text-heading text-sm flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-primary" />
              Saved Jobs
            </h4>
            <p className="text-2xl font-bold text-foreground">{savedCount}</p>
            <p className="text-xs text-muted-foreground">jobs saved</p>
          </div>

          <WhatsAppWebhookCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
