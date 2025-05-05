
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  File,
  FileBarChart,
  FileCheck,
  FileClock,
  UserCog
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schoolStatsData = [
  {
    id: '1',
    name: 'Məktəb #23',
    region: 'Bakı',
    formStatus: 'completed',
    lastUpdate: '2024-04-10',
    completion: 100
  },
  {
    id: '2',
    name: 'Məktəb #45',
    region: 'Bakı',
    formStatus: 'in_progress',
    lastUpdate: '2024-04-09',
    completion: 65
  },
  {
    id: '3',
    name: 'Məktəb #12',
    region: 'Bakı',
    formStatus: 'pending',
    lastUpdate: '2024-04-05',
    completion: 0
  },
  {
    id: '4',
    name: 'Məktəb #78',
    region: 'Bakı',
    formStatus: 'completed',
    lastUpdate: '2024-04-08',
    completion: 100
  },
  {
    id: '5',
    name: 'Məktəb #34',
    region: 'Bakı',
    formStatus: 'in_progress',
    lastUpdate: '2024-04-07',
    completion: 45
  }
];

interface SchoolStat {
  id: string;
  name: string;
  region: string;
  formStatus: 'completed' | 'in_progress' | 'pending' | 'overdue';
  lastUpdate: string;
  completion: number;
}

const SectorAdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});
  
  const toggleCollapsible = (id: string) => {
    setOpenCollapsibles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-amber-500';
      case 'pending': return 'text-gray-500';
      case 'overdue': return 'text-red-500';
      default: return '';
    }
  };
  
  const schools: SchoolStat[] = schoolStatsData;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('sectorDashboard')}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('exportReports')}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="schools">{t('schools')}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalSchools')}
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  +2 {t('fromLastMonth')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('completionRate')}
                </CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <div className="pt-2">
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('pendingReviews')}
                </CardTitle>
                <FileClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  {t('needsAttention')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('overdueForms')}
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">5</div>
                <p className="text-xs text-muted-foreground">
                  {t('requiresAction')}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('completionTrend')}</CardTitle>
                <CardDescription>
                  {t('completionTrendDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { date: 'Yan', completion: 35 },
                        { date: 'Fev', completion: 40 },
                        { date: 'Mar', completion: 55 },
                        { date: 'Apr', completion: 78 },
                        { date: 'May', completion: 85 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completion"
                        name={t('completionPercentage')}
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('schoolsPerStatus')}</CardTitle>
                <CardDescription>
                  {t('schoolsPerStatusDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { status: t('completed'), count: 25 },
                        { status: t('inProgress'), count: 12 },
                        { status: t('pending'), count: 5 },
                        { status: t('overdue'), count: 5 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name={t('schoolCount')} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
              <CardDescription>{t('last30DaysActivity')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('school')}</TableHead>
                    <TableHead>{t('activity')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{format(new Date(), 'MMM dd')}</TableCell>
                    <TableCell>Məktəb #45</TableCell>
                    <TableCell>{t('formSubmitted')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        {t('pendingReview')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{format(new Date(), 'MMM dd')}</TableCell>
                    <TableCell>Məktəb #23</TableCell>
                    <TableCell>{t('formApproved')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {t('approved')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{format(new Date(), 'MMM dd')}</TableCell>
                    <TableCell>Məktəb #12</TableCell>
                    <TableCell>{t('formRejected')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        {t('rejected')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{format(new Date(), 'MMM dd')}</TableCell>
                    <TableCell>Məktəb #78</TableCell>
                    <TableCell>{t('formUpdated')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        {t('updated')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('schoolsInSector')}</CardTitle>
              <CardDescription>
                {t('schoolsInSectorDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {schools.map((school) => (
                  <Collapsible
                    key={school.id}
                    open={openCollapsibles[school.id]}
                    onOpenChange={() => toggleCollapsible(school.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            school.formStatus === 'completed' && "bg-green-500",
                            school.formStatus === 'in_progress' && "bg-amber-500",
                            school.formStatus === 'pending' && "bg-gray-400",
                            school.formStatus === 'overdue' && "bg-red-500",
                          )} />
                          <span className="font-medium">{school.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={school.completion} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground">{school.completion}%</span>
                          <Button variant="ghost" size="icon">
                            {openCollapsibles[school.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-2 border border-t-0 rounded-b-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-semibold">{t('region')}</h4>
                          <p className="text-sm text-muted-foreground">{school.region}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{t('status')}</h4>
                          <p className={cn("text-sm", getStatusColor(school.formStatus))}>
                            {t(school.formStatus)}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{t('lastUpdate')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(school.lastUpdate), 'PPP')}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          <FileBarChart className="mr-2 h-4 w-4" />
                          {t('viewDetails')}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('categoriesOverview')}</CardTitle>
              <CardDescription>
                {t('categoriesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('completionRate')}</TableHead>
                    <TableHead>{t('dueDate')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Məktəb infrastrukturu</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={90} className="h-2" />
                        <span className="text-sm text-muted-foreground">90%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>May 15, 2024</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {t('onTrack')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Müəllim və şagird statistikası</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="h-2" />
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>May 20, 2024</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        {t('inProgress')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Texniki təchizat</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="h-2" />
                        <span className="text-sm text-muted-foreground">45%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>May 10, 2024</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        {t('atRisk')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SectorAdminDashboard;
