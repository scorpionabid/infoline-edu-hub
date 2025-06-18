// Authentication translation module
export const auth = {
  // Login
  login: {
    title: 'Giriş',
    email: 'Email',
    emailPlaceholder: 'Email ünvanınızı daxil edin',
    password: 'Şifrə',
    passwordPlaceholder: 'Şifrənizi daxil edin',
    submit: 'Daxil ol',
    submitting: 'Daxil olunur...',
    success: 'Uğurla daxil oldunuz',
    forgotPassword: 'Şifrəni unutdunuz?',
    noAccount: 'Hesabınız yoxdur?',
    signUp: 'Qeydiyyatdan keçin',
    error: {
      title: 'Giriş uğursuz oldu',
      default: 'Email və ya şifrə yanlışdır',
      invalidCredentials: 'Yanlış email və ya şifrə',
      accountLocked: 'Hesabınız müvəqqəti olaraq bağlıdır',
      tooManyAttempts: 'Çox sayda uğursuz cəhd. Zəhmət olmasa bir neçə dəqiqədən sonra yenidən cəhd edin',
      networkError: 'Şəbəkə xətası. Zəhmət olmasa internet bağlantınızı yoxlayın',
      serverError: 'Server xətası. Zəhmət olmasa daha sonra yenidən cəhd edin'
    }
  },

  // Logout
  logout: {
    title: 'Çıxış',
    confirm: 'Hesabdan çıxmaq istədiyinizə əminsiniz?',
    success: 'Uğurla çıxış etdiniz',
    error: 'Çıxış zamanı xəta baş verdi'
  },

  // Password Reset
  resetPassword: {
    title: 'Şifrəni sıfırla',
    email: 'Email',
    emailPlaceholder: 'Qeydiyyatlı email ünvanınızı daxil edin',
    newPassword: 'Yeni şifrə',
    newPasswordPlaceholder: 'Yeni şifrənizi daxil edin',
    confirmNewPassword: 'Yeni şifrəni təsdiqlə',
    passwordResetSuccess: 'Şifrəniz uğurla sıfırlandı',
    resetPasswordDescription: 'Yeni şifrənizi təyin edin',
    enterNewPassword: 'Yeni şifrənizi daxil edin',
    confirmPassword: 'Şifrəni təsdiqlə',
    confirmPasswordPlaceholder: 'Yeni şifrənizi təkrar daxil edin',
    submit: 'Şifrəni sıfırla',
    submitting: 'Göndərilir...',
    success: 'Şifrə uğurla sıfırlandı',
    passwordMismatch: 'Şifrələr uyğun gəlmir',
    backToLogin: 'Girişə qayıt',
    sendLink: 'Sıfırlama linki göndər',
    backToLogin: 'Giriş səhifəsinə qayıt',
    error: {
      title: 'Şifrə sıfırlama uğursuz oldu',
      invalidToken: 'Keçərsiz və ya müddəti bitmiş token',
      tokenExpired: 'Sıfırlama linkinin müddəti bitib',
      userNotFound: 'Bu email ünvanı ilə istifadəçi tapılmadı',
      passwordMismatch: 'Şifrələr üst-üstə düşmür',
      weakPassword: 'Zəif şifrə. Zəhmət olmasa daha güclü şifrə istifadə edin',
      default: 'Şifrə sıfırlanarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin'
    },
    instructions: 'Şifrənizi sıfırlamaq üçün email ünvanınızı daxil edin. Sizə sıfırlama linki göndəriləcək.',
    checkEmail: 'Sıfırlama linki email ünvanınıza göndərildi. Zəhmət olmasa emailinizi yoxlayın.',
    resetSuccess: 'Şifrəniz uğurla sıfırlandı. İndi yeni şifrənizlə daxil ola bilərsiniz.'
  },

  // Update Password
  updatePassword: {
    title: 'Şifrəni yenilə',
    currentPassword: 'Hazırkı şifrə',
    newPassword: 'Yeni şifrə',
    confirmPassword: 'Yeni şifrəni təsdiqlə',
    submit: 'Şifrəni yenilə',
    submitting: 'Yenilənir...',
    success: 'Şifrə uğurla yeniləndi',
    error: {
      title: 'Şifrə yenilənmədi',
      currentPasswordIncorrect: 'Cari şifrə yanlışdır',
      passwordMismatch: 'Yeni şifrələr uyğun gəlmir',
      weakPassword: 'Zəif şifrə. Zəhmət olmasa daha güclü şifrə istifadə edin',
      default: 'Şifrə yenilənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin'
    },
    passwordRequirements: 'Şifrə ən azı 8 simvoldan ibarət olmalı, ən azı bir böyük hərf, bir kiçik hərf, bir rəqəm və bir xüsusi simvol ehtiva etməlidir.'
  },

  // Common
  validation: {
    required: 'Bu sahə tələb olunur',
    email: 'Düzgün email ünvanı daxil edin',
    password: {
      minLength: 'Şifrə ən azı {min} simvol olmalıdır',
      oneLowercase: 'Ən azı bir kiçik hərf daxil edin',
      oneUppercase: 'Ən azı bir böyük hərf daxil edin',
      oneNumber: 'Ən azı bir rəqəm daxil edin',
      oneSpecial: 'Ən azı bir xüsusi simvol daxil edin',
      match: 'Şifrələr uyğun gəlmir'
    },
    token: 'Keçərsiz token',
    generic: 'Doğrulama xətası'
  },

  // Session
  session: {
    expired: 'Sessiyanızın müddəti bitib. Zəhmət olmasa yenidən daxil olun.',
    unauthorized: 'Giriş tələb olunur. Zəhmət olmasa hesabınıza daxil olun.',
    forbidden: 'Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur.',
    loading: 'Yoxlanılır...',
    redirecting: 'Yönləndirilir...'
  },

  // OAuth
  oauth: {
    continueWith: 'İlə davam et',
    google: 'Google ilə daxil ol',
    microsoft: 'Microsoft ilə daxil ol',
    apple: 'Apple ilə daxil ol',
    facebook: 'Facebook ilə daxil ol',
    github: 'GitHub ilə daxil ol',
    error: 'Giriş uğursuz oldu. Zəhmət olmasa başqa bir üsulla cəhd edin.'
  },

  // 2FA
  twoFactorAuth: {
    title: 'İki faktorlu autentifikasiya',
    enterCode: 'Təhlükəsizlik kodunu daxil edin',
    code: 'Təhlükəsizlik kodu',
    submit: 'Təsdiq et',
    backToLogin: 'Giriş səhifəsinə qayıt',
    error: {
      invalidCode: 'Yanlış təhlükəsizlik kodu',
      default: 'Doğrulama uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.'
    },
    helpText: 'Tətbiqinizdəki təhlükəsizlik kodunu daxil edin və ya ehtiyat kodlarınızdan birini istifadə edin.'
  },

  // Account Verification
  verifyAccount: {
    title: 'Hesabı təsdiqlə',
    verifying: 'Təsdiqlənir...',
    success: 'Hesabınız uğurla təsdiqləndi',
    error: 'Hesab təsdiqlənmədi. Keçərsiz və ya müddəti bitmiş token.',
    resend: 'Təsdiq emaili yenidən göndər',
    checkEmail: 'Təsdiq linki email ünvanınıza göndərildi. Zəhmət olmasa emailinizi yoxlayın.',
    notReceived: 'Email almadınız?',
    clickToResend: 'Yenidən göndərmək üçün bura vurun'
  },

  // Common status messages
  updating: 'Yenilənir...',
  loading: 'Yüklənir...',
  success: 'Əməliyyat uğurla tamamlandı',
  error: 'Xəta baş verdi',
  retry: 'Yenidən cəhd et',
  back: 'Geri',
  next: 'Növbəti',
  cancel: 'Ləğv et',
  confirm: 'Təsdiq et',
  save: 'Yadda saxla',
  close: 'Bağla',
  
  // Error messages
  errors: {
    unexpected: 'Gözlənilməyən xəta baş verdi',
    network: 'Şəbəkə xətası. Zəhmət olmasa internet bağlantınızı yoxlayın',
    server: 'Server xətası. Zəhmət olmasa daha sonra yenidən cəhd edin',
    unauthorized: 'Giriş tələb olunur',
    forbidden: 'Bu əməliyyat üçün icazəniz yoxdur',
    notFound: 'Məlumat tapılmadı',
    validation: 'Doğrulama xətası. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın',
    timeout: 'Sorğunun müddəti bitdi. Zəhmət olmasa yenidən cəhd edin',
    rateLimit: 'Çox sayda sorğu göndərdiniz. Zəhmət olmasa bir az gözləyib yenidən cəhd edin'
  },
  
  // Password strength
  passwordStrength: {
    weak: 'Zəif',
    fair: 'Orta',
    good: 'Yaxşı',
    strong: 'Güclü',
    veryStrong: 'Çox güclü'
  },
  
  // Account recovery
  accountRecovery: {
    title: 'Hesab bərpası',
    description: 'Hesabınıza daxil ola bilmirsiniz?',
    options: {
      email: 'Email ilə bərpa',
      phone: 'Telefon nömrəsi ilə bərpa',
      securityQuestions: 'Təhlükəsizlik sualları ilə bərpa'
    },
    submit: 'Bərpa et',
    backToLogin: 'Giriş səhifəsinə qayıt',
    success: 'Bərpa təlimatları email ünvanınıza göndərildi',
    error: 'Hesab bərpası zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
  },
  
  // Session management
  sessionManagement: {
    title: 'Sessiyalarım',
    currentDevice: 'Cari cihaz',
    activeSessions: 'Aktiv sessiyalar',
    lastActive: 'Son aktivlik',
    device: 'Cihaz',
    ipAddress: 'IP ünvanı',
    location: 'Yer',
    signOutAllDevices: 'Bütün cihazlardan çıxış et',
    confirmSignOutAll: 'Bütün digər cihazlardan çıxış etmək istədiyinizə əminsiniz?',
    signOut: 'Çıxış et',
    signOutSuccess: 'Uğurla çıxış edildi',
    signOutError: 'Çıxış zamanı xəta baş verdi',
    thisDevice: 'Bu cihaz',
    unknownDevice: 'Naməlum cihaz',
    unknownLocation: 'Naməlum yer',
    currentSession: 'Cari sessiya'
  }
} as const;

export type Auth = typeof auth;
