import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader2, Send, Edit, Eye } from "lucide-react";
import { ReviewSubmitModeProps } from "../types";

export const ReviewSubmitMode: React.FC<ReviewSubmitModeProps> = React.memo(({
  categories,
  formData,
  completionStats,
  isSubmitting,
  onBack,
  onSubmit,
  onEditCategory
}) => {
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Redaktəyə qayıt
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Təsdiq üçün göndər
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Məlumatların İcmalı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{completionStats.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Toplam kateqoriya</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{completionStats.completedCategories}</div>
              <div className="text-sm text-muted-foreground">Tamamlanmış</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{completionStats.overallCompletion}%</div>
              <div className="text-sm text-muted-foreground">Ümumi progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Review */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryStats = completionStats.categories.find(
            (stat: any) => stat.categoryId === category.id
          );
          
          const isComplete = categoryStats?.completionPercentage === 100;
          
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={isComplete ? "default" : "secondary"}>
                      {categoryStats?.completionPercentage || 0}%
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => onEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={categoryStats?.completionPercentage || 0} className="mb-2" />
                <div className="text-sm text-muted-foreground">
                  {categoryStats?.filledRequiredColumns || 0} / {categoryStats?.requiredColumns || 0} məcburi sahə doldurulub
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

ReviewSubmitMode.displayName = 'ReviewSubmitMode';
