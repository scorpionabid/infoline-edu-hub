import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { School } from '@/types/school';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegionsData } from '@/hooks/regions/useRegionsData';
import { useSectorsData } from '@/hooks/sectors/useSectorsData';

interface SchoolAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSchool: (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onClose: () => void;
}

export const SchoolAddDialog: React.FC<SchoolAddDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddSchool,
  onClose
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [regionId, setRegionId] = useState<string>('');
  const [sectorId, setSectorId] = useState<string>('');
  const [address, setAddress] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { regions, fetchRegions } = useRegionsData();
  const { sectors, fetchSectors } = useSectorsData();
  
  useEffect(() => {
    if (isOpen) {
      fetchRegions();
    }
  }, [isOpen, fetchRegions]);
  
  useEffect(() => {
    if (regionId) {
      fetchSectors(regionId);
    }
  }, [regionId, fetchSectors]);

  const resetForm = () => {
    setName('');
    setRegionId('');
    setSectorId('');
    setAddress('');
    setPrincipalName('');
    setPhone('');
    setEmail('');
    setSubmitting(false);
  };
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const newSchool: Omit<School, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        regionId: regionId,
        sectorId: sectorId,
        region_id: regionId,
        sector_id: sectorId,
        address,
        principal_name: principalName,
        phone,
        email,
        status: 'active',
        student_count: 0,
        teacher_count: 0,
        admin_email: null,
        completion_rate: 0,
      };
      
      const success = await onAddSchool(newSchool);
      if (success) {
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Add school error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegionChange = (value: string) => {
    setRegionId(value);
    setSectorId('');
  };
  
  const filteredSectors = sectors.filter(sector => sector.region_id === regionId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
          <DialogDescription>
            {t('addSchoolDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('schoolName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterSchoolName')}
              disabled={submitting}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">{t('region')}</Label>
              <Select value={regionId} onValueChange={handleRegionChange} disabled={submitting}>
                <SelectTrigger id="region">
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region: Region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sector">{t('sector')}</Label>
              <Select 
                value={sectorId} 
                onValueChange={setSectorId} 
                disabled={!regionId || submitting}
              >
                <SelectTrigger id="sector">
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSectors.map((sector: Sector) => (
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('enterAddress')}
              disabled={submitting}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principalName">{t('principalName')}</Label>
              <Input
                id="principalName"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder={t('enterPrincipalName')}
                disabled={submitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('enterPhone')}
                disabled={submitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enterEmail')}
              disabled={submitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!name || !regionId || !sectorId || submitting}
          >
            {submitting ? t('adding') : t('addSchool')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolAddDialog;
