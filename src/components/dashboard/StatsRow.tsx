import React from "react";
import { Map, Globe, School, Users } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import StatsCard from "./StatsCard";
import { useNavigate } from "react-router-dom";

interface StatsRowProps {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
}

const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateToRegions = () => navigate("/regions");
  const navigateToSectors = () => navigate("/sectors");
  const navigateToSchools = () => navigate("/schools");
  const navigateToUsers = () => navigate("/users");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title={t("totalRegions")}
        value={stats.regions}
        icon={<Map className="h-5 w-5 text-blue-500" />}
        color="blue"
        onClick={navigateToRegions}
      />
      <StatsCard
        title={t("totalSectors")}
        value={stats.sectors}
        icon={<Globe className="h-5 w-5 text-purple-500" />}
        color="purple"
        onClick={navigateToSectors}
      />
      <StatsCard
        title={t("totalSchools")}
        value={stats.schools}
        icon={<School className="h-5 w-5 text-green-500" />}
        color="green"
        onClick={navigateToSchools}
      />
      <StatsCard
        title={t("totalUsers")}
        value={stats.users}
        icon={<Users className="h-5 w-5 text-amber-500" />}
        color="amber"
        onClick={navigateToUsers}
      />
    </div>
  );
};

export default StatsRow;
