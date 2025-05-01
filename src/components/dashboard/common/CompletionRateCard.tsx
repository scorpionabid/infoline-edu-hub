
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CompletionRateCardProps } from '@/types/dashboard';

export function CompletionRateCard({ 
  completionRate, 
  title 
}: CompletionRateCardProps) {
  // Progress color based on completion rate
  const getProgressColor = (rate: number) => {
    if (rate < 30) return 'bg-red-500';
    if (rate < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{completionRate}%</span>
          <span className="text-sm text-muted-foreground">
            {completionRate < 30 ? 'Zəif' : completionRate < 70 ? 'Orta' : 'Yaxşı'}
          </span>
        </div>
        <Progress
          value={completionRate}
          className={`h-2 ${getProgressColor(completionRate)}`}
        />
      </CardContent>
    </Card>
  );
}
