
import auth from './auth';
import common from './common';
import dashboard from './dashboard';
import dataEntry from './dataEntry';
import reports from './reports';
import users from './user';
import notifications from './notifications';
import validation from './validation';
import schools from './schools';
import categories from './categories';
import profile from './profile';

const az = {
  ...auth,
  ...common,
  ...dashboard,
  ...dataEntry,
  ...reports,
  ...users,
  ...notifications,
  ...validation,
  ...schools,
  ...categories,
  ...profile
};

export default az;
