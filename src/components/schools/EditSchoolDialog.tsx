
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { School } from '@/types/school';
import { useRegions } from '@/contexts/RegionsContext';
import { useSectorsStore } from '@/hooks/useSectorsStore';

interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSuccess: () => void;
}

export const EditSchoolDialog: React.FC<EditSchoolDialogProps> = ({
  isOpen,
  onClose,
  school,
  // onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: school.name || '',
    region_id: school.region_id || '',
    sector_id: school.sector_id || '',
    address: school.address || '',
    phone: school.phone || '',
    email: school.email || '',
    principal_name: school.principal_name || '',
    student_count: school.student_count || 0,
    teacher_count: school.teacher_count || 0,
    type: school.type || 'full_secondary',
    language: school.language || 'az',
    status: school.status || 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { regions = [] } = useRegions() || {};
  const { sectors = [] } = useSectorsStore() || {};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'student_count' || name === 'teacher_count' ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Region dəyişdikdə sektoru sıfırla
    if (name === 'region_id') {
      setFormData(prev => ({
        ...prev,
        sector_id: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('schools')
        .update(formData)
        .eq('id', school.id);

      if (error) throw error;

      toast.success('Məktəb uğurla yeniləndi');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Məktəb yeniləmə xətası:', error);
      toast.error('Məktəb yeniləmərkən xəta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSectors = sectors.filter(sector => sector.region_id === formData.region_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Məktəbi redaktə et</DialogTitle>
          <DialogDescription>
            Məktəb məlumatlarını yeniləyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Məktəb adı *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                // required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principal_name">Müdir adı</Label>
              <Input
                id="principal_name"
                name="principal_name"
                value={formData.principal_name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region_id">Region *</Label>
              <Select
                value={formData.region_id}
                onValueChange={(value) => handleSelectChange('region_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Region seçin" />
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
              <Label htmlFor="sector_id">Sektor *</Label>
              <Select
                value={formData.sector_id}
                onValueChange={(value) => handleSelectChange('sector_id', value)}
                disabled={!formData.region_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sektor seçin" />
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
            <Label htmlFor="address">Ünvan</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Məktəb növü</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Növ seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_secondary">Tam orta məktəb</SelectItem>
                  <SelectItem value="general_secondary">Ümumi orta məktəb</SelectItem>
                  <SelectItem value="primary">İbtidai məktəb</SelectItem>
                  <SelectItem value="lyceum">Lisey</SelectItem>
                  <SelectItem value="gymnasium">Gimnaziya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Tədris dili</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleSelectChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">Azərbaycan</SelectItem>
                  <SelectItem value="ru">Rus</SelectItem>
                  <SelectItem value="en">İngilis</SelectItem>
                  <SelectItem value="tr">Türk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_count">Şagird sayı</Label>
              <Input
                id="student_count"
                name="student_count"
                type="number"
                value={formData.student_count}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher_count">Müəllim sayı</Label>
              <Input
                id="teacher_count"
                name="teacher_count"
                type="number"
                value={formData.teacher_count}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yenilənir...
                </>
              ) : (
                'Yenilə'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
