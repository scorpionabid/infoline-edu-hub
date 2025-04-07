
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolFormData } from '@/types/school-form';
import { useAuth } from '@/context/AuthContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface SchoolFormProps {
  formData: SchoolFormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  filteredSectors: Array<{ id: string; name: string; regionId: string }>;
  isEdit?: boolean;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  formData,
  handleFormChange,
  currentTab,
  setCurrentTab,
  filteredSectors,
  isEdit = false
}) => {
  const { user } = useAuth();
  
  const handleSelectChange = (name: string, value: string) => {
    const event = {
      target: {
        name,
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleFormChange(event);
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
                onChange={handleFormChange}
                placeholder="Məktəb adı daxil edin"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="principalName">Direktor adı</Label>
              <Input
                id="principalName"
                name="principalName"
                value={formData.principalName}
                onChange={handleFormChange}
                placeholder="Direktor adı daxil edin"
              />
            </div>
          </div>
          
          {/* Region seçimi istifadəçinin regionu əsasında avtomatik doldurulacaq */}
          {isEdit || user?.role === 'superadmin' ? (
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="regionId">Region *</Label>
              <Select
                value={formData.regionId || "none"}
                onValueChange={(value) => handleSelectChange('regionId', value === "none" ? "" : value)}
              >
                <SelectTrigger id="regionId">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seçin</SelectItem>
                  <SelectItem value="baki">Bakı</SelectItem>
                  <SelectItem value="sumqayit">Sumqayıt</SelectItem>
                  <SelectItem value="gence">Gəncə</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="sectorId">Sektor *</Label>
            <Select
              value={formData.sectorId || "none"}
              onValueChange={(value) => handleSelectChange('sectorId', value === "none" ? "" : value)}
            >
              <SelectTrigger id="sectorId">
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seçin</SelectItem>
                {filteredSectors.map(sector => (
                  <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="address">Ünvan</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Məktəb ünvanı daxil edin"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">E-poçt</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="E-poçt ünvanı daxil edin"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
                placeholder="Müəllim sayı daxil edin"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">Məktəb növü</Label>
              <Select
                value={formData.type || "full_secondary"}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_secondary">Tam orta</SelectItem>
                  <SelectItem value="general_secondary">Ümumi orta</SelectItem>
                  <SelectItem value="primary">İbtidai</SelectItem>
                  <SelectItem value="lyceum">Lisey</SelectItem>
                  <SelectItem value="gymnasium">Gimnaziya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="language">Tədris dili</Label>
              <Select
                value={formData.language || "az"}
                onValueChange={(value) => handleSelectChange('language', value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">Azərbaycan</SelectItem>
                  <SelectItem value="ru">Rus</SelectItem>
                  <SelectItem value="en">İngilis</SelectItem>
                  <SelectItem value="tr">Türk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "active"}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Deaktiv</SelectItem>
              </SelectContent>
            </Select>
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
              onChange={handleFormChange}
              placeholder="Admin adı və soyadı daxil edin"
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="adminEmail">Admin e-poçt</Label>
            <Input
              id="adminEmail"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleFormChange}
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
              onChange={handleFormChange}
              placeholder="Şifrə daxil edin"
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="adminStatus">Admin statusu</Label>
            <Select
              value={formData.adminStatus || "active"}
              onValueChange={(value) => handleSelectChange('adminStatus', value)}
            >
              <SelectTrigger id="adminStatus">
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Deaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SchoolForm;
