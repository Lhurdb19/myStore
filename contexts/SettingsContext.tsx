"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

interface Settings {
  siteName: string;
  logo: string;
  emailServer: {
    host: string;
    port: number;
    user: string;
  };
  security: {
    enable2FA: boolean;
    sessionTimeout: number;
  };
}


interface SettingsContextType {
  settings: Settings | null;
  updateSettings: (newSettings: Settings) => void;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admins/settings");
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch {
      toast.error("Failed to fetch settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = (newSettings: Settings) => setSettings(newSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
