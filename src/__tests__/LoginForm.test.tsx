
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LoginForm from '@/components/auth/LoginForm';
import * as AuthContext from '@/context/auth';
import * as LanguageContext from '@/context/LanguageContext';

// LanguageSelector mock
vi.mock('@/components/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector">Language Selector</div>
}));

// Mock translations
const mockTranslations = {
  loginTitle: 'Daxil ol',
  loginButton: 'Daxil ol',
  loginDescription: 'Hesabınıza daxil olun',
  email: 'E-poçt',
  password: 'Şifrə',
  emailRequired: 'E-poçt tələb olunur',
  passwordRequired: 'Şifrə tələb olunur',
  invalidEmail: 'Düzgün e-poçt daxil edin',
  passwordTooShort: 'Şifrə ən azı 6 simvol olmalıdır',
  forgotPassword: 'Şifrəni unutmusunuz?',
  loggingIn: 'Daxil olunur...',
  loginSuccess: 'Uğurla daxil oldunuz',
  invalidCredentials: 'Yanlış e-poçt və ya şifrə',
  unexpectedError: 'Gözlənilməz xəta baş verdi',
};

// Mock language context
const mockLanguageContext = () => {
  vi.spyOn(LanguageContext, 'useLanguage').mockReturnValue({
    t: (key) => mockTranslations[key] || key,
    setLanguage: vi.fn(),
    languages: {
      az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
      en: { nativeName: 'English', flag: '🇬🇧' },
      tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
      ru: { nativeName: 'Русский', flag: '🇷🇺' }
    },
    currentLanguage: 'az'
  });
};

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Helper to mock useAuth - xətaları aradan qaldırmaq üçün bütün AuthContextType funksiyaları əlavə edildi
function mockUseAuth(loginImpl = vi.fn().mockResolvedValue(true)) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    login: loginImpl,
    logout: vi.fn(),
    signOut: vi.fn(),
    updateUser: vi.fn(),
    clearError: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    refreshUser: vi.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });
}

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLanguageContext();
  });

  it('formu düzgün göstərir və məcburi sahələri yoxlayır', async () => {
    const loginMock = vi.fn().mockResolvedValue(true);
    mockUseAuth(loginMock);
    const clearErrorMock = vi.fn();
    
    render(<LoginForm error={null} clearError={clearErrorMock} />);
    
    // Form elementlərini yoxlayın
    expect(screen.getByLabelText(/E-poçt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Şifrə/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daxil ol/i })).toBeInTheDocument();
    
    // Boş formla təqdim etməyi yoxlayaq - validasiya xətaları olmalıdır
    fireEvent.click(screen.getByRole('button', { name: /Daxil ol/i }));
    
    // Məcburi sahə xətaları göstərilməlidir
    await waitFor(() => {
      expect(screen.getByText(mockTranslations.emailRequired)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.passwordRequired)).toBeInTheDocument();
    });
    
    // Login funksiyası çağırılmalıdır
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('doğru məlumatlarla login olunur', async () => {
    const loginMock = vi.fn().mockResolvedValue(true);
    mockUseAuth(loginMock);
    const clearErrorMock = vi.fn();
    
    render(<LoginForm error={null} clearError={clearErrorMock} />);
    
    // Input-ları doldurun
    fireEvent.change(screen.getByLabelText(/E-poçt/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Şifrə/i), {
      target: { value: 'password123' }
    });
    
    // Login düyməsinə klikləyin
    fireEvent.click(screen.getByRole('button', { name: /Daxil ol/i }));
    
    // Login funksiyasının çağırıldığını yoxlayın
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('şifrəni göstər/gizlət funksiyası işləyir', () => {
    mockUseAuth();
    
    render(<LoginForm error={null} clearError={vi.fn()} />);
    
    // Əvvəlcə şifrə gizlidir
    const passwordInput = screen.getByLabelText(/Şifrə/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Göstər düyməsinə klikləyin
    // Qeyd: querySelector ilə düyməni seçirik çünki aria-label yoxdur
    const toggleButton = document.querySelector('button.absolute.inset-y-0.right-0');
    expect(toggleButton).not.toBeNull();
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
      
      // İndi şifrə görünməlidir
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Yenidən gizlətmək üçün düyməyə klikləyin
      fireEvent.click(toggleButton);
      
      // Şifrə yenidən gizli olmalıdır
      expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  it('login zamanı xəta göstərilir', () => {
    mockUseAuth();
    const testError = "Test xəta mesajı";
    
    render(<LoginForm error={testError} clearError={vi.fn()} />);
    
    // Xəta mesajı göstərilməlidir
    expect(screen.getByText(testError)).toBeInTheDocument();
  });

  it('login zamanı yüklənmə göstərilir', async () => {
    // Login funksiyası gec cavab verəcək
    const loginMock = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 100);
      });
    });
    
    mockUseAuth(loginMock);
    
    render(<LoginForm error={null} clearError={vi.fn()} />);
    
    // Input-ları doldurun
    fireEvent.change(screen.getByLabelText(/E-poçt/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Şifrə/i), {
      target: { value: 'password123' }
    });
    
    // Form-u təqdim edin
    fireEvent.submit(screen.getByRole('button', { name: /Daxil ol/i }));
    
    // Düyməni axtarın və disabled olub-olmadığını yoxlayın
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Daxil ol/i });
      expect(button).toHaveAttribute('disabled');
      
      // Daha düzgün yanaşma: spinner'i axtarırıq
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });
});
