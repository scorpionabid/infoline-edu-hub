
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LoginBackgroundDecorations from '@/components/auth/LoginBackgroundDecorations';
import LoginHeader from '@/components/auth/LoginHeader';
import { toast } from 'sonner';

const ResetPassword = () => {
  const { confirmPasswordReset, isAuthenticated, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // İstifadəçi daxil olubsa, yönləndirək
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Şifrələr uyğun deyil');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Şifrə ən az 6 simvol olmalıdır');
      return;
    }
    
    try {
      setLoading(true);
      await confirmPasswordReset(password);
      toast.success('Şifrəniz yeniləndi');
      navigate('/login', { state: { passwordReset: true } });
    } catch (error: any) {
      toast.error('Şifrə yeniləmə xətası', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden grid-pattern">
      <LoginBackgroundDecorations />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-lg w-full max-w-md p-8 shadow-xl"
      >
        <LoginHeader title="Yeni şifrə yaradın" description="Yeni şifrənizi daxil edin" />
        
        <form className="space-y-6 mt-8" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Yeni şifrə</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Şifrəni təsdiqlə</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          >
            {loading ? 'Yenilənir...' : 'Şifrəni yenilə'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
            >
              Giriş səhifəsinə qayıt
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
