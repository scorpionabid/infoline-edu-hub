
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { SchoolFormData } from '@/types/school-form';

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: SchoolFormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  filteredSectors: Array<{ id: string; name: string; regionId: string }>;
}

export const EditDialog: React.FC<EditDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  handleFormChange, 
  filteredSectors 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Məktəbi redaktə et</DialogTitle>
          <DialogDescription>
            Məktəb məlumatlarını yeniləyin. Bütün zəruri sahələri (*) doldurun.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-name">Məktəb adı *</Label>
              <input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Məktəb adı daxil edin"
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-principalName">Direktor adı</Label>
              <input
                id="edit-principalName"
                name="principalName"
                value={formData.principalName}
                onChange={handleFormChange}
                placeholder="Direktor adı daxil edin"
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-regionId">Region *</Label>
              <select
                id="edit-regionId"
                name="regionId"
                value={formData.regionId}
                onChange={handleFormChange}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Seçin</option>
                {[...Array(4)].map((_, i) => (
                  <option key={i+1} value={(i+1).toString()}>Region {i+1}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-sectorId">Sektor *</Label>
              <select
                id="edit-sectorId"
                name="sectorId"
                value={formData.sectorId}
                onChange={handleFormChange}
                disabled={!formData.regionId}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Seçin</option>
                {formData.regionId ? filteredSectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                )) : null}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="edit-address">Ünvan</Label>
            <input
              id="edit-address"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Məktəb ünvanı daxil edin"
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-email">E-poçt</Label>
              <input
                id="edit-email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="E-poçt ünvanı daxil edin"
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-phone">Telefon</Label>
              <input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="Telefon nömrəsi daxil edin"
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-studentCount">Şagird sayı</Label>
              <input
                id="edit-studentCount"
                name="studentCount"
                type="number"
                value={formData.studentCount}
                onChange={handleFormChange}
                placeholder="Şagird sayı daxil edin"
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-teacherCount">Müəllim sayı</Label>
              <input
                id="edit-teacherCount"
                name="teacherCount"
                type="number"
                value={formData.teacherCount}
                onChange={handleFormChange}
                placeholder="Müəllim sayı daxil edin"
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-type">Məktəb növü</Label>
              <select
                id="edit-type"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="full_secondary">Tam orta</option>
                <option value="general_secondary">Ümumi orta</option>
                <option value="primary">İbtidai</option>
                <option value="lyceum">Lisey</option>
                <option value="gymnasium">Gimnaziya</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-language">Tədris dili</Label>
              <select
                id="edit-language"
                name="language"
                value={formData.language}
                onChange={handleFormChange}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="az">Azərbaycan</option>
                <option value="ru">Rus</option>
                <option value="en">İngilis</option>
                <option value="tr">Türk</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Deaktiv</option>
            </select>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Ləğv et
          </Button>
          <Button onClick={onSubmit}>
            Yadda saxla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
