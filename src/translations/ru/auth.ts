// Auto-generated file - do not edit manually

export const auth = {
  login: {
    title: 'Вход',
    email: 'Эл. почта',
    password: 'Пароль',
    submit: 'Войти',
    submitting: 'Вход...',
    success: 'Вы успешно вошли в систему',
    error: {
      title: 'Ошибка входа',
      default: 'Неверный email или пароль'
    }
  },
  'resetEmailSent': 'Ссылка для сброса пароля отправлена на вашу почту',
  'forgotPassword': 'Забыли пароль?',
  'forgotPasswordDescription': 'Введите ваш адрес электронной почты',
  'enterEmail': 'Введите ваш адрес электронной почты',
  'sending': 'Отправка...',
  'sendResetEmail': 'Отправить ссылку сброса',
  'backToLogin': 'Вернуться к входу',
  'register': 'Регистрация',
  'registerDescription': 'Создать новый аккаунт',
  'fullName': 'Полное имя',
  'enterFullName': 'Введите ваше полное имя',
  'enterPassword': 'Введите пароль',
  'confirmPassword': 'Подтвердите пароль',
  'registering': 'Регистрация...',
  'alreadyHaveAccount': 'Уже есть аккаунт?',
  'signIn': 'Войти',
  'passwordMismatch': 'Пароли не совпадают',
  'registrationSuccessful': 'Регистрация успешна',
  'registrationSuccessDescription': 'Ваш аккаунт создан',
  'checkEmailVerification': 'Проверьте вашу почту',
  'verificationEmailSent': 'Ссылка подтверждения отправлена',
  'resetPassword': 'Сброс пароля',
  'resetPasswordDescription': 'Установите новый пароль',
  'newPassword': 'Новый пароль',
  'enterNewPassword': 'Введите новый пароль',
  'confirmNewPassword': 'Подтвердите новый пароль',
  'updating': 'Обновление...',
  'updatePassword': 'Обновить пароль',
  'passwordResetSuccess': 'Пароль успешно обновлен'
} as const;

export type Auth = typeof auth;
