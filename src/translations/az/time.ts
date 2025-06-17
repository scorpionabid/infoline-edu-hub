
// Time translation module
export const time = {
  // Time units
  second: 'saniyə',
  minute: 'dəqiqə',
  hour: 'saat',
  day: 'gün',
  week: 'həftə',
  month: 'ay',
  year: 'il',
  
  // Time expressions
  today: 'Bu gün',
  yesterday: 'Dünən',
  tomorrow: 'Sabah',
  now: 'İndi',
  
  // Relative time
  ago: 'əvvəl',
  later: 'sonra',
  recently: 'son vaxtlar'
} as const;

export type Time = typeof time;
export default time;
