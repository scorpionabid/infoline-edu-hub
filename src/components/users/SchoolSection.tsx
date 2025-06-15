
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { UserFormData } from '@/types/user';

interface School {
  id: string;
  name: string;
}

interface SchoolSectionProps {
  form: ReturnType<typeof useForm<UserFormData>>;
}

const SchoolSection: React.FC<SchoolSectionProps> = ({ form }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sectorId = form.watch('sector_id');

  useEffect(() => {
    const fetchSchools = async () => {
      if (!sectorId) {
        setSchools([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .eq('sector_id', sectorId)
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setSchools(data || []);
      } catch (error) {
        console.error('Error fetching schools:', error);
        setSchools([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, [sectorId]);

  return (
    <FormField
      control={form.control}
      name="school_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Məktəb</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ''}
            disabled={!sectorId || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Məktəb seçin" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default SchoolSection;
