
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import { School } from '@/types/school';
import BulkDataEntryDialog from '@/components/dataEntry/BulkDataEntryDialog';

interface SectorAdminSchoolListProps {
  schools: School[];
  onSchoolSelect?: (school: School) => void;
  onBulkAction?: (action: string, schools: School[]) => void;
  showActions?: boolean;
  compactMode?: boolean;
}

const SectorAdminSchoolList: React.FC<SectorAdminSchoolListProps> = ({
  schools = [],
  onSchoolSelect,
  onBulkAction,
  showActions = true,
  compactMode = false
}) => {
  const { t } = useTranslation();
  
  // Local state
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedSchoolForEntry, setSelectedSchoolForEntry] = useState<string | null>(null);

  // Filter schools based on search and status
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         school.principal_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle school selection
  const handleSchoolToggle = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedSchools.length === filteredSchools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(filteredSchools.map(school => school.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedSchoolObjects = schools.filter(school => 
      selectedSchools.includes(school.id)
    );
    
    if (onBulkAction) {
      onBulkAction(action, selectedSchoolObjects);
    }
    
    // Reset selection after action
    setSelectedSchools([]);
  };

  // Handle data entry for school
  const handleDataEntry = (schoolId: string) => {
    setSelectedSchoolForEntry(schoolId);
    setBulkDialogOpen(true);
  };

  if (schools.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Məktəb tapılmadı</h3>
          <p className="text-muted-foreground">
            Bu sektorda hələlik məktəb qeydiyyatdan keçməyib.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (typeof schools[0] === 'string') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Məlumat xətası</h3>
          <p className="text-muted-foreground">
            Məktəb məlumatları düzgün formatda deyil.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Məktəb adı və ya direktor adı ilə axtarın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün statuslar</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Qeyri-aktiv</SelectItem>
              <SelectItem value="pending">Gözləyən</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {showActions && selectedSchools.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedSchools.length} seçilib
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Toplu əməliyyat
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('data-entry')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Məlumat daxil et
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Schools List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Məktəblər ({filteredSchools.length})
            </CardTitle>
            
            {showActions && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSchools.length === filteredSchools.length && filteredSchools.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Hamısını seç</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className={`p-4 hover:bg-muted/50 transition-colors ${
                  selectedSchools.includes(school.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {showActions && (
                      <Checkbox
                        checked={selectedSchools.includes(school.id)}
                        onCheckedChange={() => handleSchoolToggle(school.id)}
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{school.name}</h4>
                        <Badge 
                          variant={school.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {school.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {school.principal_name && (
                          <div>Direktor: {school.principal_name}</div>
                        )}
                        <div className="flex items-center gap-4">
                          {school.student_count && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {school.student_count} şagird
                            </span>
                          )}
                          {school.completion_rate !== undefined && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {school.completion_rate}% tamamlanıb
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {showActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSchoolSelect?.(school)}>
                          Məktəbi seç
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDataEntry(school.id)}>
                          Məlumat daxil et
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Data Entry Dialog */}
      <BulkDataEntryDialog
        open={bulkDialogOpen}
        onClose={() => {
          setBulkDialogOpen(false);
          setSelectedSchoolForEntry(null);
        }}
      />
    </div>
  );
};

export default SectorAdminSchoolList;
