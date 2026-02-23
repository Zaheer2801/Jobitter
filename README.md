# Jobitter — AI-Powered Job Discovery Platform

![Jobitter](https://img.shields.io/badge/Jobitter-Job%20Discovery-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss)

## 🚀 About Jobitter

**Jobitter** is a modern, AI-powered job discovery and career guidance platform designed to help job seekers find relevant opportunities effortlessly. It features a personalized onboarding experience, dynamic theming, resume parsing, career path recommendations, and real-time job alerts — all wrapped in a sleek, animated interface.

## ✨ Key Features

### 🎯 Personalized Onboarding
- **Name & Color Theme** — Enter your name and pick a favorite color that dynamically themes the entire app (9 vibrant color options).
- **Role Selection** — Choose your desired job role to tailor job recommendations.
- **Resume Upload & Parsing** — Upload your resume (PDF) and our backend automatically extracts your skills, summary, and experience.
- **Career Path Discovery** — AI-generated career path suggestions based on your profile and skills.

### 📊 Smart Dashboard
- **Profile Overview** — View your parsed profile with skills, role title, and summary at a glance.
- **Job Alerts** — Get matched with relevant job listings scraped from real job boards.
- **WhatsApp Notifications (Premium)** — Premium users can set up WhatsApp webhook alerts for new job matches.
- **Dynamic Theming** — Your chosen color theme persists across the entire app session.

### 🔐 Authentication
- **Google OAuth** — One-click sign-in with Google for a seamless experience.
- **Email/Password** — Traditional signup and login with email verification.
- **Role-Based Access** — Premium features are gated behind a premium user role system.

### 🎨 Design & UX
- **Animated Transitions** — Smooth page transitions and micro-interactions powered by Framer Motion.
- **Aurora Background** — Beautiful animated gradient background on the landing page.
- **Split Text Animations** — Eye-catching text reveal animations throughout the onboarding flow.
- **Dark/Light Mode** — Full theme support with semantic design tokens.
- **Mobile Responsive** — Works across desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Animations** | Framer Motion |
| **State Management** | React Context, TanStack React Query |
| **Backend** | Lovable Cloud (Supabase) |
| **Authentication** | Google OAuth, Email/Password |
| **Database** | PostgreSQL with Row Level Security |
| **Edge Functions** | Deno (resume parsing, job scraping, alerts) |
| **Routing** | React Router v6 |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── AnimatedText.tsx  # Text animation component
│   ├── BubbleMenu.tsx    # Floating bubble navigation
│   ├── JobitterLogo.tsx  # Brand logo component
│   ├── OnboardingShell.tsx # Onboarding layout wrapper
│   ├── PageTransition.tsx  # Route transition animations
│   ├── Prism.tsx         # 3D prism visual effect
│   └── ThemeToggle.tsx   # Dark/light mode toggle
├── contexts/            # React context providers
│   └── OnboardingContext.tsx  # Onboarding state management
├── hooks/               # Custom React hooks
│   ├── useAuth.ts        # Authentication logic
│   ├── useColorTheme.ts  # Dynamic color theming
│   └── use-mobile.tsx    # Mobile detection
├── pages/               # Route pages
│   ├── Index.tsx          # Landing page
│   ├── Auth.tsx           # Login/Signup
│   ├── Dashboard.tsx      # Main dashboard
│   ├── OnboardingName.tsx # Name + color selection
│   ├── OnboardingRole.tsx # Role selection
│   ├── OnboardingResume.tsx # Resume upload
│   └── OnboardingPaths.tsx  # Career path results
├── integrations/        # External service integrations
│   └── supabase/         # Database client & types
└── lib/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or bun package manager

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

The following environment variables are required (auto-configured in Lovable Cloud):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |

## 🔒 Security

- **Row Level Security (RLS)** enabled on all database tables
- **User data isolation** — users can only access their own profiles and settings
- **Secure OAuth flow** with proper redirect handling
- **Premium feature gating** via database role checks

## 📱 Screenshots

### Landing Page
> Animated hero with the Jobitter logo, "Start" CTA, and a "How it works" breakdown.

![Landing Page](https://jobitter.lovable.app/)

🔗 **[View Live →](https://jobitter.lovable.app/)**

### Onboarding Flow
> Step-by-step guided onboarding: Name + Color Theme → Role → Resume Upload → Career Paths.

| Step | Description |
|------|-------------|
| 1. Name & Color | Enter your name and pick a favorite color to theme the app |
| 2. Role | Select your desired job role |
| 3. Resume | Upload your PDF resume for AI parsing |
| 4. Career Paths | View AI-generated career recommendations |

🔗 **[Try Onboarding →](https://jobitter.lovable.app/onboarding/name)**

### Dashboard & Auth
> Sign in with Google to access your personalized dashboard with profile, job alerts, and premium features.

🔗 **[View Dashboard →](https://jobitter.lovable.app/dashboard)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using [Lovable](https://lovable.dev)
