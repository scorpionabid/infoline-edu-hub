
// Theme translation module
export const theme = {
  // Basic terms
  theme: 'Tema',
  light: 'İşıqlı',
  dark: 'Qaranlıq',
  system: 'Sistem',
  
  // Actions
  change_theme: 'Tema dəyişdir',
  toggle_theme: 'Tema aç/bağla'
} as const;

export type Theme = typeof theme;
export default theme;
