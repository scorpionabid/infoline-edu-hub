
// Logout prosesinin sistemli işləməsini təmin edək
export const signOut = async (setLoading: (loading: boolean) => void, setUser: (user: FullUserData | null) => void, setSession: (session: any | null) => void) => {
  try {
    setLoading(true);
    console.log('Çıxış edilir...');
    
    // State-i təmizləmək üçün əvvəlcə user və sessiyanı null edirik (bundan sonra supabase.auth.signOut() çağrılacağını gözləyirik)
    setUser(null);
    setSession(null);
    
    // Supabase-dən çıxış
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase çıxış xətası:', error);
      throw error;
    }
    
    console.log('Supabase-dən uğurla çıxış edildi');
    
    toast.success('Sistemdən uğurla çıxış edildi');
    return true;
  } catch (error: any) {
    console.error('Çıxış zamanı xəta:', error);
    toast.error('Çıxış uğursuz oldu', {
      description: error.message || 'Bilinməyən xəta'
    });
    throw error;
  } finally {
    setLoading(false);
  }
};
