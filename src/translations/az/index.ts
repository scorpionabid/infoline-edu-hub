
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
  
  // Əlavə tərcümələr (əgər lazımdırsa)
  selectLanguage: 'Dil seçin',
  more: 'Daha çox',
  less: 'Daha az',
};

export default az;
