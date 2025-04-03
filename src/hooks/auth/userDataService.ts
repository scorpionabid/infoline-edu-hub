import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserData } from './userDataService';
import { toast } from 'sonner';
import { FullUserData } from '@/types/supabase';

// Supabase URL-ni mühit dəyişənlərdən əldə edirik
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

/**
 * İstifadəçi məlumatlarını Supabase-dən əldə edir
 * @param userId İstifadəçi ID-si
 * @returns İstifadəçi məlumatları
 */
export const fetchUserData = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Profil məlumatlarını əldə edirik
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // İstifadəçi rollarını əldə edirik
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError) throw roleError;
    
    // Email məlumatını əldə edirik
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (userError) {
      // Əgər auth.users cədvəlinə giriş icazəsi yoxdursa
      console.warn('Auth users cədvəlinə giriş edilə bilmədi, simulyasiya məlumatlar istifadə edilir');
    }
    
    // İstifadəçi məlumatlarını birləşdiririk
    const userFullData: FullUserData = {
      id: userId,
      email: userData?.email || profile?.email || '',
      full_name: profile?.full_name || '',
      name: profile?.full_name || '',
      phone: profile?.phone || '',
      position: profile?.position || '',
      language: profile?.language as any || 'az',
      avatar: profile?.avatar || '',
      status: profile?.status as any || 'active',
      role: userRole?.role || 'schooladmin',
      region_id: userRole?.region_id || null,
      sector_id: userRole?.sector_id || null,
      school_id: userRole?.school_id || null,
      created_at: profile?.created_at || '',
      updated_at: profile?.updated_at || '',
      last_login: profile?.last_login || '',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    };
    
    return userFullData;
  } catch (error) {
    console.error('İstifadəçi məlumatları əldə edilərkən xəta baş verdi:', error);
    return null;
  }
};
