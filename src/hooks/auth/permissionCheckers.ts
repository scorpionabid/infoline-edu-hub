
import { supabase } from "@/integrations/supabase/client";
import { PermissionLevel } from "./types";

/**
 * İstifadəçinin regiona girişini yoxlayır
 */
export const checkRegionAccess = async (
  regionId: string,
  level: PermissionLevel = "read"
): Promise<boolean> => {
  try {
    // Cari istifadəçini əldə et
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      console.error("İstifadəçi hesabına giriş edilməyib");
      return false;
    }

    const userId = userResponse.data.user.id;

    // Regionlara giriş icazəsini yoxla
    const { data, error } = await supabase.rpc("has_region_access", {
      region_id_param: regionId,
    });

    if (error) {
      console.error("Region girişi yoxlanarkən xəta:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Region icazəsi yoxlanarkən xəta:", error);
    return false;
  }
};

/**
 * İstifadəçinin sektora girişini yoxlayır
 */
export const checkSectorAccess = async (
  sectorId: string,
  level: PermissionLevel = "read"
): Promise<boolean> => {
  try {
    // Cari istifadəçini əldə et
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      console.error("İstifadəçi hesabına giriş edilməyib");
      return false;
    }

    const userId = userResponse.data.user.id;

    // Sektora giriş icazəsini yoxla
    const { data, error } = await supabase.rpc("has_sector_access", {
      sector_id_param: sectorId,
    });

    if (error) {
      console.error("Sektor girişi yoxlanarkən xəta:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Sektor icazəsi yoxlanarkən xəta:", error);
    return false;
  }
};

/**
 * İstifadəçinin məktəbə girişini yoxlayır
 */
export const checkSchoolAccess = async (
  schoolId: string,
  level: PermissionLevel = "read"
): Promise<boolean> => {
  try {
    // Cari istifadəçini əldə et
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      console.error("İstifadəçi hesabına giriş edilməyib");
      return false;
    }

    const userId = userResponse.data.user.id;

    // Məktəbə giriş icazəsini yoxla
    const { data, error } = await supabase.rpc("has_school_access", {
      school_id_param: schoolId,
    });

    if (error) {
      console.error("Məktəb girişi yoxlanarkən xəta:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Məktəb icazəsi yoxlanarkən xəta:", error);
    return false;
  }
};

/**
 * İstifadəçinin kateqoriyaya girişini yoxlayır
 */
export const checkCategoryAccess = async (
  categoryId: string,
  level: PermissionLevel = "read"
): Promise<boolean> => {
  try {
    // Cari istifadəçini əldə et
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      console.error("İstifadəçi hesabına giriş edilməyib");
      return false;
    }

    const userId = userResponse.data.user.id;

    // Kateqoriyaya giriş icazəsini yoxla
    const { data, error } = await supabase.rpc("has_category_access", {
      category_id_param: categoryId,
    });

    if (error) {
      console.error("Kateqoriya girişi yoxlanarkən xəta:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Kateqoriya icazəsi yoxlanarkən xəta:", error);
    return false;
  }
};

/**
 * İstifadəçinin sütuna girişini yoxlayır
 */
export const checkColumnAccess = async (
  columnId: string,
  level: PermissionLevel = "read"
): Promise<boolean> => {
  try {
    // Cari istifadəçini əldə et
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      console.error("İstifadəçi hesabına giriş edilməyib");
      return false;
    }

    const userId = userResponse.data.user.id;

    // Sütuna giriş icazəsini yoxla
    const { data, error } = await supabase.rpc("has_column_access", {
      column_id_param: columnId,
    });

    if (error) {
      console.error("Sütun girişi yoxlanarkən xəta:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Sütun icazəsi yoxlanarkən xəta:", error);
    return false;
  }
};

/**
 * Sektor admininin kateqoriyalar və sütunlara girişini yoxlayır
 */
export const canSectorAdminAccessCategoriesColumns = (): boolean => {
  // Sektor admin istifadəçilərinə aid kateqoriyalara giriş qaydaları
  try {
    // Bu funksiya qaydalarına görə true qaytaracaq
    return true;
  } catch (error) {
    console.error(
      "Sektor admininin kateqoriya girişi yoxlanarkən xəta:",
      error
    );
    return false;
  }
};
