
import general from './general';
import dataEntry from './dataEntry';
import auth from './auth';
import navigation from './navigation';
import time from './time';
import status from './status';
import notifications from './notifications';
import user from './user';
import validation from './validation';
import organization from './organization';
import ui from './ui';
import feedback from './feedback';
import reports from './reports';

/**
 * Azərbaycan dili tərcümələrini birləşdirir
 */
const az = {
  ...general,
  ...dataEntry,
  ...auth,
  ...navigation,
  ...time,
  ...status,
  ...notifications,
  ...user,
  ...validation,
  ...organization,
  ...ui,
  ...feedback,
  ...reports
};

export default az;
