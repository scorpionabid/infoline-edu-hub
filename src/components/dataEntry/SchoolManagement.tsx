
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
  status: string;
  principal_name?: string;
  email?: string;
  phone?: string;
}

const SchoolManagement: React.FC = () => {
  const { t } = useLanguage();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      toast.error('Məktəbləri yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSchoolCard = (school: School) => (
    <Card key={school.id} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{school.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Status:</strong> {school.status}</p>
          {school.principal_name && (
            <p><strong>Direktor:</strong> {school.principal_name}</p>
          )}
          {school.email && (
            <p><strong>Email:</strong> {school.email}</p>
          )}
          {school.phone && (
            <p><strong>Telefon:</strong> {school.phone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('schoolManagement')}</h1>
        <Button onClick={fetchSchools} disabled={loading}>
          {loading ? 'Yüklənir...' : 'Yenilə'}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="search">Axtarış</Label>
          <Input
            id="search"
            placeholder="Məktəb adı..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Yüklənir...</div>
        ) : filteredSchools.length === 0 ? (
          <div className="text-center py-8">Məktəb tapılmadı</div>
        ) : (
          filteredSchools.map(renderSchoolCard)
        )}
      </div>
    </div>
  );
};

export default SchoolManagement;
