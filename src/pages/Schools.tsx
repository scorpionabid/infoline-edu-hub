
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Search, Building, MapPin, School as SchoolIcon } from 'lucide-react';

// Demo məktəb data interfeysi
interface School {
  id: string;
  name: string;
  address: string;
  regionName: string;
  sectorName: string;
  studentCount: number;
  teacherCount: number;
  status: 'active' | 'inactive';
}

// Demo məktəb datası
const DEMO_SCHOOLS: School[] = [
  {
    id: '1',
    name: 'Məktəb 45',
    address: 'Yasamal rayonu, M.Müşfiq küç. 3',
    regionName: 'Bakı',
    sectorName: 'Yasamal',
    studentCount: 650,
    teacherCount: 45,
    status: 'active'
  },
  {
    id: '2',
    name: 'Məktəb 23',
    address: 'Nəsimi rayonu, Azadlıq pr. 89',
    regionName: 'Bakı',
    sectorName: 'Nəsimi',
    studentCount: 720,
    teacherCount: 52,
    status: 'active'
  },
  {
    id: '3',
    name: 'Məktəb 158',
    address: 'Sabunçu rayonu, Bakıxanov qəs. 256',
    regionName: 'Bakı',
    sectorName: 'Sabunçu',
    studentCount: 580,
    teacherCount: 38,
    status: 'active'
  },
  {
    id: '4',
    name: 'Məktəb 67',
    address: 'Binəqədi rayonu, 9-cu mikrorayon, 3',
    regionName: 'Bakı',
    sectorName: 'Binəqədi',
    studentCount: 830,
    teacherCount: 63,
    status: 'active'
  },
  {
    id: '5',
    name: 'Məktəb 132',
    address: 'Nərimanov rayonu, Əli Əşrəf küç. 10',
    regionName: 'Bakı',
    sectorName: 'Nərimanov',
    studentCount: 470,
    teacherCount: 31,
    status: 'inactive'
  }
];

const Schools = () => {
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter məktəbləri
  const filteredSchools = DEMO_SCHOOLS.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.sectorName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{t('schools')}</h1>
              <p className="text-muted-foreground mt-1">{t('schoolsDescription')}</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              {t('addSchool')}
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>{t('filterSchools')}</CardTitle>
              <CardDescription>{t('filterSchoolsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('searchSchools')}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* Burada əlavə filtrlər əlavə oluna bilər */}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('schoolList')}</CardTitle>
              <CardDescription>
                {filteredSchools.length} {t('schoolFound')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('schoolName')}</TableHead>
                    <TableHead>{t('region')}</TableHead>
                    <TableHead>{t('sector')}</TableHead>
                    <TableHead className="text-right">{t('studentCount')}</TableHead>
                    <TableHead className="text-right">{t('teacherCount')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                          {school.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{school.address}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {school.regionName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {school.sectorName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{school.studentCount}</TableCell>
                      <TableCell className="text-right">{school.teacherCount}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          school.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {school.status === 'active' ? t('active') : t('inactive')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredSchools.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noSchoolsFound')}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </div>
      </SidebarLayout>
    </>
  );
};

export default Schools;
