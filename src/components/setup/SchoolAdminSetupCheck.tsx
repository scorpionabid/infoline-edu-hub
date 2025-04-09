
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SchoolAdminSetupCheck: React.FC = () => {
  const [checkingFunction, setCheckingFunction] = useState(true);
  const [functionExists, setFunctionExists] = useState(false);

  useEffect(() => {
    const checkFunctionExists = async () => {
      try {
        // Direkt SQL sorğu ilə yoxlayaq
        const { data, error } = await supabase.rpc('check_function_exists', {
          function_name: 'get_school_admin_stats'
        });
        
        if (error) {
          console.error('Funksiya yoxlanması zamanı xəta:', error);
          setFunctionExists(false);
        } else {
          setFunctionExists(Boolean(data));
        }
      } catch (err) {
        console.error('Funksiya yoxlanması xətası:', err);
        setFunctionExists(false);
      } finally {
        setCheckingFunction(false);
      }
    };

    checkFunctionExists();
  }, []);

  if (checkingFunction) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <p>Funksiya yoxlanılır...</p>
      </div>
    );
  }

  if (!functionExists) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Funksiyalar tapılmadı</AlertTitle>
        <AlertDescription>
          Məktəb administratoru funksiyaları bazada tapılmadı. Mock data istifadə olunacaq.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SchoolAdminSetupCheck;
