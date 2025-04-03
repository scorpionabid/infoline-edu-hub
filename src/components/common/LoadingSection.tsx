
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingSectionProps {
  title: string;
  description?: string;
}

const LoadingSection: React.FC<LoadingSectionProps> = ({
  title,
  description,
}) => {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Yüklənir...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {description || "Məlumatlar yüklənir..."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingSection;
