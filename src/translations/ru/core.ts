// Core translation module - Common texts
export const core = {
  // Basic actions
  actions: {
    save: 'Сохранить',
    cancel: 'Отменить',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    create: 'Создать',
    search: 'Поиск',
    filter: 'Фильтр',
    export: 'Экспорт',
    import: 'Импорт',
    refresh: 'Обновить',
    upload: 'Загрузить',
    download: 'Скачать',
    submit: 'Отправить',
    confirm: 'Подтвердить',
    reject: 'Отклонить',
    approve: 'Одобрить',
    close: 'Закрыть',
    open: 'Открыть',
    view: 'Просмотр',
    details: 'Детали',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    first: 'Первый',
    last: 'Последний',
    select: 'Выбрать',
    selectAll: 'Выбрать все',
    deselectAll: 'Отменить выбор',
    clear: 'Очистить',
    reset: 'Сбросить',
    apply: 'Применить'
  },

  // Loading states
  loading: {
    default: 'Загрузка...',
    saving: 'Сохранение...',
    deleting: 'Удаление...',
    creating: 'Создание...',
    updating: 'Обновление...',
    uploading: 'Загрузка...',
    downloading: 'Скачивание...',
    processing: 'Обработка...',
    sending: 'Отправка...',
    loading: 'Загрузка...',
    please_wait: 'Пожалуйста подождите...'
  },

  // Status
  status: {
    active: 'Активный',
    inactive: 'Неактивный',
    pending: 'Ожидает',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    completed: 'Завершено',
    in_progress: 'В процессе',
    draft: 'Черновик',
    published: 'Опубликовано',
    archived: 'Архивировано',
    expired: 'Истекло',
    scheduled: 'Запланировано',
    paused: 'Приостановлено',
    cancelled: 'Отменено'
  },

  // Common fields
  fields: {
    name: 'Имя',
    title: 'Заголовок',
    description: 'Описание',
    date: 'Дата',
    time: 'Время',
    email: 'Email',
    phone: 'Телефон',
    address: 'Адрес',
    city: 'Город',
    country: 'Страна',
    region: 'Регион',
    sector: 'Сектор',
    school: 'Школа',
    category: 'Категория',
    type: 'Тип',
    priority: 'Приоритет',
    tags: 'Теги',
    notes: 'Заметки',
    comments: 'Комментарии',
    attachments: 'Вложения',
    files: 'Файлы',
    links: 'Ссылки',
    url: 'URL',
    username: 'Имя пользователя',
    password: 'Пароль',
    full_name: 'Полное имя',
    first_name: 'Имя',
    last_name: 'Фамилия',
    position: 'Должность',
    role: 'Роль',
    department: 'Отдел',
    organization: 'Организация'
  },

  // Responses
  responses: {
    yes: 'Да',
    no: 'Нет',
    ok: 'ОК',
    maybe: 'Возможно',
    not_sure: 'Не уверен',
    agree: 'Согласен',
    disagree: 'Не согласен'
  },

  // Time expressions
  time: {
    today: 'Сегодня',
    yesterday: 'Вчера',
    tomorrow: 'Завтра',
    this_week: 'На этой неделе',
    last_week: 'На прошлой неделе',
    this_month: 'В этом месяце',
    last_month: 'В прошлом месяце',
    this_year: 'В этом году',
    last_year: 'В прошлом году',
    now: 'Сейчас',
    soon: 'Скоро',
    later: 'Позже',
    never: 'Никогда',
    always: 'Всегда',
    recently: 'Недавно',
    ago: 'назад',
    in: 'через',
    minutes: 'минут',
    hours: 'часов',
    days: 'дней',
    weeks: 'недель',
    months: 'месяцев',
    years: 'лет'
  },

  // Message types
  messages: {
    success: 'Успех',
    error: 'Ошибка',
    warning: 'Предупреждение',
    info: 'Информация',
    notification: 'Уведомление',
    confirmation: 'Подтверждение',
    reminder: 'Напоминание'
  },

  // Validation messages
  validation: {
    required: 'Это поле обязательно',
    invalid_email: 'Email недействителен',
    invalid_phone: 'Номер телефона недействителен',
    min_length: 'Должно быть не менее {{min}} символов',
    max_length: 'Должно быть не более {{max}} символов',
    min_value: 'Минимальное значение должно быть {{min}}',
    max_value: 'Максимальное значение должно быть {{max}}',
    invalid_date: 'Дата недействительна',
    invalid_url: 'URL недействителен',
    password_too_short: 'Пароль слишком короткий',
    password_too_weak: 'Пароль слишком слабый',
    passwords_dont_match: 'Пароли не совпадают',
    invalid_format: 'Формат недействителен',
    file_too_large: 'Файл слишком большой',
    invalid_file_type: 'Тип файла не поддерживается',
    number_required: 'Введите число',
    positive_number: 'Введите положительное число',
    integer_required: 'Введите целое число'
  }
} as const;

export type Core = typeof core;
export default core;