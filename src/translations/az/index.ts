
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
  
  // Spesifik tərcümələr (əgər lazımdırsa)
  selectLanguage: 'Dil seçin',
  loading: 'Yüklənir...',
  more: 'Daha çox',
  less: 'Daha az',
  
  // Hesabat əlavə tərcümələr
  allReports: 'Bütün hesabatlar',
  createNewReport: 'Yeni hesabat yarat',
  reportType: 'Hesabat növü',
  statistics: 'Statistika',
  column: 'Sütun',
  school: 'Məktəb',
  region: 'Region',
  sector: 'Sektor',
  custom: 'Fərdi',
  allTypes: 'Bütün növlər',
  searchReports: 'Hesabatları axtar',
  preview: 'Önizləmə',
  download: 'Yüklə',
  noReportsFound: 'Hesabat tapılmadı',
  createYourFirstReport: 'İlk hesabatınızı yaradın'
};

export default az;
