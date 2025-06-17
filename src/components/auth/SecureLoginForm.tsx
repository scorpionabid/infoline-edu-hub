
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useRateLimit } from '@/hooks/auth/useRateLimit';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';
import { validateInput, sanitizeInput, generateCSRFToken } from '@/config/security';
import { securityLogger, getClientContext } from '@/utils/securityLogger';
import { secureConsole } from '@/utils/productionUtils';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface SecureLoginFormProps {
  error?: string | null;
  clearError?: () => void;
}

const SecureLoginForm: React.FC<SecureLoginFormProps> = ({ error, clearError }) => {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [csrfToken] = useState(() => generateCSRFToken());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  // Enhanced rate limiting with user context
  const { isBlocked, remainingAttempts, resetTime, checkRateLimit, recordAttempt } = useRateLimit(
    `login_${formData.email || 'anonymous'}`,
    5, // max attempts
    15 * 60 * 1000 // 15 minutes
  );

  useEffect(() => {
    if (isBlocked && resetTime) {
      securityLogger.logRateLimit('login', {
        ...getClientContext(),
        action: 'login_blocked',
        userId: formData.email
      });
      
      const timer = setInterval(() => {
        if (new Date() > resetTime) {
          window.location.reload();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, resetTime, formData.email]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Enhanced email validation
    if (!formData.email) {
      errors.email = t?.('auth.validation.email.required') || 'Email is required';
    } else if (!validateInput.email(formData.email)) {
      errors.email = t?.('auth.validation.email.invalid') || 'Invalid email format';
      securityLogger.logValidationFailure('email', formData.email, getClientContext());
    }
    
    // Enhanced password validation
    if (!formData.password) {
      errors.password = t?.('auth.validation.password.required') || 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = t?.('auth.validation.password.minLength') || 'Password must be at least 6 characters';
    }
    
    // Check for suspicious patterns
    if (formData.email && !validateInput.text(formData.email)) {
      errors.email = 'Invalid characters detected';
      securityLogger.logSuspiciousActivity('malicious_input', {
        field: 'email',
        value: formData.email.substring(0, 50)
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isBlocked) return;
    
    // Log login attempt
    securityLogger.logAuthEvent('login_attempt', {
      ...getClientContext(),
      userId: formData.email
    });
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Check rate limit
    const rateLimitAllowed = await checkRateLimit();
    if (!rateLimitAllowed) {
      toast.error(t?.('auth.error.rateLimited') || 'Too many login attempts. Please try again later.');
      return;
    }
    
    setIsSubmitting(true);
    
    if (clearError) {
      clearError();
    }
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(formData.email.toLowerCase());
      const sanitizedPassword = formData.password; // Don't sanitize password, just validate
      
      secureConsole.log('[SecureLoginForm] Starting secure login process...');
      await signIn(sanitizedEmail, sanitizedPassword);
      
      // Log successful login
      securityLogger.logAuthEvent('login_success', {
        ...getClientContext(),
        userId: sanitizedEmail
      });
      
      secureConsole.log('[SecureLoginForm] Login successful, navigating...');
      navigate('/dashboard');
      toast.success(t?.('auth.login.success') || 'Login successful');
      
    } catch (error: any) {
      secureConsole.error('[SecureLoginForm] Login error:', error);
      
      // Log failed login attempt
      securityLogger.logAuthEvent('login_failure', {
        ...getClientContext(),
        userId: formData.email,
        severity: 'high'
      });
      
      // Record failed attempt for rate limiting
      await recordAttempt();
      
      // Sanitize error message to prevent XSS
      const errorMessage = sanitizeInput(error.message || 'Login failed');
      
      toast.error(t?.('auth.login.error.title') || 'Login failed', {
        description: errorMessage || t?.('auth.login.error.default') || 'Incorrect email or password'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Enhanced input sanitization
    const sanitizedValue = sanitizeInput(value);
    
    // Detect suspicious input patterns
    if (value !== sanitizedValue) {
      securityLogger.logSuspiciousActivity('input_sanitized', {
        field: name,
        original: value.substring(0, 50),
        sanitized: sanitizedValue.substring(0, 50)
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (isBlocked) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            {t?.('auth.security.blocked.title') || 'Account Temporarily Blocked'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t?.('auth.security.blocked.message') || 'Too many failed login attempts. Please try again later.'}
              {resetTime && (
                <div className="mt-2 text-sm">
                  Reset time: {resetTime.toLocaleTimeString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t?.('auth.login.title') || 'Secure Login'}
        </CardTitle>
        {remainingAttempts < 5 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {remainingAttempts} attempts remaining before temporary lockout
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="csrf_token" value={csrfToken} />
          
          <div>
            <Input
              name="email"
              type="email"
              placeholder={t?.('auth.login.email') || 'Email'}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading || isSubmitting}
              className={validationErrors.email ? 'border-red-500' : ''}
              autoComplete="email"
              maxLength={100}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>
          
          <div>
            <Input
              name="password"
              type="password"
              placeholder={t?.('auth.login.password') || 'Password'}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading || isSubmitting}
              className={validationErrors.password ? 'border-red-500' : ''}
              autoComplete="current-password"
              maxLength={100}
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{sanitizeInput(error)}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting || isBlocked} 
            className="w-full"
          >
            {isLoading || isSubmitting 
              ? t?.('auth.login.submitting') || 'Logging in...' 
              : t?.('auth.login.submit') || 'Log in'}
          </Button>
        </form>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <Shield className="h-3 w-3 inline mr-1" />
          Secured with rate limiting and input validation
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureLoginForm;
