
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolOperations } from '@/hooks/schools/useSchoolOperations';
import { useRegionsContext } from '@/context/RegionsContext';
import { useSectorsStore } from '@/hooks/useSectorsStore';

interface CreateSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({
  open, 
  onOpenChange,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { regions } = useRegionsContext();
  const { sectors } = useSectorsStore();
  const { addSchool, isLoading } = useSchoolOperations();
  
  const [currentTab, setCurrentTab] = useState('school');
  const [schoolData, setSchoolData] = useState({
    name: '',
    principal_name: '',
    address: '',
    region_id: '',
    sector_id: '',
    phone: '',
    email: '',
    student_count: '',
    teacher_count: '',
    status: 'active',
    type: 'full_secondary',
    language: 'az'
  });
  
  const [adminData, setAdminData] = useState({
    email: '',
    full_name: '',
    password: '',
  });
  
  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSchoolData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setSchoolData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setSchoolData({
      name: '',
      principal_name: '',
      address: '',
      region_id: '',
      sector_id: '',
      phone: '',
      email: '',
      student_count: '',
      teacher_count: '',
      status: 'active',
      type: 'full_secondary',
      language: 'az'
    });
    setAdminData({
      email: '',
      full_name: '',
      password: '',
    });
    setCurrentTab('school');
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  const handleSubmit = async () => {
    if (!schoolData.name || !schoolData.sector_id) {
      toast({
        title: t('validationError'),
        description: t('schoolNameAndSectorRequired'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newSchool = {
        ...schoolData,
        student_count: schoolData.student_count ? parseInt(schoolData.student_count) : null,
        teacher_count: schoolData.teacher_count ? parseInt(schoolData.teacher_count) : null,
      };
      
      const adminInfo = adminData.email ? {
        email: adminData.email,
        full_name: adminData.full_name,
        password: adminData.password
      } : undefined;
      
      await addSchool(newSchool, adminInfo);
      
      toast({
        title: t('success'),
        description: t('schoolAddedSuccessfully'),
      });
      
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorAddingSchool'),
        variant: 'destructive',
      });
    }
  };
  
  const filteredSectors = schoolData.region_id
    ? sectors.filter(sector => sector.region_id === schoolData.region_id)
    : sectors;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="school">{t('schoolDetails')}</TabsTrigger>
            <TabsTrigger value="admin">{t('adminDetails')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="school" className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('schoolName')} *</Label>
                <Input
                  id="name"
                  name="name"
                  value={schoolData.name}
                  onChange={handleSchoolChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="principal_name">{t('principalName')}</Label>
                <Input
                  id="principal_name"
                  name="principal_name"
                  value={schoolData.principal_name}
                  onChange={handleSchoolChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region_id">{t('region')} *</Label>
                <Select
                  value={schoolData.region_id}
                  onValueChange={(value) => handleSelectChange('region_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector_id">{t('sector')} *</Label>
                <Select
                  value={schoolData.sector_id}
                  onValueChange={(value) => handleSelectChange('sector_id', value)}
                  disabled={!schoolData.region_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectSector')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                name="address"
                value={schoolData.address}
                onChange={handleSchoolChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={schoolData.phone}
                  onChange={handleSchoolChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={schoolData.email}
                  onChange={handleSchoolChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_count">{t('studentCount')}</Label>
                <Input
                  id="student_count"
                  name="student_count"
                  type="number"
                  value={schoolData.student_count}
                  onChange={handleSchoolChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teacher_count">{t('teacherCount')}</Label>
                <Input
                  id="teacher_count"
                  name="teacher_count"
                  type="number"
                  value={schoolData.teacher_count}
                  onChange={handleSchoolChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">{t('status')}</Label>
                <Select
                  value={schoolData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">{t('schoolType')}</Label>
                <Select
                  value={schoolData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_secondary">{t('fullSecondary')}</SelectItem>
                    <SelectItem value="general_secondary">{t('generalSecondary')}</SelectItem>
                    <SelectItem value="primary">{t('primary')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">{t('teachingLanguage')}</Label>
                <Select
                  value={schoolData.language}
                  onValueChange={(value) => handleSelectChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="az">{t('azerbaijani')}</SelectItem>
                    <SelectItem value="ru">{t('russian')}</SelectItem>
                    <SelectItem value="en">{t('english')}</SelectItem>
                    <SelectItem value="mixed">{t('mixed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin_email">{t('adminEmail')}</Label>
              <Input
                id="admin_email"
                name="email"
                type="email"
                value={adminData.email}
                onChange={handleAdminChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin_name">{t('adminName')}</Label>
              <Input
                id="admin_name"
                name="full_name"
                value={adminData.full_name}
                onChange={handleAdminChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin_password">{t('password')}</Label>
              <Input
                id="admin_password"
                name="password"
                type="password"
                value={adminData.password}
                onChange={handleAdminChange}
              />
              <p className="text-xs text-muted-foreground">
                {t('leavePwdBlankForAutoGen')}
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t('adding') : t('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
