import React, { createContext, useContext, useState, ReactNode } from "react";

export interface OnboardingData {
  currentRole: string;
  resumeFile: File | null;
  resumeParsed: {
    name: string;
    skills: string[];
    experience: string;
    education: string;
  } | null;
  confirmedSkills: string[];
  careerPaths: { role: string; match: number }[];
}

const defaultData: OnboardingData = {
  currentRole: "",
  resumeFile: null,
  resumeParsed: null,
  confirmedSkills: [],
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
