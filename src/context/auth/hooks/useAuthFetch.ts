import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, FullUserData } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface AuthFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: BodyInit | null | object;
  requireAuth?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  skip?: boolean;
  manual?: boolean;
  url?: string;
  contentType?: 'application/json' | 'multipart/form-data';
}

interface AuthFetchResult<T> {
  data: T | null;
  error: any;
  loading: boolean;
  fetchData: (overrideOptions?: Omit<AuthFetchOptions, 'manual'>) => Promise<void>;
}

interface UserResponse {
  user: User | null;
  session: any | null;
  error: any | null;
}

export const useAuthFetch = <T = any>(
  initialUrl: string,
  initialOptions: AuthFetchOptions = {}
): AuthFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const {
    method = 'GET',
    headers: initialHeaders = {},
    body: initialBody = null,
    requireAuth = true,
    onSuccess,
    onError,
    skip = false,
    manual = false,
    url: overrideUrl,
    contentType = 'application/json',
  } = initialOptions;

  const fetchData = useCallback(
    async (overrideOptions: Omit<AuthFetchOptions, 'manual'> = {}) => {
      if (skip) return;

      const url = overrideUrl || initialUrl;
      const {
        method: overrideMethod = method,
        headers: overrideHeaders = initialHeaders,
        body: overrideBody = initialBody,
        requireAuth: overrideRequireAuth = requireAuth,
        onSuccess: overrideOnSuccess = onSuccess,
        onError: overrideOnError = onError,
        contentType: overrideContentType = contentType,
      } = overrideOptions;

      let headers = {
        ...overrideHeaders,
      };

      let body = overrideBody;

      if (overrideContentType === 'application/json' && typeof body === 'object') {
        headers = {
          ...headers,
          'Content-Type': 'application/json',
        };
        body = JSON.stringify(body);
      }

      setLoading(true);
      setError(null);

      try {
        if (overrideRequireAuth) {
          const session = await supabase.auth.getSession();
          if (!session?.data?.session?.access_token) {
            navigate('/login');
            toast({
              title: t('notAuthenticated'),
              description: t('pleaseLogin'),
              variant: 'destructive',
            });
            return;
          }
          headers = {
            ...headers,
            Authorization: `Bearer ${session.data.session.access_token}`,
          };
        }

        const response = await fetch(url, {
          method: overrideMethod,
          headers: headers,
          body: body as any,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || response.statusText);
        }

        const responseData = await response.json();
        setData(responseData);
        overrideOnSuccess?.(responseData);
        onSuccess?.(responseData);
      } catch (err: any) {
        setError(err);
        overrideOnError?.(err);
        onError?.(err);
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [initialUrl, initialOptions, navigate, skip, t, method, initialHeaders, initialBody, requireAuth, onSuccess, onError, contentType, overrideUrl]
  );

  useEffect(() => {
    if (!manual && !skip) {
      fetchData();
    }
  }, [fetchData, manual, skip]);

  return { data, error, loading, fetchData };
};

interface AuthHookResult {
  session: any | null;
  user: User | null;
  loading: boolean;
  error: any;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, additionalData?: any) => Promise<any>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  verifyOTP: (options: { email: string; type: 'email' | 'phone'; token: string }) => Promise<any>;
  getSession: () => Promise<any>;
  updateUserPassword: (newPassword: string) => Promise<any>;
  updateUserEmail: (newEmail: string) => Promise<any>;
  updateUserProfile: (userData: Partial<FullUserData>) => Promise<any>;
  signOut: () => Promise<void>;
}

export const useAuthHook = (): AuthHookResult => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err: any) {
        setError(err);
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        throw error;
      }
      toast({
        title: t('loginSuccess'),
        description: t('loginSuccessDesc'),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err);
      toast({
        title: t('loginFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: t('logoutSuccess'),
        description: t('logoutSuccessDesc'),
      });
      navigate('/login');
    } catch (err: any) {
      setError(err);
      toast({
        title: t('logoutFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, additionalData: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: additionalData,
        },
      });
      if (error) {
        throw error;
      }
      toast({
        title: t('signUpSuccess'),
        description: t('signUpSuccessDesc'),
      });
      navigate('/verify-otp');
      return data;
    } catch (err: any) {
      setError(err);
      toast({
        title: t('signUpFailed'),
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setUser({ ...user, ...updates });
      toast({
        title: t('updateSuccess'),
        description: t('updateSuccessDesc'),
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: t('updateFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) {
        throw error;
      }
      toast({
        title: t('resetPasswordSuccess'),
        description: t('resetPasswordSuccessDesc'),
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: t('resetPasswordFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (options: { email: string; type: 'email' | 'phone'; token: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp(options);
      if (error) {
        throw error;
      }
      toast({
        title: t('verifyOTPSuccess'),
        description: t('verifyOTPSuccessDesc'),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err);
      toast({
        title: t('verifyOTPFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabase.auth.getSession();
      setSession(response.data.session);
      return response.data.session;
    } catch (err: any) {
      setError(err);
      toast({
        title: t('getSessionFailed'),
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      toast({
        title: t('updatePasswordSuccess'),
        description: t('updatePasswordSuccessDesc'),
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: t('updatePasswordFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserEmail = async (newEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        throw error;
      }
      toast({
        title: t('updateEmailSuccess'),
        description: t('updateEmailSuccessDesc'),
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: t('updateEmailFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<FullUserData>) => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setUser({ ...user, ...userData });
      toast({
        title: t('updateProfileSuccess'),
        description: t('updateProfileSuccessDesc'),
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: t('updateProfileFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: t('signOutSuccess'),
        description: t('signOutSuccessDesc'),
      });
      navigate('/login');
    } catch (err: any) {
      setError(err);
      toast({
        title: t('signOutFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user,
    loading,
    error,
    login,
    logout,
    signUp,
    updateUser,
    resetPassword,
    verifyOTP,
    getSession,
    updateUserPassword,
    updateUserEmail,
    updateUserProfile,
    signOut,
  };
};
