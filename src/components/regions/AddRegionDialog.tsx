
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RegionFormData } from '@/hooks/useRegionsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from 'lucide-react';

interface AddRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RegionFormData) => Promise<boolean>;
}

const AddRegionDialog: React.FC<AddRegionDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [createAdmin, setCreateAdmin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<RegionFormData>({
    name: '',
    description: '',
    status: 'active',
    adminName: '',
    adminEmail: '',
    adminPassword: 'Password123' // Default password
  });
  
  const handleChange = (field: keyof RegionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Region adı dəyişdikdə və admin yaratmaq aktivdirsə, avtomatik admin email yaratmaq
    if (field === 'name' && createAdmin) {
      const regionNameLower = value.toLowerCase().replace(/\s+/g, '.');
      const adminEmail = `${regionNameLower}.admin@infoline.edu`;
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        adminEmail,
        adminName: prev.adminName || `${value} Admin` 
      }));
    }
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Əgər admin yaratmaq seçilməyibsə, admin məlumatlarını təmizləyək
      const submitData = createAdmin ? formData : {
        name: formData.name,
        description: formData.description,
        status: formData.status
      };
      
      const success = await onSubmit(submitData);
      
      if (success) {
        setFormData({
          name: '',
          description: '',
          status: 'active',
          adminName: '',
          adminEmail: '',
          adminPassword: 'Password123'
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Region əlavə edilərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formIsValid = formData.name.trim() !== '' && 
                     (!createAdmin || (formData.adminEmail && formData.adminEmail.includes('@') && formData.adminPassword));
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addNewRegion')}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">{t('basicInfo')}</TabsTrigger>
            <TabsTrigger value="admin">{t('adminSettings')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">{t('name')} *</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="col-span-3"
                  placeholder={t('regionNamePlaceholder')}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">{t('description')}</Label>
                <Textarea 
                  id="description" 
                  value={formData.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="col-span-3"
                  placeholder={t('regionDescPlaceholder')}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">{t('status')}</Label>
                <Select 
                  value={formData.status || 'active'} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch 
                id="create-admin" 
                checked={createAdmin}
                onCheckedChange={setCreateAdmin}
              />
              <Label htmlFor="create-admin">{t('createRegionAdmin')}</Label>
            </div>
            
            {createAdmin && (
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="adminName" className="text-right">{t('adminName')}</Label>
                  <Input 
                    id="adminName" 
                    value={formData.adminName || ''} 
                    onChange={(e) => handleChange('adminName', e.target.value)}
                    className="col-span-3"
                    placeholder={t('adminNamePlaceholder')}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="adminEmail" className="text-right">{t('adminEmail')} *</Label>
                  <Input 
                    id="adminEmail" 
                    type="email"
                    value={formData.adminEmail || ''} 
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    className="col-span-3"
                    placeholder={t('adminEmailPlaceholder')}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="adminPassword" className="text-right">{t('password')} *</Label>
                  <div className="col-span-3 relative">
                    <Input 
                      id="adminPassword" 
                      type={showPassword ? "text" : "password"}
                      value={formData.adminPassword || ''} 
                      onChange={(e) => handleChange('adminPassword', e.target.value)}
                      className="pr-10"
                      placeholder={t('passwordPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formIsValid}
          >
            {loading ? t('creating') : t('createRegion')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegionDialog;
