import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TeamSettings = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("teamSettings")}</CardTitle>
          <CardDescription>{t("manageTeamMembers")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("teamSettingsComingSoon")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSettings;
