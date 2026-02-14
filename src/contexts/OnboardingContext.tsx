import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  experience: string;
  education: string;
  skills: string[];
  summary: string;
}

export interface CareerPath {
  role: string;
  match: number;
  reason?: string;
}

export interface OnboardingData {
  currentRole: string;
  resumeFile: File | null;
  resumeProfile: ResumeProfile | null;
  careerPaths: CareerPath[];
}

const defaultData: OnboardingData = {
  currentRole: "",
  resumeFile: null,
  resumeProfile: null,
  careerPaths: [],
};

const OnboardingContext = createContext<{
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
}>({ data: defaultData, update: () => {} });

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const update = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }));
  return (
    <OnboardingContext.Provider value={{ data, update }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
