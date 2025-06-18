/**
 * InfoLine layihəsində istifadə edilən string utiliti funksiyaları
 * Bu funksiyalar mətn müqayisəsi və normallaşdırma üçün istifadə edilir.
 */

/**
 * Mətni axtarış üçün normallaşdırır
 * - Kiçik hərflərə çevirir
 * - Boşluqları silir
 * - Xüsusi simvolları silib, əsas mətn elementlərini saxlayır
 * 
 * @param value Normallaşdırılacaq mətn
 * @returns Normallaşdırılmış mətn
 */
export function normalizeSearch(value: string | null | undefined): string {
  if (!value) return '';
  
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Rol adını normallaşdırır (InfoLine layihəsi üçün)
 * 
 * @param role Normallaşdırılacaq rol adı
 * @returns Normallaşdırılmış rol adı
 */
export function normalizeRole(role: string | null | undefined): string {
  if (!role) return '';
  
  return role
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
}

/**
 * Rol massivini normallaşdırır
 * 
 * @param roles Normallaşdırılacaq rol massivi
 * @returns Normallaşdırılmış rol massivi
 */
export function normalizeRoleArray(roles: string[]): string[] {
  if (!roles || !Array.isArray(roles)) return [];
  
  return roles.map(role => normalizeRole(role)).filter(Boolean);
}

/**
 * İki mətnin case-insensitive müqayisəsi
 * 
 * @param a Birinci mətn
 * @param b İkinci mətn
 * @returns Mətnlər eynidirsə true
 */
export function stringEquals(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  
  return a.toLowerCase().trim() === b.toLowerCase().trim();
}
