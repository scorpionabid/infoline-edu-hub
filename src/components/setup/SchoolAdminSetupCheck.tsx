
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SchoolAdminSetupCheck: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasRequiredFunctions, setHasRequiredFunctions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        setIsChecking(true);
        
        // Məktəb admin üçün zəruri olan funksiyaları yoxla
        const { data, error } = await supabase.rpc('check_function_exists', {
          function_name: 'get_school_admin_stats'
        });
        
        if (error) throw error;
        
        setHasRequiredFunctions(data);
      } catch (err: any) {
        console.error('Funksiyaların yoxlanması zamanı xəta:', err);
        setError(err.message || 'Funksiyaların yoxlanması zamanı xəta baş verdi');
        setHasRequiredFunctions(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkSetup();
  }, []);
  
  if (isChecking) {
    return (
      <Alert className="bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-700" />
        <AlertTitle>Yoxlanılır...</AlertTitle>
        <AlertDescription>
          Məktəb admin funksionallığı üçün lazımi konfiqurasiyalar yoxlanılır.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Yoxlama zamanı xəta</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!hasRequiredFunctions) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Məktəb admin funksionallığı hazır deyil</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Məktəb admin funksionallığı üçün lazımi SQL funksiyaları tapılmadı. Zəhmət olmasa, aşağıdakı SQL funksiyalarını əlavə edin:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>get_school_admin_stats</li>
            <li>schools_required_columns</li>
          </ul>
          <p className="text-sm">Bu funksiyaları "SQL Editor" vasitəsilə əlavə edə bilərsiniz.</p>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-700" />
      <AlertTitle>Məktəb admin funksionallığı hazırdır</AlertTitle>
      <AlertDescription>
        Bütün lazımi SQL funksiyaları tapıldı və məktəb admin funksionallığı istifadəyə hazırdır.
      </AlertDescription>
    </Alert>
  );
};

export default SchoolAdminSetupCheck;
