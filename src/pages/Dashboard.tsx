import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Bell, Search, Heart, ExternalLink, MapPin, DollarSign,
  Briefcase, Filter, Star, TrendingUp, Settings,
} from "lucide-react";
import JobitterLogo from "@/components/JobitterLogo";

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
  saved: boolean;
}

const mockJobs: Job[] = [
  {
    id: "1", title: "Data Engineer", company: "TechCorp", location: "San Francisco, CA",
    workMode: "Remote", salaryRange: "$110k–$140k", matchScore: 92,
    matchedSkills: ["SQL", "Python"], postedAgo: "2h ago", saved: false,
  },
  {
    id: "2", title: "Senior Data Analyst", company: "FinanceAI", location: "New York, NY",
    workMode: "Hybrid", salaryRange: "$95k–$125k", matchScore: 88,
    matchedSkills: ["SQL", "Tableau", "Excel"], postedAgo: "5h ago", saved: true,
  },
  {
    id: "3", title: "BI Analyst", company: "RetailMax", location: "Austin, TX",
    workMode: "Remote", salaryRange: "$85k–$110k", matchScore: 85,
    matchedSkills: ["Tableau", "SQL"], postedAgo: "1d ago", saved: false,
  },
  {
    id: "4", title: "Business Analyst", company: "ConsultPro", location: "Chicago, IL",
    workMode: "On-site", salaryRange: "$80k–$105k", matchScore: 78,
    matchedSkills: ["Excel", "SQL"], postedAgo: "1d ago", saved: false,
  },
  {
    id: "5", title: "Data Scientist", company: "HealthTech", location: "Boston, MA",
    workMode: "Remote", salaryRange: "$120k–$155k", matchScore: 72,
    matchedSkills: ["Python"], postedAgo: "2d ago", saved: false,
  },
];

const Dashboard = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSave = (id: string) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, saved: !j.saved } : j)));

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const savedCount = jobs.filter((j) => j.saved).length;

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
                3
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">JD</span>
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
            <Button variant="outline" size="default">
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
          </div>

          {/* Job cards */}
          <div className="space-y-3">
            {filteredJobs.map((job, i) => (
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
                  <Button variant="hero" size="sm" className="flex-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    1-Click Apply
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
        </div>

        {/* Right panel */}
        <div className="hidden lg:block w-72 space-y-4">
          <div className="card-dreamer p-5">
            <h4 className="text-heading text-sm flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              Skills Match
            </h4>
            {["SQL", "Python", "Tableau", "Excel", "Data Modeling"].map((skill) => {
              const pct = Math.floor(Math.random() * 30 + 70);
              return (
                <div key={skill} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{skill}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card-dreamer p-5">
            <h4 className="text-heading text-sm flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-primary" />
              Saved Jobs
            </h4>
            <p className="text-2xl font-bold text-foreground">{savedCount}</p>
            <p className="text-xs text-muted-foreground">jobs saved</p>
          </div>

          <div className="card-dreamer p-5 border-primary/20 bg-accent/50">
            <h4 className="text-heading text-sm mb-2">💰 Go Pro</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Unlimited alerts, WhatsApp notifications, priority matches.
            </p>
            <Button variant="hero" size="sm" className="w-full">
              $19/month
            </Button>
          </div>

          <div className="card-dreamer p-5">
            <h4 className="text-heading text-sm flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Notifications
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { label: "In-app", on: true },
                { label: "Email", on: true },
                { label: "WhatsApp", on: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between">
                  <span className="text-foreground">{n.label}</span>
                  <div className={`w-8 h-4.5 rounded-full relative cursor-pointer transition-colors ${
                    n.on ? "bg-primary" : "bg-secondary"
                  }`}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-card shadow transition-transform ${
                      n.on ? "left-[calc(100%-16px)]" : "left-0.5"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
