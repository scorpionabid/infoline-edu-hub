
import { supabase } from '@/lib/supabase';
import { FullUserData, UserStatus } from '@/types/auth';
import { Session, User } from '@supabase/supabase-js';

// Cache keys
const AUTH_USER_CACHE_KEY = 'auth:user';
const SESSION_CACHE_KEY = 'auth:session';

export class AuthService {
  // Cache timeout in milliseconds
  private static CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

  // Store user data in memory cache with timestamp
  private static storeUserInCache(userData: FullUserData): void {
    try {
      const cacheData = {
        userData,
        timestamp: Date.now(),
      };
      localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error storing user data in cache:', error);
    }
  }

  // Get user data from memory cache if not expired
  private static getUserFromCache(): FullUserData | null {
    try {
      const cacheData = localStorage.getItem(AUTH_USER_CACHE_KEY);
      if (!cacheData) return null;
      
      const { userData, timestamp } = JSON.parse(cacheData);
      
      // Check if cache is expired
      if (Date.now() - timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(AUTH_USER_CACHE_KEY);
        return null;
      }
      
      return userData;
    } catch (error) {
      console.error('Error retrieving user data from cache:', error);
      return null;
    }
  }

  // Store session in cache
  private static storeSessionInCache(session: Session): void {
    try {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error storing session in cache:', error);
    }
  }

  // Clear cached data
  public static clearCache(): void {
    localStorage.removeItem(AUTH_USER_CACHE_KEY);
    localStorage.removeItem(SESSION_CACHE_KEY);
  }

  // Login with email and password
  public static async login(email: string, password: string): Promise<{
    user: FullUserData | null;
    session: Session | null;
    error: Error | null;
  }> {
    try {
      // Clear any previous cache
      this.clearCache();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        // Store session in cache
        this.storeSessionInCache(data.session);
        
        // Fetch and cache user data
        const userData = await this.fetchUserData(data.session);
        
        return { 
          user: userData, 
          session: data.session, 
          error: null 
        };
      }
      
      return { user: null, session: null, error: null };
      
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        user: null, 
        session: null, 
        error 
      };
    }
  }

  // Logout user
  public static async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear cache on logout
      this.clearCache();
      
      return { error: null };
      
    } catch (error: any) {
      console.error('Logout error:', error);
      return { error };
    }
  }

  // Get current session
  public static async getSession(): Promise<{ 
    session: Session | null; 
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        this.storeSessionInCache(data.session);
      }
      
      return { session: data.session, error: null };
      
    } catch (error: any) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  }

  // Refresh session
  public static async refreshSession(): Promise<{
    session: Session | null;
    error: Error | null;
  }> {
    try {
      // First, check if we have an existing session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data && data.session) {
        this.storeSessionInCache(data.session);
      }
      
      return { session: data.session, error: null };
      
    } catch (error: any) {
      console.error('Refresh session error:', error);
      return { session: null, error };
    }
  }

  // Fetch user data
  public static async fetchUserData(
    session: Session | null = null
  ): Promise<FullUserData | null> {
    try {
      // If no session provided, get the current session
      if (!session) {
        const { session: currentSession, error } = await this.getSession();
        if (error || !currentSession) return null;
        session = currentSession;
      }
      
      // Check if user exists in the session
      if (!session.user) return null;
      
      // Try to get user from cache first
      const cachedUser = this.getUserFromCache();
      if (cachedUser && cachedUser.id === session.user.id) {
        return cachedUser;
      }
      
      // Fetch user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleError);
      }
      
      // Fetch user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }
      
      // Build user data object
      const userData: FullUserData = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: profileData?.full_name || session.user.email?.split('@')[0] || 'User',
        role: roleData?.role || 'schooladmin',
        region_id: roleData?.region_id,
        sector_id: roleData?.sector_id,
        school_id: roleData?.school_id,
        phone: profileData?.phone,
        position: profileData?.position,
        language: profileData?.language || 'az',
        avatar: profileData?.avatar,
        status: (profileData?.status as UserStatus) || 'active',
        last_login: profileData?.last_login || new Date().toISOString(),
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString(),
        notification_settings: {
          email: true,
          push: true,
          app: true
        }
      };
      
      // Store user in cache
      this.storeUserInCache(userData);
      
      return userData;
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
}
