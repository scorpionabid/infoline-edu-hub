
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useSchoolsContext } from '@/context/SchoolsContext';
import { Region, Sector } from '@/types/school';

interface CreateSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  regions?: Region[];
  sectors?: Sector[];
}

const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess,
  regions = [],
  sectors = []
}) => {
  const { t } = useLanguage();
  const { handleCreateSchool } = useSchoolsContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    region_id: '',
    sector_id: '',
    address: '',
    phone: '',
    email: '',
    principal_name: '',
    student_count: '',
    teacher_count: '',
    type: 'general',
    language: 'az',
  });
  
  // Available sectors based on selected region
  const [availableSectors, setAvailableSectors] = useState<Sector[]>([]);
  
  // Update available sectors when region changes
  React.useEffect(() => {
    if (formData.region_id) {
      setAvailableSectors(
        sectors.filter(sector => sector.region_id === formData.region_id)
      );
      setFormData(prev => ({
        ...prev,
        sector_id: ''  // Reset sector when region changes
      }));
    } else {
      setAvailableSectors([]);
    }
  }, [formData.region_id, sectors]);
  
  // Handle form input changes
  const handleChange = (
    field: string, 
    value: string | number
  ) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('schoolNameRequired'));
      return;
    }
    
    if (!formData.region_id) {
      toast.error(t('regionRequired'));
      return;
    }
    
    if (!formData.sector_id) {
      toast.error(t('sectorRequired'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await handleCreateSchool({
        name: formData.name,
        region_id: formData.region_id,
        sector_id: formData.sector_id,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        principal_name: formData.principal_name,
        student_count: formData.student_count ? parseInt(formData.student_count) : undefined,
        teacher_count: formData.teacher_count ? parseInt(formData.teacher_count) : undefined,
        type: formData.type,
        language: formData.language,
        status: 'active'
      });
      
      toast.success(t('schoolAddedSuccessfully'));
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating school:', error);
      toast.error(error.message || t('errorCreatingSchool'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form values
  const resetForm = () => {
    setFormData({
      name: '',
      region_id: '',
      sector_id: '',
      address: '',
      phone: '',
      email: '',
      principal_name: '',
      student_count: '',
      teacher_count: '',
      type: 'general',
      language: 'az',
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
          <DialogDescription>
            {t('fillFormAddSchool')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{t('schoolName')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">{t('region')} *</Label>
              <Select 
                value={formData.region_id} 
                onValueChange={(value) => handleChange('region_id', value)}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector" className="text-right">{t('sector')} *</Label>
              <Select 
                value={formData.sector_id} 
                onValueChange={(value) => handleChange('sector_id', value)}
                disabled={!formData.region_id}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={
                    !formData.region_id 
                      ? t('selectRegionFirst') 
                      : availableSectors.length === 0 
                        ? t('noSectorsInRegion')
                        : t('selectSector')
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">{t('address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">{t('phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="principal_name" className="text-right">{t('principalName')}</Label>
              <Input
                id="principal_name"
                value={formData.principal_name}
                onChange={(e) => handleChange('principal_name', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student_count" className="text-right">{t('studentCount')}</Label>
              <Input
                id="student_count"
                type="number"
                value={formData.student_count}
                onChange={(e) => handleChange('student_count', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teacher_count" className="text-right">{t('teacherCount')}</Label>
              <Input
                id="teacher_count"
                type="number"
                value={formData.teacher_count}
                onChange={(e) => handleChange('teacher_count', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">{t('schoolType')}</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectSchoolType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('generalSchool')}</SelectItem>
                  <SelectItem value="lyceum">{t('lyceum')}</SelectItem>
                  <SelectItem value="gymnasium">{t('gymnasium')}</SelectItem>
                  <SelectItem value="highschool">{t('highSchool')}</SelectItem>
                  <SelectItem value="elementary">{t('elementarySchool')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="language" className="text-right">{t('language')}</Label>
              <Select 
                value={formData.language} 
                onValueChange={(value) => handleChange('language', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">{t('azerbaijani')}</SelectItem>
                  <SelectItem value="ru">{t('russian')}</SelectItem>
                  <SelectItem value="en">{t('english')}</SelectItem>
                  <SelectItem value="tr">{t('turkish')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
