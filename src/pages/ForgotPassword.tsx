import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import LoginBackgroundDecorations from '@/components/auth/LoginBackgroundDecorations';
import LoginHeader from '@/components/auth/LoginHeader';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email ünvanı daxil edin');
      return;
    }
    
    try {
      setLoading(true);
      await sendPasswordResetEmail(email);
      navigate('/login', { state: { resetEmailSent: true } });
    } catch (error: any) {
      toast.error('Şifrə sıfırlama xətası', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden grid-pattern">
      <LoginBackgroundDecorations />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-lg w-full max-w-md p-8 shadow-xl"
      >
        <LoginHeader title="Şifrəni sıfırla" description="Şifrə sıfırlamaq üçün e-poçt ünvanınızı daxil edin" />
        
        <form className="space-y-6 mt-8" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">E-poçt ünvanı</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          >
            {loading ? 'Göndərilir...' : 'Şifrə sıfırlama linkini göndər'}
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

export default ForgotPassword;
