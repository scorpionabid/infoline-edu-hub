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
  
  // Yeni tərcümələr
  selectRegion: 'Region seçin',
  selectSector: 'Sektor seçin',
  selectSchool: 'Məktəb seçin',
  allRegions: 'Bütün regionlar',
  allSectors: 'Bütün sektorlar',
  allSchools: 'Bütün məktəblər',
  actions: 'Əməliyyatlar',
  resetFilters: 'Filtrləri sıfırla',
  clear: 'Təmizlə',
  tryAgain: 'Yenidən cəhd et',
};

export default az;
