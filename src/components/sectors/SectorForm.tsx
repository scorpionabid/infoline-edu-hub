
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';

interface SectorFormData {
  name: string;
  region_id: string;
}

interface SectorFormProps {
  sector?: any;
  onSubmit: (data: SectorFormData) => void;
  onCancel: () => void;
}

export const SectorForm: React.FC<SectorFormProps> = ({
  sector,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<SectorFormData>({
    name: sector?.name || '',
    region_id: sector?.region_id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {sector ? 'Sektoru Redaktə Et' : 'Yeni Sektor Əlavə Et'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sektor Adı</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Ləğv Et
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Yadda Saxla
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectorForm;
