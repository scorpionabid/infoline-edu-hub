// App-specific translations
export const app = {
  name: 'InfoLine',
  description: 'School Data Collection System',
  tagline: 'Central platform for managing educational data',
  version: 'Version',
  welcome: 'Welcome',
  loading: 'Loading...',
  error: 'An error occurred',
  success: 'Operation completed successfully'
} as const;

export type App = typeof app;
export default app;