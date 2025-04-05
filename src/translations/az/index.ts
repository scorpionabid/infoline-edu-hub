
import common from './common';
import auth from './auth';
import dashboard from './dashboard';
import user from './user';

const az = {
  ...common,
  ...auth,
  ...dashboard,
  
  // User translations
  ...user,
  
  // Əlavə tərcümələr - bunlar başqa fayllara köçürülə bilər
  tryAnotherFilter: 'Başqa filtrdən istifadə edin',
  openMenu: 'Menyu aç',
};

export default az;
