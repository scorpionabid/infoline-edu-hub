import { DialogConfig, DialogType, EntityType, EntityMetadata } from './types';

// Delete dialog configurations
const DeleteConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Məktəbi sil',
    titleKey: 'dialogs.deleteSchool',
    warningText: 'məktəbini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteSchoolWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və bütün məktəblə əlaqəli məlumatlar silinəcək.',
    consequencesKey: 'dialogs.deleteSchoolConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  category: {
    title: 'Kateqoriyanı sil',
    titleKey: 'dialogs.deleteCategory',
    warningText: 'kateqoriyasını silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteCategoryWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz. Bu kateqoriyaya aid bütün məlumatlar silinəcək.',
    consequencesKey: 'dialogs.deleteCategoryConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  sector: {
    title: 'Sektoru sil',
    titleKey: 'dialogs.deleteSector',
    warningText: 'sektorunu silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteSectorWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və sektora aid bütün məlumatlar silinəcək.',
    consequencesKey: 'dialogs.deleteSectorConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  region: {
    title: 'Regionu sil',
    titleKey: 'dialogs.deleteRegion',
    warningText: 'regionunu silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteRegionWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və regiona aid bütün məlumatlar silinəcək.',
    consequencesKey: 'dialogs.deleteRegionConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  user: {
    title: 'İstifadəçini sil',
    titleKey: 'dialogs.deleteUser',
    warningText: 'istifadəçisini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteUserWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və istifadəçinin bütün məlumatları silinəcək.',
    consequencesKey: 'dialogs.deleteUserConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  column: {
    title: 'Sütunu sil',
    titleKey: 'dialogs.deleteColumn',
    warningText: 'sütununu silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteColumnWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz və sütuna aid bütün məlumatlar silinəcək.',
    consequencesKey: 'dialogs.deleteColumnConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'high' as const
  },
  
  notification: {
    title: 'Bildirişi sil',
    titleKey: 'dialogs.deleteNotification',
    warningText: 'bildirişini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteNotificationWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'dialogs.deleteNotificationConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  },
  
  report: {
    title: 'Hesabatı sil',
    titleKey: 'dialogs.deleteReport',
    warningText: 'hesabatını silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteReportWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'dialogs.deleteReportConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  },
  
  file: {
    title: 'Faylı sil',
    titleKey: 'dialogs.deleteFile',
    warningText: 'faylını silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteFileWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'dialogs.deleteFileConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  },
  
  link: {
    title: 'Linki sil',
    titleKey: 'dialogs.deleteLink',
    warningText: 'linkini silmək istədiyinizə əminsiniz?',
    warningTextKey: 'dialogs.deleteLinkWarning',
    consequences: 'Bu əməliyyat geri qaytarıla bilməz.',
    consequencesKey: 'dialogs.deleteLinkConsequences',
    confirmText: 'Sil',
    confirmTextKey: 'common.delete',
    loadingText: 'Silinir...',
    loadingTextKey: 'sectors.deleting',
    showIcon: true,
    dangerLevel: 'medium' as const
  }
};

// Create dialog configurations
const CreateConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Yeni məktəb əlavə et',
    titleKey: 'dialogs.addSchool',
    confirmText: 'Əlavə et',
    confirmTextKey: 'common.add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'dialogs.adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  category: {
    title: 'Yeni kateqoriya əlavə et',
    titleKey: 'dialogs.addCategory',
    confirmText: 'Əlavə et',
    confirmTextKey: 'common.add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'dialogs.adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  sector: {
    title: 'Yeni sektor əlavə et',
    titleKey: 'dialogs.addSector',
    confirmText: 'Əlavə et',
    confirmTextKey: 'common.add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'dialogs.adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  region: {
    title: 'Yeni region əlavə et',
    titleKey: 'dialogs.addRegion',
    confirmText: 'Əlavə et',
    confirmTextKey: 'common.add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'dialogs.adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  user: {
    title: 'Yeni istifadəçi əlavə et',
    titleKey: 'dialogs.addUser',
    confirmText: 'Əlavə et',
    confirmTextKey: 'common.add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'dialogs.adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  column: {
    title: 'Yeni sütun əlavə et',
    titleKey: 'dialogs.addColumn',
    confirmText: 'Əlavə et',
    confirmTextKey: 'common.add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'dialogs.adding',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  notification: {
    title: 'Yeni bildiriş göndər',
    titleKey: 'dialogs.sendNotification',
    confirmText: 'Göndər',
    confirmTextKey: 'dialogs.send',
    loadingText: 'Göndərilir...',
    loadingTextKey: 'dialogs.sending',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  report: {
    title: 'Yeni hesabat yarat',
    titleKey: 'dialogs.createReport',
    confirmText: 'Yarat',
    confirmTextKey: 'dialogs.create',
    loadingText: 'Yaradılır...',
    loadingTextKey: 'dialogs.creating',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  file: {
    title: 'Fayl yüklə',
    titleKey: 'dialogs.uploadFile',
    confirmText: 'Yüklə',
    confirmTextKey: 'common.upload',
    loadingText: 'Yüklənir...',
    loadingTextKey: 'dialogs.uploading',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  link: {
    title: 'Yeni link əlavə et',
    titleKey: 'dialogs.addLink',
    confirmText: 'Əlavə et',
    confirmTextKey: 'common.add',
    loadingText: 'Əlavə edilir...',
    loadingTextKey: 'dialogs.adding',
    showIcon: false,
    dangerLevel: 'low' as const
  }
};

// Edit dialog configurations  
const EditConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Məktəbi redaktə et',
    titleKey: 'dialogs.editSchool',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  category: {
    title: 'Kateqoriyanı redaktə et',
    titleKey: 'dialogs.editCategory',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  sector: {
    title: 'Sektoru redaktə et',
    titleKey: 'dialogs.editSector',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  region: {
    title: 'Regionu redaktə et',
    titleKey: 'dialogs.editRegion',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  user: {
    title: 'İstifadəçini redaktə et',
    titleKey: 'dialogs.editUser',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  column: {
    title: 'Sütunu redaktə et',
    titleKey: 'dialogs.editColumn',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  notification: {
    title: 'Bildirişi redaktə et',
    titleKey: 'dialogs.editNotification',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  report: {
    title: 'Hesabatı redaktə et',
    titleKey: 'dialogs.editReport',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  file: {
    title: 'Faylı redaktə et',
    titleKey: 'dialogs.editFile',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  },
  
  link: {
    title: 'Linki redaktə et',
    titleKey: 'dialogs.editLink',
    confirmText: 'Yadda saxla',
    confirmTextKey: 'common.save',
    loadingText: 'Yadda saxlanır...',
    loadingTextKey: 'sectors.saving',
    showIcon: false,
    dangerLevel: 'low' as const
  }
};

// Confirm dialog configurations
const ConfirmConfigs: Record<EntityType, DialogConfig> = {
  school: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  category: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  sector: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  region: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  user: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  column: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  notification: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  report: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  file: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
    showIcon: false,
    dangerLevel: 'medium' as const
  },
  
  link: {
    title: 'Təsdiqləyin',
    titleKey: 'common.confirm',
    confirmText: 'Təsdiq',
    confirmTextKey: 'common.confirm',
    loadingText: 'İşlənir...',
    loadingTextKey: 'common.processing',
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
          confirmTextKey: 'common.close',
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
          titleKey: 'dialogs.assignAdmin',
          confirmText: 'Təyin et',
          confirmTextKey: 'dialogs.assign',
          loadingText: 'Təyin edilir...',
          loadingTextKey: 'dialogs.assigning',
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
          titleKey: 'dialogs.import',
          confirmText: 'İdxal et',
          confirmTextKey: 'dialogs.import',
          loadingText: 'İdxal edilir...',
          loadingTextKey: 'dialogs.importing',
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
          titleKey: 'dialogs.export',
          confirmText: 'İxrac et',
          confirmTextKey: 'dialogs.export',
          loadingText: 'İxrac edilir...',
          loadingTextKey: 'dialogs.exporting',
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
