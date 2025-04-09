
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
        // Direkt uuid_generate_v4 funksiyasını çağırırıq - bu funksiya bütün Supabase layihələrində var
        const { data, error } = await supabase.rpc('uuid_generate_v4');
        
        if (error) {
          console.error('Baza əlaqəsi yoxlanması zamanı xəta:', error);
          setFunctionExists(false);
        } else {
          // Funksiya mövcuddur, indi məktəb məlumatlarını ayrıca yoxlayaq
          try {
            // Baza cədvəllərinə əlaqə yoxlayırıq
            const { data: schools } = await supabase
              .from('schools')
              .select('*', { count: 'exact', head: true })
              .limit(1);
            
            // Uğurlu SQL əlaqəsi varsa, davam edə bilərik
            console.log('Baza əlaqəsi mövcuddur');
            setFunctionExists(true);
          } catch (err) {
            console.error('Məktəb məlumatları yoxlanması xətası:', err);
            setFunctionExists(false);
          }
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
        <p>Sistem funksiyaları yoxlanılır...</p>
      </div>
    );
  }

  if (!functionExists) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Baza əlaqəsi problemi</AlertTitle>
        <AlertDescription>
          Məktəb administratoru funksiyaları ilə əlaqə yaratmaq mümkün olmadı. Mock data istifadə olunacaq.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SchoolAdminSetupCheck;
