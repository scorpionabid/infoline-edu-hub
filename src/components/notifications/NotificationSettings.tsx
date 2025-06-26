import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";

export const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    email: true,
    push: true,
    inApp: true,
    system: true,
    deadline: true,
    statusUpdates: true,
    weeklyReports: false,
    realTime: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: t("settingsSaved"),
        description: t("notificationSettingsUpdated"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failedToSaveSettings"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* General Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("generalSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t("emailNotifications")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("receiveEmailNotifications")}
              </p>
            </div>
            <Switch
              checked={settings.email}
              onCheckedChange={() => handleToggle("email")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t("pushNotifications")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("receivePushNotifications")}
              </p>
            </div>
            <Switch
              checked={settings.push}
              onCheckedChange={() => handleToggle("push")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t("inAppNotifications")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("showInAppNotifications")}
              </p>
            </div>
            <Switch
              checked={settings.inApp}
              onCheckedChange={() => handleToggle("inApp")}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("systemNotifications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t("deadlineReminders")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("notifyBeforeDeadlines")}
              </p>
            </div>
            <Switch
              checked={settings.deadline}
              onCheckedChange={() => handleToggle("deadline")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t("statusUpdates")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("notifyOnStatusChanges")}
              </p>
            </div>
            <Switch
              checked={settings.statusUpdates}
              onCheckedChange={() => handleToggle("statusUpdates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">
                  {t("realTimeUpdates")}
                </Label>
                <Badge variant="secondary" className="text-xs">
                  // Live
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("instantNotifications")}
              </p>
            </div>
            <Switch
              checked={settings.realTime}
              onCheckedChange={() => handleToggle("realTime")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("reports")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t("weeklyReports")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("receiveWeeklyDigest")}
              </p>
            </div>
            <Switch
              checked={settings.weeklyReports}
              onCheckedChange={() => handleToggle("weeklyReports")}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? t("saving") : t("saveSettings")}
      </Button>
    </div>
  );
};

export default NotificationSettings;
