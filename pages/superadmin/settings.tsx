"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Monitor, Mail, Bell, Shield } from "lucide-react";

interface Settings {
  siteName: string;
  logo: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  notificationsEnabled: boolean;
  sessionTimeout: number;
  enable2FA: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: "",
    logo: "",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    notificationsEnabled: true,
    sessionTimeout: 30,
    enable2FA: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    let logoUrl = settings.logo;

    if (logoFile) {
      const formData = new FormData();
      formData.append("logo", logoFile);
      try {
        const res = await fetch("/api/admins/upload-logo", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) logoUrl = data.url;
        else {
          toast.error(data.message || "Failed to upload logo");
          setLoading(false);
          return;
        }
      } catch {
        toast.error("Logo upload failed");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admins/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, logo: logoUrl }),
      });
      const data = await res.json();
      if (data.success) toast.success("Settings updated successfully!");
      else toast.error(data.message || "Failed to save settings");
    } catch {
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const sectionClasses =
    "flex items-center space-x-2 font-semibold cursor-pointer text-lg mb-2 text-gray-900 dark:text-white";

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-gray-900 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white text-center">
        System Settings
      </h1>

      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 space-y-4">

        {/* --- Site Info --- */}
        <details className="border-b border-gray-200 dark:border-gray-700 pb-2" open>
          <summary className={sectionClasses}>
            <Monitor className="w-7 h-7 pr-2" /> Site Info
          </summary>
          <div className="space-y-4 mt-2">
            <div className="flex flex-col space-y-2">
              <Label>Site Name</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Enter your site name"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  Choose File
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {logoFile ? logoFile.name : settings.logo ? "Current Logo" : "No file chosen"}
                </span>
              </div>
              {(logoFile || settings.logo) && (
                <img
                  src={logoFile ? URL.createObjectURL(logoFile) : settings.logo}
                  alt="Logo Preview"
                  className="mt-2 w-32 h-32 object-contain rounded border border-gray-300 dark:border-gray-600"
                />
              )}
            </div>
          </div>
        </details>

        {/* --- Email / SMTP --- */}
        <details className="border-b border-gray-200 dark:border-gray-700 pb-2">
          <summary className={sectionClasses}>
            <Mail className="w-7 h-7 pr-2" /> Email / SMTP Settings
          </summary>
          <div className="space-y-4 mt-2">
            <Label>SMTP Host</Label>
            <Input
              value={settings.smtpHost}
              onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
              placeholder="smtp.example.com"
            />
            <Label>SMTP Port</Label>
            <Input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
              placeholder="587"
            />
            <Label>SMTP Username</Label>
            <Input
              value={settings.smtpUser}
              onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
              placeholder="user@example.com"
            />
            <Label>SMTP Password</Label>
            <Input
              type="password"
              value={settings.smtpPass}
              onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
              placeholder="Password"
            />
          </div>
        </details>

        {/* --- Notifications --- */}
        <details className="border-b border-gray-200 dark:border-gray-700 pb-2">
          <summary className={sectionClasses}>
            <Bell className="w-7 h-7 pr-2" /> Notifications
          </summary>
          <div className="mt-2 flex items-center justify-between">
            <Label>Enable Notifications</Label>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
            />
          </div>
        </details>

        {/* --- Security --- */}
        <details className="pb-2">
          <summary className={sectionClasses}>
            <Shield className="w-7 h-7 pr-2" /> Security
          </summary>
          <div className="space-y-4 mt-2">
            <Label>Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
            />
            <div className="flex items-center justify-between">
              <Label>Enable 2FA</Label>
              <Switch
                checked={settings.enable2FA}
                onCheckedChange={(checked) => setSettings({ ...settings, enable2FA: checked })}
              />
            </div>
          </div>
        </details>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
