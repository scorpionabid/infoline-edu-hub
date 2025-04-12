import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCheck, ChevronsUpDown } from "lucide-react"
import { Listbox, ListboxContent, ListboxEmpty, ListboxItem, ListboxList, ListboxTrigger } from "@/components/ui/listbox"
import { HoverCard, HoverCardContent, HoverCardDescription, HoverCardHeader, HoverCardTrigger } from "@/components/ui/hover-card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const DataEntry = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [categoryData, setCategoryData] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Status dəyişənini təyin edək
  const status = categoryData?.status || 'pending';

  const userRole = user?.role;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Kateqoriya məlumatlarını əldə et
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single();

        if (categoryError) {
          console.error('Kateqoriya məlumatlarını əldə edərkən xəta:', categoryError);
          setError(t('categoryFetchError'));
          return;
        }

        setCategoryData(category);

        // Sütun məlumatlarını əldə et
        const { data: cols, error: columnsError } = await supabase
          .from('columns')
          .select('*')
          .eq('category_id', categoryId)
          .order('order_index', { ascending: true });

        if (columnsError) {
          console.error('Sütun məlumatlarını əldə edərkən xəta:', columnsError);
          setError(t('columnsFetchError'));
          return;
        }

        setColumns(cols);

        // Əgər varsa, əvvəlki məlumatları əldə et
        const { data: existingData, error: existingDataError } = await supabase
          .from('data_entries')
          .select('*')
          .eq('category_id', categoryId)
          .eq('school_id', user?.schoolId)
          .limit(1);

        if (existingDataError) {
          console.error('Əvvəlki məlumatları əldə edərkən xəta:', existingDataError);
          setError(t('existingDataFetchError'));
          return;
        }

        if (existingData && existingData.length > 0) {
          const initialFormData: any = {};
          existingData.forEach(entry => {
            initialFormData[entry.column_id] = entry.value;
          });
          setFormData(initialFormData);
        }
      } catch (err: any) {
        console.error('Məlumatları əldə edərkən xəta:', err);
        setError(t('dataFetchError'));
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && user?.schoolId) {
      fetchData();
    }
  }, [categoryId, t, user?.schoolId]);

  const handleInputChange = (columnId: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnId]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Əvvəlki məlumatları yoxla
      const { data: existingData, error: existingDataError } = await supabase
        .from('data_entries')
        .select('id')
        .eq('category_id', categoryId)
        .eq('school_id', user?.schoolId);

      if (existingDataError) {
        console.error('Əvvəlki məlumatları yoxlayarkən xəta:', existingDataError);
        setError(t('existingDataCheckError'));
        return;
      }

      // Əgər əvvəlki məlumat varsa, onları sil
      if (existingData && existingData.length > 0) {
        const idsToDelete = existingData.map(entry => entry.id);
        const { error: deleteError } = await supabase
          .from('data_entries')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error('Əvvəlki məlumatları silərkən xəta:', deleteError);
          setError(t('previousDataDeleteError'));
          return;
        }
      }

      // Yeni məlumatları əlavə et
      const newData = columns.map(column => ({
        school_id: user?.schoolId,
        category_id: categoryId,
        column_id: column.id,
        value: formData[column.id] || null,
        created_by: user?.id
      }));

      const { error: insertError } = await supabase
        .from('data_entries')
        .insert(newData);

      if (insertError) {
        console.error('Məlumatları əlavə edərkən xəta:', insertError);
        setError(t('dataInsertError'));
        return;
      }

      toast({
        title: t('success'),
        description: t('dataSavedSuccessfully'),
      });
      setIsDirty(false);
    } catch (err: any) {
      console.error('Məlumatları əlavə edərkən xəta:', err);
      setError(t('dataInsertError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Əvvəlki məlumatları yoxla
      const { data: existingData, error: existingDataError } = await supabase
        .from('data_entries')
        .select('id')
        .eq('category_id', categoryId)
        .eq('school_id', user?.schoolId);

      if (existingDataError) {
        console.error('Əvvəlki məlumatları yoxlayarkən xəta:', existingDataError);
        setError(t('existingDataCheckError'));
        return;
      }

      // Əgər əvvəlki məlumat varsa, onları sil
      if (existingData && existingData.length > 0) {
        const idsToDelete = existingData.map(entry => entry.id);
        const { error: deleteError } = await supabase
          .from('data_entries')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error('Əvvəlki məlumatları silərkən xəta:', deleteError);
          setError(t('previousDataDeleteError'));
          return;
        }

        toast({
          title: t('success'),
          description: t('dataDeletedSuccessfully'),
        });
        setFormData({});
        setIsDirty(false);
      } else {
        toast({
          title: t('info'),
          description: t('noDataToDelete'),
        });
      }
    } catch (err: any) {
      console.error('Məlumatları silərkən xəta:', err);
      setError(t('dataDeleteError'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  // İstifadəçinin data redaktə edə biləcəyini yoxlayan funksiya
  const canEditData = (): boolean => {
    // Pending statusda olan və ya status olmayan datalar redaktə edilə bilər
    const editableStatuses = [undefined, null, 'pending', 'rejected'];
    return editableStatuses.includes(status as never) && isSchoolAdmin();
  };
  
  // İstifadəçinin SchoolAdmin olduğunu yoxlayan funksiya
  const isSchoolAdmin = (): boolean => {
    return userRole === 'schooladmin';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{categoryData?.name}</h1>
      <p className="text-gray-500 mb-6">{categoryData?.description}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t('dataEntryForm')}</CardTitle>
          <CardDescription>{t('fillInTheDetails')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {columns.map(column => (
            <div key={column.id}>
              <Label htmlFor={column.id}>{column.name}</Label>
              <Input
                type="text"
                id={column.id}
                placeholder={column.placeholder || ''}
                value={formData[column.id] || ''}
                onChange={(e) => handleInputChange(column.id, e.target.value)}
                disabled={!canEditData()}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          {t('goBack')}
        </Button>
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting || !canEditData()}>
                {t('deleteData')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteConfirmation')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('areYouSureToDelete')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDeleteConfirmation(false)}>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>{t('delete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            className="ml-2"
            onClick={handleSubmit}
            disabled={!isDirty || isSaving || !canEditData()}
          >
            {isSaving ? t('saving') + '...' : t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataEntry;
