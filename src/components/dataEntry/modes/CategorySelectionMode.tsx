import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Grid3X3 } from "lucide-react";
import { CategorySelectionModeProps } from "../types";
import { CategoryCard } from "../cards/CategoryCard";
import ExcelIntegrationPanel from "@/components/dataEntry/enhanced/ExcelIntegrationPanel";

export const CategorySelectionMode: React.FC<CategorySelectionModeProps> = React.memo(({
  categories,
  completionStats,
  onCategorySelect,
  onExcelImport
}) => {
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Ümumi Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ümumi Tamamlanma</span>
                <span>{completionStats.overallCompletion}%</span>
              </div>
              <Progress value={completionStats.overallCompletion} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {completionStats.totalCategories}
                </div>
                <div className="text-sm text-muted-foreground">Toplam</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {completionStats.completedCategories}
                </div>
                <div className="text-sm text-muted-foreground">Tamamlandı</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {completionStats.totalCategories - completionStats.completedCategories}
                </div>
                <div className="text-sm text-muted-foreground">Qalıb</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excel Integration */}
      <ExcelIntegrationPanel 
        category={null}
        data={[]}
        onImportComplete={onExcelImport}
      />

      <Separator />

      {/* Category Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Kateqoriyalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryStats = completionStats.categories.find(
              (stat: any) => stat.categoryId === category.id
            );
            
            return (
              <CategoryCard
                key={category.id}
                category={category}
                stats={categoryStats}
                onSelect={() => onCategorySelect(category)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

CategorySelectionMode.displayName = 'CategorySelectionMode';
