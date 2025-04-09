
// Azərbaycan dili tərcümələri
import dashboardTranslations from './dashboard';
import authTranslations from './auth';
import commonTranslations from './common';
import dataEntryTranslations from './dataEntry';

// Tərcümələri bir yerə toplamaq
const azTranslations = {
  ...dashboardTranslations,
  ...authTranslations,
  ...commonTranslations,
  ...dataEntryTranslations
  // Digər tərcümələr
};

export default azTranslations;
