import React from "react";
import { FileBarChart, Clock, Calendar } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

interface ActivityTabProps {
  activityData: Array<{
    name: string;
    value: number;
  }>;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ activityData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateToReports = () => navigate("/reports");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("systemActivity")}</CardTitle>
        <CardDescription>Sistem aktivliyi statistikası</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activityData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Son 7 ay üzrə məlumat aktivliyi
        </div>
        <Button variant="outline" size="sm" onClick={navigateToReports}>
          <FileBarChart className="mr-2 h-4 w-4" />
          Ətraflı hesabatlar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActivityTab;
