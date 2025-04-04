
import React from 'react';
import CompletionRateCard from './CompletionRateCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { 
  BarChart3, 
  Users, 
  CalendarDays, 
  FileCheck, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface StatusCardsProps {
  completionRate: number;
  pendingApprovals: number;
  additionalStats?: {
    activeUsers?: number;
    upcomingDeadlines?: number;
    recentSubmissions?: number;
    dataQualityIssues?: number;
  };
}

const StatusCards: React.FC<StatusCardsProps> = ({ 
  completionRate, 
  pendingApprovals,
  additionalStats = {} 
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const { 
    activeUsers = 0, 
    upcomingDeadlines = 0, 
    recentSubmissions = 0,
    dataQualityIssues = 0
  } = additionalStats;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <CompletionRateCard completionRate={completionRate} />
      <PendingApprovalsCard pendingApprovals={pendingApprovals} />
      
      {/* Aktiv istifadəçilər kartı */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            {t('activeUsers')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            {t('activeUsersToday')}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-xs text-blue-500 dark:text-blue-400"
            onClick={() => navigate('/users')}
          >
            {t('viewAllUsers')}
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      {/* Son müddətlər kartı */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            {t('upcomingDeadlines')}
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingDeadlines}</div>
          <p className="text-xs text-muted-foreground">
            {t('deadlinesNext7Days')}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-xs text-blue-500 dark:text-blue-400"
            onClick={() => navigate('/categories')}
          >
            {t('viewDeadlines')}
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      {/* Son təqdim edilmiş məlumatlar kartı */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            {t('recentSubmissions')}
          </CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentSubmissions}</div>
          <p className="text-xs text-muted-foreground">
            {t('submissionsLast24Hours')}
          </p>
          
          <div className="mt-4 h-[60px]">
            <BarChart3 className="h-full w-full text-muted-foreground/50" />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-xs text-blue-500 dark:text-blue-400"
            onClick={() => navigate('/reports')}
          >
            {t('viewAllSubmissions')}
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      {/* Məlumat keyfiyyəti problemləri kartı */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            {t('dataQualityIssues')}
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dataQualityIssues}</div>
          <p className="text-xs text-muted-foreground">
            {t('activeIssuesRequiringAttention')}
          </p>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{t('missingValues')}</span>
              <span className="font-medium">{Math.floor(dataQualityIssues * 0.6)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            
            <div className="flex items-center justify-between text-xs my-1">
              <span className="text-muted-foreground">{t('outliers')}</span>
              <span className="font-medium">{Math.floor(dataQualityIssues * 0.25)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">{t('inconsistencies')}</span>
              <span className="font-medium">{Math.floor(dataQualityIssues * 0.15)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-xs text-blue-500 dark:text-blue-400"
            onClick={() => navigate('/reports?tab=quality')}
          >
            {t('viewAllIssues')}
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StatusCards;
