import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Edit } from "lucide-react";
import { CategoryCardProps } from "../types";

export const CategoryCard: React.FC<CategoryCardProps> = React.memo(({ category, stats, onSelect }) => {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-l-4"
      style={{
        borderLeftColor: stats?.completionPercentage === 100 ? '#16a34a' : 
                        stats?.completionPercentage > 0 ? '#eab308' : '#e5e7eb'
      }}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          {stats?.completionPercentage === 100 ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : stats?.completionPercentage > 0 ? (
            <Clock className="h-5 w-5 text-yellow-600" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
          )}
        </div>
        {category.description && (
          <CardDescription className="text-sm">{category.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{stats?.completionPercentage || 0}%</span>
          </div>
          <Progress value={stats?.completionPercentage || 0} className="h-1.5" />
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{stats?.filledColumns || 0} / {stats?.totalColumns || 0} sahə</span>
          <span>{stats?.filledRequiredColumns || 0} / {stats?.requiredColumns || 0} məcburi</span>
        </div>

        <Button variant="ghost" size="sm" className="w-full">
          <Edit className="h-4 w-4 mr-2" />
          Redaktə et
        </Button>
      </CardContent>
    </Card>
  );
});

CategoryCard.displayName = 'CategoryCard';
