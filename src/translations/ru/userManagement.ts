
// User management translation module
export const userManagement = {
  title: 'Управление пользователями',
  description: 'Управление пользователями, ролями и разрешениями',
  
  // Basic actions
  actions: {
    create_user: 'Создать пользователя',
    edit_user: 'Редактировать пользователя',
    delete_user: 'Удалить пользователя',
    view_user: 'Просмотр пользователя',
    assign_role: 'Назначить роль',
    change_password: 'Изменить пароль',
    reset_password: 'Сбросить пароль',
    activate_user: 'Активировать пользователя',
    deactivate_user: 'Деактивировать пользователя',
    export_users: 'Экспортировать пользователей',
    import_users: 'Импортировать пользователей',
    bulk_actions: 'Массовые действия',
    invite_user: 'Пригласить пользователя',
    send_notification: 'Отправить уведомление'
  },

  // User form
  form: {
    personal_info: 'Личная информация',
    full_name: 'Полное имя',
    first_name: 'Имя',
    last_name: 'Фамилия',
    email: 'Email адрес',
    phone: 'Номер телефона',
    position: 'Должность',
    department: 'Отдел',
    
    account_info: 'Информация об аккаунте',
    username: 'Имя пользователя',
    password: 'Пароль',
    confirm_password: 'Подтвердить пароль',
    role: 'Роль',
    permissions: 'Разрешения',
    status: 'Статус',
    
    location_info: 'Информация о местоположении',
    region: 'Регион',
    sector: 'Сектор',
    school: 'Школа',
    
    preferences: 'Настройки',
    language: 'Язык',
    timezone: 'Часовой пояс',
    notifications: 'Уведомления'
  },

  // Roles
  roles: {
    superadmin: 'Супер Админ',
    regionadmin: 'Региональный Админ',
    sectoradmin: 'Админ Сектора',
    schooladmin: 'Админ Школы',
    user: 'Пользователь',
    viewer: 'Просмотрщик',
    editor: 'Редактор',
    moderator: 'Модератор'
  },

  // Statuses
  statuses: {
    active: 'Активный',
    inactive: 'Неактивный',
    pending: 'Ожидает',
    suspended: 'Приостановлен',
    banned: 'Заблокирован',
    invited: 'Приглашен',
    expired: 'Истек'
  },

  // Table headers
  table: {
    name: 'Имя',
    email: 'Email',
    role: 'Роль',
    status: 'Статус',
    region: 'Регион',
    sector: 'Сектор',
    school: 'Школа',
    last_login: 'Последний вход',
    created_at: 'Создан',
    actions: 'Действия',
    select: 'Выбрать',
    no_users: 'Пользователи не найдены',
    loading_users: 'Загрузка пользователей...'
  },

  // Messages
  // Page sections
  tabs: {
    overview: 'Обзор',
    users: 'Пользователи',
    roles: 'Роли',
    permissions: 'Разрешения',
    activity: 'Активность',
    settings: 'Настройки',
    audit_log: 'Журнал аудита'
  },

  messages: {
    user_created: 'Пользователь успешно создан',
    user_updated: 'Информация пользователя обновлена',
    user_deleted: 'Пользователь удален',
    user_activated: 'Пользователь активирован',
    user_deactivated: 'Пользователь деактивирован',
    password_reset: 'Пароль сброшен',
    password_changed: 'Пароль изменен',
    invitation_sent: 'Приглашение отправлено',
    notification_sent: 'Уведомление отправлено',
    bulk_action_completed: 'Массовое действие завершено',
    
    // Error messages
    user_not_found: 'Пользователь не найден',
    email_already_exists: 'Этот email уже существует',
    username_taken: 'Это имя пользователя уже занято',
    invalid_role: 'Недействительная роль',
    permission_denied: 'Доступ запрещен',
    cannot_delete_self: 'Вы не можете удалить себя',
    cannot_delete_admin: 'Нельзя удалить администратора',
    
    // Confirmation messages
    confirm_delete: 'Вы уверены, что хотите удалить этого пользователя?',
    confirm_deactivate: 'Вы уверены, что хотите деактивировать этого пользователя?',
    confirm_bulk_delete: 'Вы уверены, что хотите удалить {{count}} пользователей?',
    confirm_password_reset: 'Вы уверены, что хотите сбросить пароль этого пользователя?'
  },

  // Statistics
  stats: {
    total_users: 'Всего пользователей',
    active_users: 'Активные пользователи',
    inactive_users: 'Неактивные пользователи',
    pending_users: 'Ожидающие пользователи',
    online_users: 'Онлайн пользователи',
    new_this_month: 'Новых в этом месяце',
    admins: 'Администраторы',
    regular_users: 'Обычные пользователи',
    last_login_today: 'Входили сегодня',
    never_logged: 'Никогда не входили'
  }
} as const;

// ADDED: Missing translation keys for language switcher
export const language_switcher = {
  label: 'Выберите язык',
  current_language: 'Текущий язык',
  change_language: 'Изменить язык'
};

// ADDED: Language names
export const languages = {
  az: 'Azərbaycan',
  en: 'English', 
  ru: 'Русский',
  tr: 'Türkçe'
};

export type UserManagement = typeof userManagement;
export default userManagement;
