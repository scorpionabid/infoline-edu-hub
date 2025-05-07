
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { FullUserData } from "@/types/user";
import { useAuth } from "@/context/auth";
import { Language } from "@/types/language";

export function PreferencesForm() {
  const { t, changeLanguage, language } = useLanguage();
  const { toast } = useToast();
  const { user, updateUserProfile } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  
  const [emailNotifications, setEmailNotifications] = useState(
    user?.notificationSettings?.email ?? true
  );
  
  const [inAppNotifications, setInAppNotifications] = useState(
    user?.notificationSettings?.inApp ?? true
  );
  
  const [pushNotifications, setPushNotifications] = useState(
    user?.notificationSettings?.push ?? true
  );
  
  const [systemNotifications, setSystemNotifications] = useState(
    user?.notificationSettings?.system ?? true
  );
  
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    user?.language || language || "az"
  );

  const handleSavePreferences = async () => {
    if (!user || !updateUserProfile) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile({
        id: user.id,
        language: currentLanguage as Language,
        notificationSettings: {
          email: emailNotifications,
          inApp: inAppNotifications,
          push: pushNotifications,
          system: systemNotifications,
          deadline: true
        }
      });
      
      // Update UI language
      changeLanguage(currentLanguage as Language);
      
      toast({
        title: t("preferencesUpdated"),
        description: t("yourPreferencesHaveBeenUpdated"),
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: t("error"),
        description: t("errorUpdatingPreferences"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("preferences")}</CardTitle>
        <CardDescription>
          {t("manageYourApplicationPreferences")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("notifications")}</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-1">
                {t("emailNotifications")}
                <p className="text-sm text-muted-foreground">
                  {t("receiveEmailNotifications")}
                </p>
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="app-notifications" className="flex-1">
                {t("inAppNotifications")}
                <p className="text-sm text-muted-foreground">
                  {t("receiveInAppNotifications")}
                </p>
              </Label>
              <Switch
                id="app-notifications"
                checked={inAppNotifications}
                onCheckedChange={setInAppNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex-1">
                {t("pushNotifications")}
                <p className="text-sm text-muted-foreground">
                  {t("receivePushNotifications")}
                </p>
              </Label>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="system-notifications" className="flex-1">
                {t("systemNotifications")}
                <p className="text-sm text-muted-foreground">
                  {t("receiveSystemNotifications")}
                </p>
              </Label>
              <Switch
                id="system-notifications"
                checked={systemNotifications}
                onCheckedChange={setSystemNotifications}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("language")}</h3>
          <div className="grid gap-3">
            <Label htmlFor="language">{t("selectLanguage")}</Label>
            <Select
              value={currentLanguage}
              onValueChange={setCurrentLanguage}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">{t("azerbaijani")}</SelectItem>
                <SelectItem value="en">{t("english")}</SelectItem>
                <SelectItem value="ru">{t("russian")}</SelectItem>
                <SelectItem value="tr">{t("turkish")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="ml-auto"
        >
          {isSaving ? t("saving") : t("saveChanges")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PreferencesForm;
