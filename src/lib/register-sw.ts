
/**
 * Register service worker for PWA functionality
 */
export const RegisterSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }
  return false;
};

export default RegisterSW;
