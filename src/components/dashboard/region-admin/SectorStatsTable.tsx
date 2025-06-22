import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart } from "lucide-react";
import { SectorStat } from "@/types/dashboard";
import { useTranslation } from "@/contexts/TranslationContext";
import { useNavigate } from "react-router-dom";

interface SectorStatsTableProps {
  sectors: SectorStat[];
  showActions?: boolean;
}

const SectorStatsTable: React.FC<SectorStatsTableProps> = ({
  sectors,
  showActions = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Sort sectors by completion rate in descending order
  const sortedSectors = [...sectors].sort((a, b) => {
    const completionA =
      a.completionRate ?? a.completion_rate ?? a.completion ?? 0;
    const completionB =
      b.completionRate ?? b.completion_rate ?? b.completion ?? 0;
    return completionB - completionA;
  });

  const handleViewSector = (sectorId: string) => {
    navigate(`/sectors/${sectorId}`);
  };

  if (!sectors || sectors.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        {t("noSectorsFound")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("dashboard.sectorLabel")}</TableHead>
            <TableHead className="text-right">{t("dashboard.tableProgress")}</TableHead>
            <TableHead className="text-center">{t("common.schoolCount")}</TableHead>
            {showActions && (
              <TableHead className="text-right">{t("dashboard.actionsLabel")}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSectors.map((sector) => {
            const completionRate =
              sector.completionRate ??
              sector.completion_rate ??
              sector.completion ??
              0;

            return (
              <TableRow key={sector.id}>
                <TableCell className="font-medium">{sector.name}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Progress
                      value={completionRate}
                      className="h-2"
                      indicatorClassName={
                        completionRate < 30
                          ? "bg-red-500"
                          : completionRate < 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }
                    />
                    <span className="text-sm tabular-nums w-10">
                      {`${Math.round(completionRate)}%`}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {sector.schoolCount || sector.totalSchools}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewSector(sector.id)}
                    >
                      <BarChart className="mr-2 h-4 w-4" />
                      {t("common.view")}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SectorStatsTable;
