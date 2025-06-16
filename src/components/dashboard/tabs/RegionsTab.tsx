import React from "react";
import { Map } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

interface RegionsTabProps {
  regionSchoolsData: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const RegionsTab: React.FC<RegionsTabProps> = ({ regionSchoolsData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateToRegions = () => navigate("/regions");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Bölgələr üzrə məktəb paylanması
        </CardTitle>
        <CardDescription>Hər bölgə üzrə məktəb sayı</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={regionSchoolsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {regionSchoolsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={navigateToRegions}>
          <Map className="mr-2 h-4 w-4" />
          Bütün bölgələri göstər
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RegionsTab;
