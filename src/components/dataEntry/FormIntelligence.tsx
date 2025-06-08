import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target,
  Users,
  CheckCircle,
  AlertTriangle,
  Zap,
  Award
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormIntelligenceProps {
  categoryName: string;
  completionPercentage: number;
  timeSpent: number; // minutes
  errorsCount: number;
  fieldsCompleted: number;
  totalFields: number;
  onOptimize?: () => void;
}

export const FormIntelligence: React.FC<FormIntelligenceProps> = ({
  categoryName,
  completionPercentage,
  timeSpent,
  errorsCount,
  fieldsCompleted,
  totalFields,
  onOptimize
}) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [performanceLevel, setPerformanceLevel] = useState<'excellent' | 'good' | 'average' | 'needs-improvement'>('average');

  useEffect(() => {
    generateInsights();
    calculatePerformance();
  }, [completionPercentage, timeSpent, errorsCount, fieldsCompleted]);

  const generateInsights = () => {
    const newInsights: string[] = [];

    // Time-based insights
    if (timeSpent > 0) {
      const avgTimePerField = timeSpent / fieldsCompleted;
      if (avgTimePerField > 2) {
        newInsights.push('Hər sahə üçün çox vaxt sərf edirsiz. Kömək mətinlərini oxuyun.');
      } else if (avgTimePerField < 0.5) {
        newInsights.push('Çox sürətlə doldurursunuz. Məlumatları diqqətlə yoxlayın.');
      }
    }

    // Error-based insights
    if (errorsCount > 3) {
      newInsights.push('Çox xəta var. Validasiya mesajlarına diqqət edin.');
    } else if (errorsCount === 0 && fieldsCompleted > 5) {
      newInsights.push('Əla! Heç bir xətanız yoxdur. Davam edin!');
    }

    // Progress-based insights
    if (completionPercentage > 50 && completionPercentage < 75) {
      newInsights.push('Yaxşı irəliləyiş! Sadəcə bir neçə sahə qalıb.');
    }

    // Completion insights
    if (completionPercentage >= 75) {
      newInsights.push('Az qaldı! Bütün sahələri tamamlayıb göndərə bilərsiniz.');
    }

    setInsights(newInsights);
  };

  const calculatePerformance = () => {
    let score = 0;

    // Completion weight (40%)
    score += (completionPercentage / 100) * 40;

    // Speed weight (30%) - inverse relationship with time per field
    if (fieldsCompleted > 0) {
      const avgTimePerField = timeSpent / fieldsCompleted;
      const speedScore = Math.max(0, 30 - (avgTimePerField - 1) * 10);
      score += Math.min(speedScore, 30);
    }

    // Accuracy weight (30%) - inverse relationship with errors
    const accuracyScore = Math.max(0, 30 - errorsCount * 5);
    score += Math.min(accuracyScore, 30);

    if (score >= 85) setPerformanceLevel('excellent');
    else if (score >= 70) setPerformanceLevel('good');
    else if (score >= 50) setPerformanceLevel('average');
    else setPerformanceLevel('needs-improvement');
  };

  const getPerformanceConfig = () => {
    switch (performanceLevel) {
      case 'excellent':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: <Award className="h-4 w-4" />,
          title: 'Əla performans!',
          description: 'Çox yaxşı irəliləyiş göstərirsiz'
        };
      case 'good':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Yaxşı performans',
          description: 'Düzgün tempə davam edin'
        };
      case 'average':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: <Target className="h-4 w-4" />,
          title: 'Orta performans',
          description: 'Bir az daha diqqətli olun'
        };
      default:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Performansı artırın',
          description: 'Kömək panelindən istifadə edin'
        };
    }
  };

  const performanceConfig = getPerformanceConfig();

  const getEstimatedCompletion = () => {
    if (fieldsCompleted === 0 || timeSpent === 0) return null;
    
    const avgTimePerField = timeSpent / fieldsCompleted;
    const remainingFields = totalFields - fieldsCompleted;
    const estimatedMinutes = Math.ceil(remainingFields * avgTimePerField);
    
    return estimatedMinutes;
  };

  const estimatedTime = getEstimatedCompletion();

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          Ağıllı Kömək
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Status */}
        <div className={`p-3 rounded-lg ${performanceConfig.bgColor}`}>
          <div className={`flex items-center gap-2 ${performanceConfig.color} mb-2`}>
            {performanceConfig.icon}
            <span className="font-medium">{performanceConfig.title}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {performanceConfig.description}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium">Vaxt</span>
            </div>
            <div className="text-sm font-bold">{timeSpent.toFixed(1)} dəq</div>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs font-medium">Tamamlandı</span>
            </div>
            <div className="text-sm font-bold">{fieldsCompleted}/{totalFields}</div>
          </div>
        </div>

        {/* Time Estimation */}
        {estimatedTime && estimatedTime > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm">Təxmini tamamlanma vaxtı:</span>
                <Badge variant="outline">{estimatedTime} dəqiqə</Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Dynamic Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Tövsiyələr
            </h4>
            {insights.map((insight, index) => (
              <Alert key={index} className="py-2">
                <AlertDescription className="text-xs">
                  {insight}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Optimization Button */}
        {onOptimize && performanceLevel !== 'excellent' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOptimize}
            className="w-full"
          >
            <Brain className="h-3 w-3 mr-2" />
            Performansı artır
          </Button>
        )}

        {/* Motivation */}
        {completionPercentage >= 90 && (
          <Alert className="border-green-200 bg-green-50">
            <Award className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Təbriklər!</strong> Demək olar ki, tamamladınız! 🎉
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default FormIntelligence;
