
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2 } from 'lucide-react';
import { FormFields } from '@/components/dataEntry/core';
import { Column } from '@/types/column';

interface CategoryFormProps {
  categoryId: string;
  onSave?: (data: any) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categoryId, onSave }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [columns] = useState<Column[]>([]);

  const handleFieldChange = (columnId: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnId]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kateqoriya Forması</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic category info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Kateqoriya Adı</label>
            <Input placeholder="Kateqoriya adını daxil edin" />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Qeyri-aktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Təsvir</label>
          <Textarea placeholder="Kateqoriya təsvirini daxil edin" />
        </div>

        {/* Dynamic fields */}
        {columns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dinamik Sahələr</h3>
            <FormFields
              columns={columns}
              formData={formData}
              onChange={handleFieldChange}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Saxla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
