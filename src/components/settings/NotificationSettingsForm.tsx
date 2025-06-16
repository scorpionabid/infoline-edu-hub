import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { NotificationSettings } from "@/types/auth";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/auth/useAuthStore";

interface NotificationSettingsFormProps {
  initialSettings: NotificationSettings;
  onSave: (settings: NotificationSettings) => Promise<void>;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  initialSettings,
  onSave,
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] =
    useState<NotificationSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (field: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        const updatedPreferences = {
          ...user.preferences,
          notificationSettings: settings,
        };

        await updateProfile({ preferences: updatedPreferences });
        toast.success(t("notificationSettingsSaved"));
      } else {
        toast.error(t("userNotFound"));
      }
    } catch (error: any) {
      console.error("Error saving notification settings:", error);
      toast.error(t("notificationSettingsSaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notificationSettings")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">{t("emailNotifications")}</Label>
            <Switch
              id="email"
              checked={settings.email}
              onCheckedChange={(checked) => handleChange("email", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push">{t("pushNotifications")}</Label>
            <Switch
              id="push"
              checked={settings.push}
              onCheckedChange={(checked) => handleChange("push", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="inApp">{t("inAppNotifications")}</Label>
            <Switch
              id="inApp"
              checked={settings.inApp}
              onCheckedChange={(checked) => handleChange("inApp", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="system">{t("systemNotifications")}</Label>
            <Switch
              id="system"
              checked={settings.system}
              onCheckedChange={(checked) => handleChange("system", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="deadline">{t("deadlineNotifications")}</Label>
            <Switch
              id="deadline"
              checked={settings.deadline}
              onCheckedChange={(checked) => handleChange("deadline", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms">{t("smsNotifications")}</Label>
            <Switch
              id="sms"
              checked={settings.sms}
              onCheckedChange={(checked) => handleChange("sms", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="deadlineReminders">{t("deadlineReminders")}</Label>
            <Switch
              id="deadlineReminders"
              checked={settings.deadlineReminders}
              onCheckedChange={(checked) =>
                handleChange("deadlineReminders", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="statusUpdates">{t("statusUpdates")}</Label>
            <Switch
              id="statusUpdates"
              checked={settings.statusUpdates}
              onCheckedChange={(checked) =>
                handleChange("statusUpdates", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weeklyReports">{t("weeklyReports")}</Label>
            <Switch
              id="weeklyReports"
              checked={settings.weeklyReports}
              onCheckedChange={(checked) =>
                handleChange("weeklyReports", checked)
              }
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsForm;
