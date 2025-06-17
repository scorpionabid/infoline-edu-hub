
import { DialogConfig, DialogType, EntityType } from './types';

// Define dialog configurations
export const dialogConfigs: Record<DialogType, Record<EntityType, DialogConfig>> = {
  create: {
    category: {
      title: 'categories.create_category',
      description: 'categories.create_category_description',
      confirmText: 'ui.create',
      cancelText: 'ui.cancel'
    },
    column: {
      title: 'columns.create_column',
      description: 'columns.create_column_description',
      confirmText: 'ui.create',
      cancelText: 'ui.cancel'
    },
    school: {
      title: 'schools.create_school',
      description: 'schools.create_school_description',
      confirmText: 'ui.create',
      cancelText: 'ui.cancel'
    },
    user: {
      title: 'user.create_user',
      description: 'user.create_user_description',
      confirmText: 'ui.create',
      cancelText: 'ui.cancel'
    }
  },
  edit: {
    category: {
      title: 'categories.edit_category',
      description: 'categories.edit_category_description',
      confirmText: 'ui.save',
      cancelText: 'ui.cancel'
    },
    column: {
      title: 'columns.edit_column',
      description: 'columns.edit_column_description',
      confirmText: 'ui.save',
      cancelText: 'ui.cancel'
    },
    school: {
      title: 'schools.edit_school',
      description: 'schools.edit_school_description',
      confirmText: 'ui.save',
      cancelText: 'ui.cancel'
    },
    user: {
      title: 'user.edit_user',
      description: 'user.edit_user_description',
      confirmText: 'ui.save',
      cancelText: 'ui.cancel'
    }
  },
  delete: {
    category: {
      title: 'categories.delete_category',
      description: 'categories.delete_category_confirmation',
      confirmText: 'ui.delete',
      cancelText: 'ui.cancel'
    },
    column: {
      title: 'columns.delete_column',
      description: 'columns.delete_column_confirmation',
      confirmText: 'ui.delete',
      cancelText: 'ui.cancel'
    },
    school: {
      title: 'schools.delete_school',
      description: 'schools.delete_school_confirmation',
      confirmText: 'ui.delete',
      cancelText: 'ui.cancel'
    },
    user: {
      title: 'user.delete_user',
      description: 'user.delete_user_confirmation',
      confirmText: 'ui.delete',
      cancelText: 'ui.cancel'
    }
  }
};

export default dialogConfigs;
