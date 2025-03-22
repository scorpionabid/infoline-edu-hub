
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Globe, 
  School, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Mock data for sectors
const mockSectors = [
  { 
    id: '1', 
    name: 'Yasamal', 
    region: 'Baku', 
    regionId: '1',
    description: 'Yasamal district in Baku city',
    schoolCount: 24,
    status: 'active',
    createdAt: '2023-01-15',
    completionRate: 78
  },
  { 
    id: '2', 
    name: 'Nizami', 
    region: 'Baku', 
    regionId: '1',
    description: 'Nizami district in Baku city',
    schoolCount: 18,
    status: 'active',
    createdAt: '2023-01-16',
    completionRate: 82
  },
  { 
    id: '3', 
    name: 'Nasimi', 
    region: 'Baku', 
    regionId: '1',
    description: 'Nasimi district in Baku city',
    schoolCount: 21,
    status: 'active',
    createdAt: '2023-01-17',
    completionRate: 65
  },
  { 
    id: '4', 
    name: 'Sabunchu', 
    region: 'Baku', 
    regionId: '1',
    description: 'Sabunchu district in Baku city',
    schoolCount: 26,
    status: 'active',
    createdAt: '2023-01-18',
    completionRate: 71
  },
  { 
    id: '5', 
    name: 'Surakhani', 
    region: 'Baku', 
    regionId: '1',
    description: 'Surakhani district in Baku city',
    schoolCount: 19,
    status: 'active',
    createdAt: '2023-01-19',
    completionRate: 59
  },
  { 
    id: '6', 
    name: 'Binagadi', 
    region: 'Baku', 
    regionId: '1',
    description: 'Binagadi district in Baku city',
    schoolCount: 22,
    status: 'active',
    createdAt: '2023-01-20',
    completionRate: 88
  },
  { 
    id: '7', 
    name: 'Narimanov', 
    region: 'Baku', 
    regionId: '1',
    description: 'Narimanov district in Baku city',
    schoolCount: 17,
    status: 'active',
    createdAt: '2023-01-21',
    completionRate: 76
  },
  { 
    id: '8', 
    name: 'Khatai', 
    region: 'Baku', 
    regionId: '1',
    description: 'Khatai district in Baku city',
    schoolCount: 20,
    status: 'inactive',
    createdAt: '2023-01-22',
    completionRate: 45
  },
];

// Mock data for regions
const mockRegions = [
  { id: '1', name: 'Baku' },
  { id: '2', name: 'Ganja' },
  { id: '3', name: 'Sumgait' },
  { id: '4', name: 'Lankaran' },
];

const Sectors = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [sectors, setSectors] = useState(mockSectors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    regionId: '',
    description: '',
    status: 'active'
  });
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter sectors based on search term
  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Sort sectors based on sort config
  const sortedSectors = React.useMemo(() => {
    const sortableSectors = [...filteredSectors];
    if (sortConfig.key) {
      sortableSectors.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSectors;
  }, [filteredSectors, sortConfig]);
  
  // Handle edit dialog open
  const handleEditDialogOpen = (sector) => {
    setSelectedSector(sector);
    setFormData({
      name: sector.name,
      regionId: sector.regionId,
      description: sector.description,
      status: sector.status
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle edit form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle edit form submit
  const handleEditSubmit = () => {
    const updatedSectors = sectors.map(sector => 
      sector.id === selectedSector.id ? { ...sector, ...formData } : sector
    );
    setSectors(updatedSectors);
    setIsEditDialogOpen(false);
    toast.success('Sector updated successfully');
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (sector) => {
    setSelectedSector(sector);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle delete confirm
  const handleDeleteConfirm = () => {
    const updatedSectors = sectors.filter(sector => sector.id !== selectedSector.id);
    setSectors(updatedSectors);
    setIsDeleteDialogOpen(false);
    toast.success('Sector deleted successfully');
  };
  
  // Render completion rate badge
  const renderCompletionRateBadge = (rate) => {
    if (rate >= 80) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">{rate}%</Badge>;
    } else if (rate >= 60) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">{rate}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">{rate}%</Badge>;
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    if (status === 'active') {
      return <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Active</div>;
    } else {
      return <div className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-1" /> Inactive</div>;
    }
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('sectors')}</h1>
            <p className="text-muted-foreground">Manage and view sectors</p>
          </div>
          {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Sector
            </Button>
          )}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sectors..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                      <div className="flex items-center">
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('region')} className="cursor-pointer">
                      <div className="flex items-center">
                        Region
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Schools</TableHead>
                    <TableHead className="hidden md:table-cell">Completion</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSectors.length > 0 ? (
                    sortedSectors.map(sector => (
                      <TableRow key={sector.id}>
                        <TableCell className="font-medium">{sector.id}</TableCell>
                        <TableCell>{sector.name}</TableCell>
                        <TableCell>{sector.region}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <School className="h-4 w-4 text-muted-foreground" />
                            {sector.schoolCount}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {renderCompletionRateBadge(sector.completionRate)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {renderStatusBadge(sector.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/sectors/${sector.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
                                <>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditDialogOpen(sector)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDeleteDialogOpen(sector)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Globe className="h-8 w-8 mb-2" />
                          <p>No sectors found</p>
                          {searchTerm && (
                            <p className="text-sm">Try a different search term</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sector</DialogTitle>
            <DialogDescription>Make changes to the sector details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regionId">Region</Label>
              <select
                id="regionId"
                name="regionId"
                value={formData.regionId}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Region</option>
                {mockRegions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the sector "{selectedSector?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Sectors;
