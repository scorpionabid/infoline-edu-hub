import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowUp, Save, ServerCrash, CheckCircle, School } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Column {
  id: string;
  name: string;
  type: string;
  options?: string[];
  description?: string;
}

interface School {
  id: string;
  name: string;
  code?: string;
}

interface BulkDataInputProps {
  schoolIds: string[];
  categoryId: string;
  columnId: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => Promise<void>;
  onSubmit: () => Promise<void>;
  isSaving: boolean;
  isSubmitting: boolean;
  error?: string | null;
  columns: Column[];
  schools: School[];
}

export const BulkDataInput: React.FC<BulkDataInputProps> = ({
  schoolIds,
  categoryId,
  columnId,
  value,
  onChange,
  onSave,
  onSubmit,
  isSaving,
  isSubmitting,
  error,
  columns,
  schools
}) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const selectedColumn = columns.find(col => col.id === columnId);
  const selectedSchools = schools.filter(school => schoolIds.includes(school.id));
  
  const handleSave = async () => {
    await onSave();
    setLastSaved(new Date());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  // Sütun tipinə əsasən müvafiq input komponenti
  const renderColumnInput = () => {
    if (!selectedColumn) return null;
    
    switch (selectedColumn.type.toLowerCase()) {
      case 'text':
        return (
          <Textarea
            className="min-h-24"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${selectedColumn.name} üçün məlumat daxil edin...`}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${selectedColumn.name} üçün rəqəm daxil edin...`}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
        
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={`${selectedColumn.name} üçün seçim edin...`} />
            </SelectTrigger>
            <SelectContent>
              {selectedColumn.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      default:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${selectedColumn.name} üçün məlumat daxil edin...`}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Topluca Data Daxil Etmə</h3>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Çoxlu Məktəb Seçimi</AlertTitle>
          <AlertDescription className="text-amber-700">
            {`${selectedSchools.length} məktəb üçün "${selectedColumn?.name || 'Seçilmiş sütun'}" 
            məlumatlarını topluca daxil edəcəksiniz. Bu əməliyyat mövcud məlumatları yeniləyəcək.`}
          </AlertDescription>
        </Alert>
        
        <div className="border rounded-md p-3 bg-muted/20">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold">Seçilmiş Məktəblər</h4>
            <Badge className="bg-primary">{selectedSchools.length} məktəb</Badge>
          </div>
          
          <div className="max-h-24 overflow-y-auto text-sm space-y-1 px-2">
            {selectedSchools.map(school => (
              <div key={school.id} className="flex items-center gap-2">
                <School className="h-3 w-3 text-muted-foreground" />
                <span>{school.name} {school.code ? `(${school.code})` : ''}</span>
              </div>
            ))}
          </div>
        </div>
        
        {selectedColumn && (
          <div className="space-y-2">
            <Label className="text-base">
              {selectedColumn.name}
              <span className="ml-2 rounded-full bg-slate-100 text-slate-800 text-xs px-2 py-0.5">
                {selectedColumn.type}
              </span>
            </Label>
            
            {selectedColumn.description && (
              <p className="text-sm text-muted-foreground">
                {selectedColumn.description}
              </p>
            )}
            
            {renderColumnInput()}
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Xəta</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {lastSaved && !error && (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>
              {formatDistanceToNow(lastSaved, { addSuffix: true, locale: az })} yadda saxlanıldı
            </span>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleSave}
          disabled={isSaving || isSubmitting || !value.trim()}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saxlanılır...' : 'Müvəqqəti Saxla'}
        </Button>
        
        <Button
          type="submit"
          disabled={isSubmitting || isSaving || !value.trim()}
          className="bg-primary"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Təqdim edilir...' : 'Təqdim Et və Təsdiqlə'}
        </Button>
      </div>
    </form>
  );
};
