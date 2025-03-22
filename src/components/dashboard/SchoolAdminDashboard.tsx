
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, FileClock, Filter, Calendar, ArrowUpDown, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SchoolAdminDashboardProps {
  data: {
    forms: {
      pending: number;
      approved: number;
      rejected: number;
      dueSoon: number;
      overdue: number;
    };
    completionRate: number;
    notifications: Notification[];
  };
}

// Demo üçün aktiv formlar
const activeForms = [
  {
    id: 'form1',
    title: 'Müəllim statistikası',
    dueDate: new Date(Date.now() + 86400000 * 3), // 3 gün sonra
    completionStatus: 75,
    category: 'Müəllim məlumatları',
    priority: 'high'
  },
  {
    id: 'form2',
    title: 'Şagird davamiyyəti',
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 gün sonra
    completionStatus: 40,
    category: 'Şagird məlumatları',
    priority: 'medium'
  },
  {
    id: 'form3',
    title: 'Məktəb infrastrukturu',
    dueDate: new Date(Date.now() + 86400000 * 5), // 5 gün sonra
    completionStatus: 10,
    category: 'İnfrastruktur',
    priority: 'low'
  },
  {
    id: 'form4',
    title: 'Tədris planı',
    dueDate: new Date(Date.now() + 86400000 * 1), // 1 gün sonra
    completionStatus: 90,
    category: 'Tədris',
    priority: 'high'
  },
  {
    id: 'form5',
    title: 'Xüsusi təhsil ehtiyacları',
    dueDate: new Date(Date.now() - 86400000 * 1), // 1 gün əvvəl (vaxtı keçmiş)
    completionStatus: 60,
    category: 'Şagird məlumatları',
    priority: 'high'
  }
];

const upcomingDeadlines = activeForms
  .filter(form => isBefore(new Date(), form.dueDate) && form.completionStatus < 100)
  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

const overdueItems = activeForms
  .filter(form => isAfter(new Date(), form.dueDate) && form.completionStatus < 100)
  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'completion'>('dueDate');
  const [activeTab, setActiveTab] = useState('active');
  
  const handleContinueForm = (formId: string, formTitle: string) => {
    toast.info(t('formContinue'), {
      description: `${formTitle} formasını doldurmağa davam edirsiniz.`
    });
  };
  
  const handleCompleteForm = (formId: string, formTitle: string) => {
    toast.success(t('formCompleted'), {
      description: `${formTitle} forması tamamlandı və təsdiq üçün göndərildi.`
    });
  };
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };
  
  const getDaysText = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} gün gecikmiş`;
    } else if (diffDays === 0) {
      return "Bugün";
    } else if (diffDays === 1) {
      return "Sabah";
    } else {
      return `${diffDays} gün qalıb`;
    }
  };
  
  // Filter forms based on search term
  const filteredForms = activeForms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort filtered forms
  const sortedForms = [...filteredForms].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return a.dueDate.getTime() - b.dueDate.getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    } else {
      return b.completionStatus - a.completionStatus;
    }
  });
  
  // Filtered forms for each tab
  const activeTabForms = sortedForms.filter(form => form.completionStatus < 100);
  const completedTabForms = sortedForms.filter(form => form.completionStatus === 100);
  const overdueTabForms = sortedForms.filter(form => isAfter(new Date(), form.dueDate) && form.completionStatus < 100);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatsCard 
          title={t('pendingForms')}
          value={data.forms.pending}
          icon={<FileText className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
        <StatsCard 
          title={t('approvedForms')}
          value={data.forms.approved}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('rejectedForms')}
          value={data.forms.rejected}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color="red"
        />
        <StatsCard 
          title={t('dueSoon')}
          value={data.forms.dueSoon}
          icon={<FileClock className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatsCard 
          title={t('overdue')}
          value={data.forms.overdue}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color={data.forms.overdue > 0 ? "red" : "green"}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionRateCard 
          completionRate={data.completionRate} 
          description={t('schoolDataSubmissionRate')}
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{t('deadlines')}</span>
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t('viewCalendar')}</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overdueItems.length > 0 && (
              <div>
                <h4 className="font-medium text-red-500 mb-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {t('overdue')}
                </h4>
                {overdueItems.slice(0, 2).map((item) => (
                  <div key={item.id} className="border-l-2 border-red-500 pl-3 py-1 mb-2">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-between">
                      <span>
                        {format(item.dueDate, 'dd.MM.yyyy')} · {getDaysText(item.dueDate)}
                      </span>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority === 'high' ? t('highPriority') : 
                         item.priority === 'medium' ? t('mediumPriority') : t('lowPriority')}
                      </Badge>
                    </div>
                  </div>
                ))}
                {overdueItems.length > 2 && (
                  <Button variant="ghost" size="sm" className="mt-1 text-muted-foreground">
                    + {overdueItems.length - 2} {t('moreOverdue')}
                  </Button>
                )}
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-blue-500 mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" /> {t('upcoming')}
              </h4>
              {upcomingDeadlines.slice(0, 3).map((item) => (
                <div key={item.id} className="border-l-2 border-blue-500 pl-3 py-1 mb-2">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-between">
                    <span>
                      {format(item.dueDate, 'dd.MM.yyyy')} · {getDaysText(item.dueDate)}
                    </span>
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority === 'high' ? t('highPriority') : 
                       item.priority === 'medium' ? t('mediumPriority') : t('lowPriority')}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingDeadlines.length > 3 && (
                <Button variant="ghost" size="sm" className="mt-1 text-muted-foreground">
                  + {upcomingDeadlines.length - 3} {t('moreUpcoming')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">{t('manageForms')}</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('searchForms')}
                  className="pl-8 w-[180px] sm:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" 
                onClick={() => setSortBy(sortBy === 'dueDate' ? 'priority' : sortBy === 'priority' ? 'completion' : 'dueDate')}
                title={t('sortBy')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title={t('filter')}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
              <TabsTrigger value="active">{t('active')}</TabsTrigger>
              <TabsTrigger value="overdue">{t('overdue')}</TabsTrigger>
              <TabsTrigger value="completed">{t('completed')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TabsContent value="active" className="space-y-4 mt-0">
              {activeTabForms.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('noActiveForms')}</p>
              ) : (
                activeTabForms.map((form) => (
                  <div key={form.id} className="border rounded-md p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{form.title}</h4>
                          <Badge variant="outline" className={getPriorityColor(form.priority)}>
                            {form.priority === 'high' ? t('highPriority') : 
                             form.priority === 'medium' ? t('mediumPriority') : t('lowPriority')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{form.category} | </span>
                          <span>{t('dueDate')}: {format(form.dueDate, 'dd.MM.yyyy')} | </span>
                          <span className={isAfter(new Date(), form.dueDate) ? "text-red-500 font-medium" : ""}>
                            {getDaysText(form.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Progress value={form.completionStatus} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{form.completionStatus}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end md:self-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContinueForm(form.id, form.title)}
                        >
                          {t('continue')}
                        </Button>
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={() => handleCompleteForm(form.id, form.title)}
                          disabled={form.completionStatus < 100}
                        >
                          {t('submit')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="overdue" className="space-y-4 mt-0">
              {overdueTabForms.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('noOverdueForms')}</p>
              ) : (
                overdueTabForms.map((form) => (
                  <div key={form.id} className="border border-red-200 bg-red-50 dark:bg-red-950/10 rounded-md p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{form.title}</h4>
                          <Badge variant="outline" className={getPriorityColor(form.priority)}>
                            {form.priority === 'high' ? t('highPriority') : 
                             form.priority === 'medium' ? t('mediumPriority') : t('lowPriority')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{form.category} | </span>
                          <span>{t('dueDate')}: {format(form.dueDate, 'dd.MM.yyyy')} | </span>
                          <span className="text-red-500 font-medium">
                            {getDaysText(form.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Progress value={form.completionStatus} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{form.completionStatus}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end md:self-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContinueForm(form.id, form.title)}
                        >
                          {t('continue')}
                        </Button>
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={() => handleCompleteForm(form.id, form.title)}
                          disabled={form.completionStatus < 100}
                        >
                          {t('submit')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4 mt-0">
              {completedTabForms.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('noCompletedForms')}</p>
              ) : (
                completedTabForms.map((form) => (
                  <div key={form.id} className="border border-green-200 bg-green-50 dark:bg-green-950/10 rounded-md p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{form.title}</h4>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            {t('completed')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{form.category} | </span>
                          <span>{t('submittedOn')}: {format(new Date(), 'dd.MM.yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Progress value={100} className="h-2 flex-1" />
                          <span className="text-sm font-medium">100%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end md:self-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info(t('viewForm'), {
                            description: `${form.title} formasını görüntüləyirsiniz.`
                          })}
                        >
                          {t('view')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="mx-auto">
            {t('viewAllForms')}
          </Button>
        </CardFooter>
      </Card>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SchoolAdminDashboard;
