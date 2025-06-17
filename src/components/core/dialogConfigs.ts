
import { DialogConfig, DialogType, EntityType } from './types';

// Define dialog configurations
export const dialogConfigs: Record<DialogType, Record<EntityType, DialogConfig>> = {
  create: {
    category: {
      titleKey: 'categories.create_category',
      descriptionKey: 'categories.create_category_description',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    column: {
      titleKey: 'columns.create_column',
      descriptionKey: 'columns.create_column_description',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    school: {
      titleKey: 'schools.create_school',
      descriptionKey: 'schools.create_school_description',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    user: {
      titleKey: 'user.create_user',
      descriptionKey: 'user.create_user_description',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    sector: {
      titleKey: 'sectors.add_sector',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    region: {
      titleKey: 'regions.add_region',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    notification: {
      titleKey: 'notifications.new_notification',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    report: {
      titleKey: 'reports.create_report',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    },
    file: {
      titleKey: 'files.upload_file',
      confirmTextKey: 'ui.upload',
      cancelTextKey: 'ui.cancel'
    },
    link: {
      titleKey: 'links.add_link',
      confirmTextKey: 'ui.create',
      cancelTextKey: 'ui.cancel'
    }
  },
  edit: {
    category: {
      titleKey: 'categories.edit_category',
      descriptionKey: 'categories.edit_category_description',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    column: {
      titleKey: 'columns.edit_column',
      descriptionKey: 'columns.edit_column_description',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    school: {
      titleKey: 'schools.edit_school',
      descriptionKey: 'schools.edit_school_description',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    user: {
      titleKey: 'user.edit_user',
      descriptionKey: 'user.edit_user_description',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    sector: {
      titleKey: 'sectors.edit_sector',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    region: {
      titleKey: 'regions.edit_region',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    notification: {
      titleKey: 'notifications.edit_notification',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    report: {
      titleKey: 'reports.edit_report',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    file: {
      titleKey: 'files.edit_file',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    },
    link: {
      titleKey: 'links.edit_link',
      confirmTextKey: 'ui.save',
      cancelTextKey: 'ui.cancel'
    }
  },
  delete: {
    category: {
      titleKey: 'categories.delete_category',
      descriptionKey: 'categories.delete_category_confirmation',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    column: {
      titleKey: 'columns.delete_column',
      descriptionKey: 'columns.delete_column_confirmation',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    school: {
      titleKey: 'schools.delete_school',
      descriptionKey: 'schools.delete_school_confirmation',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    user: {
      titleKey: 'user.delete_user',
      descriptionKey: 'user.delete_user_confirmation',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    sector: {
      titleKey: 'sectors.delete_sector',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    region: {
      titleKey: 'regions.delete_region',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    notification: {
      titleKey: 'notifications.delete_notification',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    report: {
      titleKey: 'reports.delete_report',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    file: {
      titleKey: 'files.delete_file',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    },
    link: {
      titleKey: 'links.delete_link',
      confirmTextKey: 'ui.delete',
      cancelTextKey: 'ui.cancel'
    }
  },
  info: {
    category: {
      titleKey: 'categories.category_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    column: {
      titleKey: 'columns.column_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    school: {
      titleKey: 'schools.school_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    user: {
      titleKey: 'user.user_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    sector: {
      titleKey: 'sectors.sector_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    region: {
      titleKey: 'regions.region_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    notification: {
      titleKey: 'notifications.notification_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    report: {
      titleKey: 'reports.report_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    file: {
      titleKey: 'files.file_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    },
    link: {
      titleKey: 'links.link_info',
      confirmTextKey: 'ui.ok',
      cancelTextKey: 'ui.close'
    }
  },
  confirm: {
    category: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    column: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    school: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    user: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    sector: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    region: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    notification: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    report: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    file: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    },
    link: {
      titleKey: 'ui.confirm_action',
      confirmTextKey: 'ui.confirm',
      cancelTextKey: 'ui.cancel'
    }
  }
};

export const getDialogConfig = (type: DialogType, entity: EntityType): DialogConfig => {
  return dialogConfigs[type]?.[entity] || {
    titleKey: 'ui.dialog_title',
    confirmTextKey: 'ui.ok',
    cancelTextKey: 'ui.cancel'
  };
};

export default dialogConfigs;
