/**
 * UUID indeksləmə funksiyaları
 * Bu funksiyalar UUID-lərlə işləməyi asanlaşdırır və təhlükəsiz əməliyyatlar təmin edir
 */

/**
 * UUID açarları ilə indekslənmiş obyekt yaratmaq üçün funksiya
 * @param items Massiv
 * @param keyField Açar kimi istifadə ediləcək sahə adı
 * @returns İndekslənmiş obyekt
 */
export function createIndexedMap<T extends { [key: string]: any }>(
  items: T[] | null | undefined, 
  keyField: keyof T = 'id' as keyof T
): Record<string, T> {
  if (!items || !Array.isArray(items)) return {};
  
  return items.reduce((acc, item) => {
    const key = item[keyField];
    if (key && typeof key === 'string') {
      acc[key] = item;
    }
    return acc;
  }, {} as Record<string, T>);
}

/**
 * UUID açarına təhlükəsiz giriş funksiyası
 * @param map İndekslənmiş obyekt
 * @param uuid Açar
 * @param defaultValue Standart dəyər
 * @returns Tapılan element və ya standart dəyər
 */
export function safeGetByUUID<T>(
  map: Record<string, T> | null | undefined,
  uuid: string | null | undefined,
  defaultValue: T | null = null
): T | null {
  if (!map || !uuid) return defaultValue;
  return uuid in map ? map[uuid] : defaultValue;
}

/**
 * Massivdən ID-yə görə element tapmaq üçün təhlükəsiz funksiya
 * @param array Element massivi
 * @param id Axtarılan ID
 * @param idField ID sahəsinin adı
 * @returns Tapılan element və ya null
 */
export function safeArrayFind<T extends { [key: string]: any }>(
  array: T[] | null | undefined,
  id: string | null | undefined,
  idField: keyof T = 'id' as keyof T
): T | null {
  if (!array || !Array.isArray(array) || !id) return null;
  return array.find(item => item[idField] === id) || null;
}

/**
 * Data entries massivini column_id-yə görə indeksləmək
 * @param entries Məlumat massivi
 * @returns Column ID-lərinə görə indekslənmiş obyekt
 */
export function indexDataEntriesByColumnId<T extends { column_id?: string | null }>(
  entries: T[] | null | undefined
): Record<string, T> {
  return createIndexedMap(entries, 'column_id');
}

/**
 * Obyektin dəyərini təhlükəsiz şəkildə almaq
 * @param obj Obyekt
 * @param key Açar
 * @param defaultValue Standart dəyər
 * @returns Tapılan dəyər və ya standart dəyər
 */
export function safeGet<T>(
  obj: Record<string, T> | null | undefined,
  key: string | null | undefined,
  defaultValue: T | null = null
): T | null {
  if (!obj || !key) return defaultValue;
  return key in obj ? obj[key] : defaultValue;
}
