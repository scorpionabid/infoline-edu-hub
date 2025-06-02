import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

const useUserDataService = (userId: string | undefined) => {
  const [userData, setUserData] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.functions.invoke('get-full-user-data', {
          body: { userIdParam: userId },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data || data.length === 0) {
          setUserData(null);
        } else {
          const formattedData = formatUserData(data[0]);
          setUserData(formattedData);
        }
      } catch (err: any) {
        setError(err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { userData, loading, error };
};

export default useUserDataService;

const formatUserData = (userData: any): FullUserData => {
  return {
    id: userData.id,
    email: userData.email || '',
    full_name: userData.full_name || userData.user_metadata?.full_name || '',
    fullName: userData.full_name || userData.user_metadata?.full_name || '',
    name: userData.full_name || userData.user_metadata?.full_name || '', // Support name property
    avatar: userData.avatar || '',
    role: userData.role,
    region_id: userData.region_id,
    regionId: userData.region_id,
    sector_id: userData.sector_id,
    sectorId: userData.sector_id,
    school_id: userData.school_id,
    schoolId: userData.school_id,
    phone: userData.phone,
    position: userData.user_position,
    language: userData.language,
    status: userData.status,
    last_login: userData.last_login,
    lastLogin: userData.last_login,
    created_at: userData.created_at,
    createdAt: userData.created_at,
    updated_at: userData.updated_at,
    updatedAt: userData.updated_at,
    notificationSettings: userData.notification_settings
  } as FullUserData;
};
