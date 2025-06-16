import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";

const AppearanceSettings: React.FC = () => {
  const { t } = useTranslation();

  const [theme, setTheme] = React.useState("system");
  const [density, setDensity] = React.useState("default");
  const [animations, setAnimations] = React.useState(true);

  const saveSettings = () => {
    // In a real app, you would call an API to save these settings
    toast.success(t("appearanceSettingsSaved"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("appearanceSettings")}</CardTitle>
        <CardDescription>{t("appearanceSettingsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("theme")}</h3>

          <div className="flex items-center space-x-4">
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(value) => value && setTheme(value)}
            >
              <ToggleGroupItem value="light" aria-label="Light">
                <Sun className="h-4 w-4 mr-2" />
                {t("light")}
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark">
                <Moon className="h-4 w-4 mr-2" />
                {t("dark")}
              </ToggleGroupItem>
              <ToggleGroupItem value="system" aria-label="System">
                <Monitor className="h-4 w-4 mr-2" />
                {t("system")}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("density")}</h3>

          <RadioGroup value={density} onValueChange={setDensity}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact">{t("compact")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default">{t("default")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable">{t("comfortable")}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("animations")}</h3>

          <RadioGroup
            value={animations ? "enabled" : "disabled"}
            onValueChange={(v) => setAnimations(v === "enabled")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enabled" id="animations-on" />
              <Label htmlFor="animations-on">{t("enabled")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="animations-off" />
              <Label htmlFor="animations-off">{t("disabled")}</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveSettings}>{t("saveAppearanceSettings")}</Button>
      </CardFooter>
    </Card>
  );
};

export default AppearanceSettings;
