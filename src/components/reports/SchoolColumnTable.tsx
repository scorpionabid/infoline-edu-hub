import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Column } from '@/types/column';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Edit, Copy, FileText, Download, Upload } from 'lucide-react';

// Define the CategoryWithColumns type
interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  columns: Column[];
}

interface SchoolColumnTableProps {
  categoryId?: string;
  schoolId?: string;
}

const SchoolColumnTable: React.FC<SchoolColumnTableProps> = ({ categoryId, schoolId }) => {
  const { t } = useLanguage();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [category, setCategory] = useState<CategoryWithColumns | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const handleExport = () => {
    // Excel ixracını həyata keçirə bilər
    toast.success(t('exportSuccessful'));
  };

  const handleGenerateTemplate = () => {
    setIsTemplateDialogOpen(true);
  };

  const handleApprove = () => {
    setIsApprovalDialogOpen(true);
  };

  const handleReject = () => {
    setIsRejectionDialogOpen(true);
  };

  const toggleSchoolSelection = (schoolId: string) => {
    if (selectedSchools.includes(schoolId)) {
      setSelectedSchools(selectedSchools.filter(id => id !== schoolId));
    } else {
      setSelectedSchools([...selectedSchools, schoolId]);
    }
  };

  const handleSelectAll = () => {
    // Bütün məktəbləri seçmək üçün
    // Burada məktəblər mock data ilə təmsil olunur
    const allSchoolIds = ["school-1", "school-2"];
    setSelectedSchools(allSchoolIds);
  };

  const handleDeselectAll = () => {
    setSelectedSchools([]);
  };

  // Mock data with sample columns for demonstration
  const mockColumns = [
    { id: "col-1", name: "Şagird sayı", type: "number" },
    { id: "col-2", name: "Müəllim sayı", type: "number" },
    { id: "col-3", name: "Otaq sayı", type: "number" }
  ];

  // Mock data with sample schools for demonstration
  const mockSchools = [
    { 
      id: "school-1", 
      name: "Şəhər Məktəbi #123", 
      region: "Bakı", 
      sector: "Nəsimi",
      data: [
        { columnId: "col-1", value: 1200 },
        { columnId: "col-2", value: 85 },
        { columnId: "col-3", value: 42 }
      ]
    },
    { 
      id: "school-2", 
      name: "Kənd Məktəbi #45", 
      region: "Abşeron", 
      sector: "Xırdalan",
      data: [
        { columnId: "col-1", value: 450 },
        { columnId: "col-2", value: 32 },
        { columnId: "col-3", value: 18 }
      ]
    }
  ];

  useEffect(() => {
    // Real verilənləri backenddən çəkmək üçün istifadə edilə bilər
    // İmitasiya üçün setTimeout istifadə edirik
    const timer = setTimeout(() => {
      setColumns(mockColumns as Column[]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [categoryId]);

  if (isLoading) {
    return <div className="p-4">Yüklənir...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Məktəb sütun hesabatı</h2>
          <p className="text-muted-foreground">
            Bütün məktəblərin göstəriciləri üzrə hesabat
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-1" /> İdxal
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> İxrac
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateTemplate}>
            <FileText className="h-4 w-4 mr-1" /> Şablon
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Əməliyyatlar</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleSelectAll}>Hamısını seç</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeselectAll}>Seçimi ləğv et</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleApprove}>Təsdiqlə</DropdownMenuItem>
              <DropdownMenuItem onClick={handleReject}>Rədd et</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedSchools.length === mockSchools.length && mockSchools.length > 0} 
                  onCheckedChange={(checked) => checked ? handleSelectAll() : handleDeselectAll()}
                />
              </TableHead>
              <TableHead className="w-[250px]">Məktəb</TableHead>
              <TableHead className="w-[120px]">Region</TableHead>
              <TableHead className="w-[120px]">Sektor</TableHead>
              {mockColumns.map(column => (
                <TableHead key={column.id}>{column.name}</TableHead>
              ))}
              <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSchools.map(school => (
              <TableRow key={school.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedSchools.includes(school.id)} 
                    onCheckedChange={() => toggleSchoolSelection(school.id)}
                  />
                </TableCell>
                <TableCell>{school.name}</TableCell>
                <TableCell>{school.region}</TableCell>
                <TableCell>{school.sector}</TableCell>
                {mockColumns.map(column => (
                  <TableCell key={column.id}>
                    {school.data.find(d => d.columnId === column.id)?.value || "-"}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excel faylından məlumatları idxal et</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input type="file" accept=".xlsx,.xls" />
            </div>
            <p className="text-sm text-muted-foreground">
              Seçilmiş Excel faylındakı məlumatları idxal edəcək. Əvvəlcə şablonu yükləyib doldurmaq tövsiyə olunur.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              Ləğv et
            </Button>
            <Button>İdxal et</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excel şablonunu yüklə</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Excel şablonunu yükləyərək doldurun və sonra "İdxal" funksiyası ilə məlumatları sistemə daxil edin.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsTemplateDialogOpen(false)}
            >
              Ləğv et
            </Button>
            <Button onClick={() => {
              setIsTemplateDialogOpen(false);
              toast.success("Şablon yüklənir");
            }}>
              Şablonu yüklə
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Təsdiqləmə</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Seçilmiş {selectedSchools.length} məktəbin məlumatlarını təsdiqləmək istədiyinizdən əminsiniz?</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApprovalDialogOpen(false)}
            >
              Ləğv et
            </Button>
            <Button 
              onClick={() => {
                setIsApprovalDialogOpen(false);
                toast.success(`${selectedSchools.length} məktəbin məlumatları təsdiqləndi`);
              }}
            >
              Təsdiqlə
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rədd etmə</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Seçilmiş {selectedSchools.length} məktəbin məlumatlarını rədd etmək istədiyinizdən əminsiniz?</p>
            <Input 
              placeholder="Rədd etmə səbəbi" 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectionDialogOpen(false)}
            >
              Ləğv et
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setIsRejectionDialogOpen(false);
                toast.success(`${selectedSchools.length} məktəbin məlumatları rədd edildi`);
                setRejectionReason('');
              }}
            >
              Rədd et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolColumnTable;
