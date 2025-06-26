import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileCategory } from '../../types/file';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface FileUploadFormProps {
  categories: FileCategory[];
  onSubmit: (file: File, categoryId: string, description?: string) => Promise<void>;
  onCancel: () => void;
}

export const FileUploadForm: React.FC<FileUploadFormProps> = ({ categories, onSubmit, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      categoryId: categories[0]?.id || '',
      description: ''
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  const handleSubmit = async (data: any) => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      await onSubmit(selectedFile, data.categoryId, data.description);
      form.reset();
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <div>
              <FormLabel>Kateqoriya</FormLabel>
              <FormControl>
                <Select 
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        
        <div>
          <FormLabel>Fayl</FormLabel>
          <Input 
            type="file" 
            onChange={handleFileChange}
            // required
          />
          {selectedFile && (
            <p className="text-sm text-gray-500 mt-1">
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </p>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <div>
              <FormLabel>Təsvir</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
            Ləğv et
          </Button>
          <Button type="submit" disabled={!selectedFile || uploading}>
            {uploading ? 'Yüklənir...' : 'Yüklə'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
