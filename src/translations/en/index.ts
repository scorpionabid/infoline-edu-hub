
// English translations index - fix import errors

import common from './common';
import navigation from './navigation';
import dashboard from './dashboard';
import authTranslations from './auth'; // Fix: import default, not named export
import categories from './categories';
import schools from './schools';
import sectors from './sectors';
import userManagement from './userManagement';
import notifications from './notifications';
import settings from './settings';
import validation from './validation';
import approval from './approval';
import feedback from './feedback';
import profile from './profile';
import user from './user';
import organization from './organization';
import core from './core';
import status from './status';
import time from './time';
import ui from './ui';
import app from './app';
import general from './general';

export default {
  common,
  navigation,
  dashboard,
  auth: authTranslations, // Fix: use renamed import
  categories,
  schools,
  sectors,
  userManagement,
  notifications,
  settings,
  validation,
  approval,
  feedback,
  profile,
  user,
  organization,
  core,
  status,
  time,
  ui,
  app,
  general,
};
