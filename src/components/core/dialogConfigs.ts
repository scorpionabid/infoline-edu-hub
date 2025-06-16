import { DialogConfig, DialogType, EntityType, EntityMetadata } from './types';

// Delete dialog configurations
const DeleteConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Məktəbi sil',
    titleKey: 'deleteSchool',
    warningText: 'məktəbini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteSchoolWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və bütün məktəblə əlaqəli məlumatlar silinəcək.',
    consequencesKey: 'deleteSchoolConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  category: {
    title: 'Kateqoriyanı sil',
    titleKey: 'deleteCategory',
    warningText: 'kateqoriyasını silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteCategoryWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz. Bu kateqoriyaya aid bütün məlumatlar silinəcək.',
    consequencesKey: 'deleteCategoryConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  sector: {
    title: 'Sektoru sil',
    titleKey: 'deleteSector',
    warningText: 'sektorunu silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteSectorWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və sektora aid bütün məlumatlar silinəcək.',
    consequencesKey: 'deleteSectorConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  region: {
    title: 'Regionu sil',
    titleKey: 'deleteRegion',
    warningText: 'regionunu silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteRegionWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və regiona aid bütün məlumatlar silinəcək.',
    consequencesKey: 'deleteRegionConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  user: {
    title: 'İstifadəçini sil',
    titleKey: 'deleteUser',
    warningText: 'istifadəçisini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteUserWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və istifadəçinin bütün məlumatları silinəcək.',
    consequencesKey: 'deleteUserConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  column: {
    title: 'Sütunu sil',
    titleKey: 'deleteColumn',
    warningText: 'sütununu silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteColumnWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və sütuna aid bütün məlumatlar silinəcək.',
    consequencesKey: 'deleteColumnConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  notification: {
    title: 'Bildirişi sil',
    titleKey: 'deleteNotification',
    warningText: 'bildirişini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteNotificationWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'deleteNotificationConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  },
  
  report: {
    title: 'Hesabatı sil',
    titleKey: 'deleteReport',
    warningText: 'hesabatını silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteReportWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'deleteReportConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  },
  
  file: {
    title: 'Faylı sil',
    titleKey: 'deleteFile',
    warningText: 'faylını silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteFileWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'deleteFileConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  },
  
  link: {
    title: 'Linki sil',
    titleKey: 'deleteLink',
    warningText: 'linkini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'deleteLinkWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'deleteLinkConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  }
};

// Create dialog configurations
const CreateConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Yeni məktəb əlavə et',
    titleKey: 'addSchool',
    confirmText: 'Əlavə et',
    confirmTextKey: 'add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  category: {
    title: 'Yeni kateqoriya əlavə et',
    titleKey: 'addCategory',
    confirmText: 'Əlavə et',
    confirmTextKey: 'add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  sector: {
    title: 'Yeni sektor əlavə et',
    titleKey: 'addSector',
    confirmText: 'Əlavə et',
    confirmTextKey: 'add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  region: {
    title: 'Yeni region əlavə et',
    titleKey: 'addRegion',
    confirmText: 'Əlavə et',
    confirmTextKey: 'add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  user: {
    title: 'Yeni istifadəçi əlavə et',
    titleKey: 'addUser',
    confirmText: 'Əlavə et',
    confirmTextKey: 'add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  column: {
    title: 'Yeni sütun əlavə et',
    titleKey: 'addColumn',
    confirmText: 'Əlavə et',
    confirmTextKey: 'add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  notification: {
    title: 'Yeni bildiriş göndər',
    titleKey: 'sendNotification',
    confirmText: 'Göndər',
    confirmTextKey: 'send',
    loadingText: 'Göndərilir...',
    loadingTextKey: 'sending',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  report: {
    title: 'Yeni hesabat yarat',
    titleKey: 'createReport',
    confirmText: 'Yarat',
    confirmTextKey: 'create',
    loadingText: 'Yaradılır...',
    loadingTextKey: 'creating',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  file: {
    title: 'Fayl yüklə',
    titleKey: 'uploadFile',
    confirmText: 'Yüklə',
    confirmTextKey: 'upload',
    loadingText: 'Yüklənir...',
    loadingTextKey: 'uploading',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  link: {
    title: 'Yeni link əlavə et',
    titleKey: 'addLink',
    confirmText: 'Əlavə et',
    confirmTextKey: 'add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'adding',
    showIcon: false,
    dangerLevel: 'low' as const
  }
};

// Edit dialog configurations  
const EditConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Məktəbi redaktə et',
    titleKey: 'editSchool',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  category: {
    title: 'Kateqoriyanı redaktə et',
    titleKey: 'editCategory',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  sector: {
    title: 'Sektoru redaktə et',
    titleKey: 'editSector',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  region: {
    title: 'Regionu redaktə et',
    titleKey: 'editRegion',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  user: {
    title: 'İstifadəçini redaktə et',
    titleKey: 'editUser',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  column: {
    title: 'Sütunu redaktə et',
    titleKey: 'editColumn',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  notification: {
    title: 'Bildirişi redaktə et',
    titleKey: 'editNotification',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  report: {
    title: 'Hesabatı redaktə et',
    titleKey: 'editReport',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  file: {
    title: 'Faylı redaktə et',
    titleKey: 'editFile',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  link: {
    title: 'Linki redaktə et',
    titleKey: 'editLink',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'saving',
    showIcon: false,
    dangerLevel: 'low' as const
  }
};

// Confirm dialog configurations
const ConfirmConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  category: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  sector: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  region: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  user: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  column: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  notification: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  report: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  file: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  link: {
    title: 'Təsdiqləyin',
    titleKey: 'confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  }
};

// All dialog configs by type
const DialogConfigs: Record<DialogType, Record<EntityType, DialogConfig>> = {
  delete: DeleteConfigs,
  create: CreateConfigs,
  edit: EditConfigs,
  view: {
    // View configs - simple close dialogs
    ...Object.fromEntries(
      Object.keys(DeleteConfigs).map(entity => [
        entity,
        {
          title: `${entity} məlumatları`,
          confirmText: 'Bağla',
          confirmTextKey: 'close',
          showIcon: false,
          dangerLevel: 'low' as const
        }
      ])
    )
  } as Record<EntityType, DialogConfig>,
  confirm: ConfirmConfigs,
  assign: {
    // Assign configs - similar to confirm but specific for assignments
    ...Object.fromEntries(
      Object.keys(DeleteConfigs).map(entity => [
        entity,
        {
          title: 'Admin təyin et',
          titleKey: 'assignAdmin',
          confirmText: 'Təyin et',
          confirmTextKey: 'assign',
          loadingText: 'Təyin edilir...',
          loadingTextKey: 'assigning',
          showIcon: false,
          dangerLevel: 'medium' as const
        }
      ])
    )
  } as Record<EntityType, DialogConfig>,
  import: {
    // Import configs
    ...Object.fromEntries(
      Object.keys(DeleteConfigs).map(entity => [
        entity,
        {
          title: 'İdxal et',
          titleKey: 'import',
          confirmText: 'İdxal et',
          confirmTextKey: 'import',
          loadingText: 'İdxal edilir...',
          loadingTextKey: 'importing',
          showIcon: false,
          dangerLevel: 'low' as const
        }
      ])
    )
  } as Record<EntityType, DialogConfig>,
  export: {
    // Export configs
    ...Object.fromEntries(
      Object.keys(DeleteConfigs).map(entity => [
        entity,
        {
          title: 'İxrac et',
          titleKey: 'export',
          confirmText: 'İxrac et',
          confirmTextKey: 'export',
          loadingText: 'İxrac edilir...',
          loadingTextKey: 'exporting',
          showIcon: false,
          dangerLevel: 'low' as const
        }
      ])
    )
  } as Record<EntityType, DialogConfig>
};

// Main function to get dialog config
export function getDialogConfig(type: DialogType, entity: EntityType): DialogConfig {
  const config = DialogConfigs[type]?.[entity];
  
  if (!config) {
    console.warn(`No dialog config found for type: ${type}, entity: ${entity}`);
    return {
      title: 'Dialog',
      confirmText: 'Tamam',
      showIcon: false,
      dangerLevel: 'low' as const
    };
  }

  // Add entity icon if not explicitly disabled
  if (config.showIcon && !config.icon) {
    config.icon = EntityMetadata[entity]?.icon;
  }

  return config;
}

// Export individual configs for advanced usage
export { DeleteConfigs, CreateConfigs, EditConfigs, ConfirmConfigs };
export default getDialogConfig;