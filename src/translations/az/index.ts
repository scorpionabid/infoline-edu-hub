
import auth from './auth';
import common from './common';
import dashboard from './dashboard';
import dataEntry from './dataEntry';
import feedback from './feedback';
import general from './general';
import navigation from './navigation';
import notifications from './notifications';
import organization from './organization';
import profile from './profile';
import reports from './reports';
import schools from './schools';
import status from './status';
import time from './time';
import ui from './ui';
import user from './user';
import validation from './validation';
import categories from './categories';

// Ana tərcümə obyekti
const az = {
  ...auth,
  ...common,
  ...dashboard,
  ...dataEntry,
  ...feedback,
  ...general,
  ...navigation,
  ...notifications,
  ...organization,
  ...profile,
  ...reports,
  ...schools,
  ...status,
  ...time,
  ...ui,
  ...user,
  ...validation,
  ...categories,
  
  // Əlavə tərcümələr - Əsas menyu elementləri
  dashboard: "İdarəetmə paneli",
  regions: "Regionlar",
  sectors: "Sektorlar",
  schools: "Məktəblər",
  users: "İstifadəçilər",
  dataManagement: "Məlumat İdarəetməsi",
  dataEntry: "Məlumat daxiletmə",
  reports: "Hesabatlar",
  templates: "Şablonlar",
  settings: "Parametrlər",
  profile: "Profil",
  logout: "Çıxış",
  
  // Xəta mesajları
  errorLoadingData: "Məlumat yüklənərkən xəta",
  unknownUserRole: "Naməlum istifadəçi rolu",
  tryAgain: "Yenidən cəhd edin",
  
  // Dashboard elementləri
  refresh: "Yenilə",
  totalSchools: "Ümumi məktəblər",
  activeUsers: "Aktiv istifadəçilər",
  
  // Zaman seçiciləri
  thisMonth: "Bu ay",
  thisWeek: "Bu həftə",
  thisQuarter: "Bu rüb",
  thisYear: "Bu il",
  today: "Bu gün",
  
  // Axtarış
  searchDashboard: "Axtarış...",
  
  // istifadəçi menu
  superadmin: "Superadmin",
  
  // Əlavə interface elementləri
  language: "Dil",
  selectLanguage: "Dil seçin"
};

export default az;
