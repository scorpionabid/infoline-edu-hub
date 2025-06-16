import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { DeadlineItem } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, ArrowRightIcon } from "lucide-react";

interface UpcomingDeadlinesListProps {
  deadlines: DeadlineItem[];
  onOpenDeadline?: (deadlineId: string) => void;
}

const UpcomingDeadlinesList: React.FC<UpcomingDeadlinesListProps> = ({
  deadlines,
  onOpenDeadline,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleOpenDeadline = (id: string) => {
    if (onOpenDeadline) {
      onOpenDeadline(id);
    } else {
      navigate(`/categories/${id}`);
    }
  };

  if (!deadlines || deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("upcomingDeadlines")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>{t("noUpcomingDeadlines")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("upcomingDeadlines")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
            >
              <div>
                <h4 className="font-medium">{item.title || item.name}</h4>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.deadline}
                </div>
                {item.daysLeft !== undefined && (
                  <div className="flex items-center text-xs text-amber-600 font-medium">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.daysLeft} {t("daysLeft")}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDeadline(item.id)}
              >
                <ArrowRightIcon className="h-4 w-4 mr-1" />
                {t("open")}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlinesList;
