
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolFormData } from '@/types/school-form';
import { useAuth } from '@/context/AuthContext';

export interface SchoolFormProps {
  formData: SchoolFormData;
  onChange: (field: string, value: any) => void; // onChange prop'u interface'ə əlavə edildi
  handleFormChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; // əlavə edildi
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  filteredSectors: Array<{ id: string; name: string; regionId: string }>;
  isEdit?: boolean;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  formData,
  onChange,
  handleFormChange,
  currentTab,
  setCurrentTab,
  filteredSectors,
  isEdit = false
}) => {
  const { user } = useAuth();
  
  // İstifadəçi ya onChange, ya da handleFormChange funksiyasından istifadə edə bilər
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (handleFormChange) {
      handleFormChange(e);
    } else if (onChange) {
      onChange(e.target.name, e.target.value);
    }
  };
  
  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="school">Məktəb</TabsTrigger>
        <TabsTrigger value="admin">Admin</TabsTrigger>
      </TabsList>
      <TabsContent value="school">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Məktəb adı *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Məktəb adı daxil edin"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="principalName">Direktor adı</Label>
              <Input
                id="principalName"
                name="principalName"
                value={formData.principalName}
                onChange={handleChange}
                placeholder="Direktor adı daxil edin"
              />
            </div>
          </div>
          
          {/* Region seçimi silindi, sektor seçildikdə region avtomatik təyin olunacaq */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="sectorId">Sektor *</Label>
            <select
              id="sectorId"
              name="sectorId"
              value={formData.sectorId}
              onChange={handleChange}
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              required
            >
              <option value="">Seçin</option>
              {filteredSectors.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="address">Ünvan</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Məktəb ünvanı daxil edin"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">E-poçt</Label>
              <Input
                id="email"
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="E-poçt ünvanı daxil edin"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Telefon nömrəsi daxil edin"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="studentCount">Şagird sayı</Label>
              <Input
                id="studentCount"
                name="studentCount"
                type="number"
                value={formData.studentCount}
                onChange={handleChange}
                placeholder="Şagird sayı daxil edin"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="teacherCount">Müəllim sayı</Label>
              <Input
                id="teacherCount"
                name="teacherCount"
                type="number"
                value={formData.teacherCount}
                onChange={handleChange}
                placeholder="Müəllim sayı daxil edin"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">Məktəb növü</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
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
              <Label htmlFor="language">Tədris dili</Label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
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
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Deaktiv</option>
            </select>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="admin">
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="adminFullName">Admin adı və soyadı</Label>
            <Input
              id="adminFullName"
              name="adminFullName"
              value={formData.adminFullName}
              onChange={handleChange}
              placeholder="Admin adı və soyadı daxil edin"
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="adminEmail">Admin e-poçt</Label>
            <Input
              id="adminEmail"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              placeholder="Admin e-poçt ünvanı daxil edin"
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="adminPassword">Şifrə</Label>
            <Input
              id="adminPassword"
              name="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={handleChange}
              placeholder="Şifrə daxil edin"
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Şifrə minimum 6 simvoldan ibarət olmalıdır</p>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="adminStatus">Admin statusu</Label>
            <select
              id="adminStatus"
              name="adminStatus"
              value={formData.adminStatus}
              onChange={handleChange}
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Deaktiv</option>
            </select>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SchoolForm;
