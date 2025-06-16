import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Bell, Lock, Palette, Users, Globe } from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import NotificationSettings from "./NotificationSettings";
import SecuritySettings from "./SecuritySettings";
import AppearanceSettings from "./AppearanceSettings";
import TeamSettings from "./TeamSettings";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Supported languages with their display names and flags
const LANGUAGES = {
  en: { nativeName: 'English', flag: '🇬🇧' },
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
} as const;

type LanguageCode = keyof typeof LANGUAGES;

const SettingsTabs: React.FC = () => {
  const { t, language = 'az', setLanguage } = useTranslation?.() || {};
  const availableLanguages = Object.keys(LANGUAGES) as LanguageCode[];

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {t("settings.profile")}
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {t("settings.notifications")}
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          {t("settings.security")}
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          {t("settings.appearance")}
        </TabsTrigger>
        <TabsTrigger value="language" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {t("settings.language")}
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t("settings.team")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>

      <TabsContent value="language">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
            <CardDescription>
              {t("settings.languageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("common.selectLanguage")}
              </label>
              <Select 
                value={language} 
                onValueChange={(value) => setLanguage?.(value as LanguageCode)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t?.('settings.selectLanguage') || 'Select Language'} />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => {
                    const langInfo = LANGUAGES[lang as LanguageCode];
                    return (
                      <SelectItem key={lang} value={lang}>
                        <div className="flex items-center gap-2">
                          <span>{langInfo.flag}</span>
                          <span>{langInfo.nativeName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team">
        <TeamSettings />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
