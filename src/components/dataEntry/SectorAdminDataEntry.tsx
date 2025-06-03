
import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  School, 
  MoreVertical, 
  Edit, 
  Bell, 
  FileText,
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolDataEntry {
  id: string;
  name: string;
  completionRate: number;
  totalCategories: number;
  completedCategories: number;
  pendingCategories: number;
  lastUpdate: string;
  status: 'active' | 'warning' | 'overdue';
}

interface SectorAdminDataEntryProps {
  schools?: SchoolDataEntry[];
  onDataEntry: (schoolId: string) => void;
  onSendNotification: (schoolIds: string[]) => void;
  onBulkAction: (action: string, schoolIds: string[]) => void;
}

export const SectorAdminDataEntry: React.FC<SectorAdminDataEntryProps> = ({
  schools = [],
  onDataEntry,
  onSendNotification,
  onBulkAction
}) => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // Mock data for demo
  const mockSchools: SchoolDataEntry[] = [
    {
      id: '1',
      name: 'Azərbaycan Texniki Universiteti Məktəbi',
      completionRate: 85,
      totalCategories: 12,
      completedCategories: 10,
      pendingCategories: 2,
      lastUpdate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Heydər Əliyev adına məktəb',
      completionRate: 45,
      totalCategories: 12,
      completedCategories: 5,
      pendingCategories: 7,
      lastUpdate: '2024-01-10',
      status: 'warning'
    },
    {
      id: '3',
      name: 'Nizami Gəncəvi adına lisey',
      completionRate: 20,
      totalCategories: 12,
      completedCategories: 2,
      pendingCategories: 10,
      lastUpdate: '2024-01-05',
      status: 'overdue'
    }
  ];

  const displaySchools = schools.length > 0 ? schools : mockSchools;

  const handleSelectSchool = (schoolId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchools(prev => [...prev, schoolId]);
    } else {
      setSelectedSchools(prev => prev.filter(id => id !== schoolId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchools(displaySchools.map(school => school.id));
    } else {
      setSelectedSchools([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('onTrack');
      case 'warning':
        return t('needsAttention');
      case 'overdue':
        return t('overdue');
      default:
        return t('unknown');
    }
  };

  const stats = useMemo(() => {
    const total = displaySchools.length;
    const completed = displaySchools.filter(s => s.completionRate >= 100).length;
    const inProgress = displaySchools.filter(s => s.completionRate > 0 && s.completionRate < 100).length;
    const notStarted = displaySchools.filter(s => s.completionRate === 0).length;
    const averageCompletion = Math.round(
      displaySchools.reduce((sum, school) => sum + school.completionRate, 0) / total
    );

    return { total, completed, inProgress, notStarted, averageCompletion };
  }, [displaySchools]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">{t('totalSchools')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">{t('completed')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">{t('inProgress')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
            <div className="text-sm text-muted-foreground">{t('notStarted')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.averageCompletion}%</div>
            <div className="text-sm text-muted-foreground">{t('averageCompletion')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedSchools.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedSchools.length} məktəb seçildi
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendNotification(selectedSchools)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {t('sendNotification')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction('reminder', selectedSchools)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('sendReminder')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5" />
            {t('schoolDataEntry')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedSchools.length === displaySchools.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('schoolName')}</TableHead>
                <TableHead className="text-center">{t('completion')}</TableHead>
                <TableHead className="text-center">{t('categories')}</TableHead>
                <TableHead className="text-center">{t('status')}</TableHead>
                <TableHead className="text-center">{t('lastUpdate')}</TableHead>
                <TableHead className="text-center">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSchools.includes(school.id)}
                      onCheckedChange={(checked) => 
                        handleSelectSchool(school.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-muted-foreground" />
                      {school.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {school.completionRate}%
                      </div>
                      <Progress 
                        value={school.completionRate} 
                        className="w-16 h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium text-green-600">
                        {school.completedCategories} / {school.totalCategories}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {school.pendingCategories} gözləyir
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("text-xs", getStatusColor(school.status))}>
                      {getStatusText(school.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {new Date(school.lastUpdate).toLocaleDateString('az-AZ')}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => onDataEntry(school.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t('enterData')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onSendNotification([school.id])}
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          {t('sendNotification')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
