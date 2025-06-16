import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, User } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  accessCount: number;
}

interface LinkListForSchoolsProps {
  schoolId: string;
  links?: Link[];
  isLoading?: boolean;
  onLinkClick?: (link: Link) => void;
}

export const LinkListForSchools: React.FC<LinkListForSchoolsProps> = ({
  schoolId,
  links = [],
  isLoading = false,
  onLinkClick,
}) => {
  const { t } = useTranslation();

  const handleLinkClick = (link: Link) => {
    // Track link access
    onLinkClick?.(link);

    // Open link in new tab
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800",
      education: "bg-blue-100 text-blue-800",
      forms: "bg-green-100 text-green-800",
      reports: "bg-purple-100 text-purple-800",
      resources: "bg-orange-100 text-orange-800",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: t("Ümumi"),
      education: t("Təhsil"),
      forms: t("Formlar"),
      reports: t("Hesabatlar"),
      resources: t("Resurslar"),
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Paylaşılan Linklər")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!links.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Paylaşılan Linklər")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("Hələ heç bir link paylaşılmayıb")}</p>
            <p className="text-sm mt-2">
              {t("Admin tərəfindən paylaşılan linklər burada görünəcək")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t("Paylaşılan Linklər")}
          <Badge variant="secondary">{links.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-base">{link.title}</h3>
                    <Badge className={getCategoryColor(link.category)}>
                      {getCategoryLabel(link.category)}
                    </Badge>
                    {!link.isActive && (
                      <Badge variant="secondary">{t("Deaktiv")}</Badge>
                    )}
                  </div>

                  {link.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {link.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {link.createdBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(link.createdAt).toLocaleDateString("az")}
                    </div>
                    <div className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {link.accessCount} {t("dəfə açılıb")}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkClick(link)}
                  disabled={!link.isActive}
                  className="ml-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("Aç")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkListForSchools;
