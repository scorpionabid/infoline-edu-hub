/**
 * UUID validation utility functions
 * 
 * Bu fayl UUID formatını yoxlamaq və təhlükəsiz şəkildə istifadə etmək üçün funksiyalar təqdim edir.
 * UUID formatı: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx (8-4-4-4-12)
 * 
 * MƏQSƏD: Supabase database-ə göndərilən UUID dəyərlərinin 22P02 xətasına səbəb olmamasını təmin etmək
 */

/**
 * UUID formatını yoxlayır
 * @param uuid Yoxlanılacaq UUID string
 * @returns Boolean - UUID düzgün formatdadırsa true
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * UUID-ni təhlükəsiz şəkildə qaytarır - əgər düzgün formatda deyilsə null qaytarır
 * @param uuid Yoxlanılacaq və təmizlənəcək UUID
 * @param logWarning Xəbərdarlıq mesajını console-a yazdırmaq (default: true)
 * @returns string | null - Düzgün UUID və ya null
 */
export const getSafeUUID = (uuid: string | null | undefined, logWarning = true): string | null => {
  // Use the more robust getDBSafeUUID function
  return getDBSafeUUID(uuid, logWarning ? 'general' : '');
};

/**
 * UUID və ya null qaytarır - xəta halında default dəyər istifadə edir
 * @param uuid Yoxlanılacaq UUID
 * @param defaultValue Xəta halında istifadə ediləcək dəyər (default: null)
 * @returns string | null - Düzgün UUID və ya defaultValue
 */
export const getUUIDOrDefault = (
  uuid: string | null | undefined, 
  defaultValue: string | null = null
): string | null => {
  if (!uuid) return defaultValue;
  return isValidUUID(uuid) ? uuid : defaultValue;
};

/**
 * Təhlükəsiz UUID emalı - database əməliyyatları üçün
 * Məlumat bazasına göndərilən UUID dəyərlərinin düzgün formatda olmasını təmin edir
 * @param uuid Yoxlanılacaq UUID dəyəri
 * @param context Logging üçün kontekst (məs: 'created_by', 'updated_by')
 * @returns string | null - Düzgün UUID və ya null
 */
export const getDBSafeUUID = (
  uuid: string | null | undefined,
  context: string = 'unknown'
): string | null => {
  // Null və ya undefined dəyərləri həmişə null qaytarır
  if (uuid === null || uuid === undefined) {
    console.log(`[UUID Validator] Null/undefined value for ${context}, using null`);
    return null;
  }
  
  // Boş string-i null olaraq qəbul edir
  if (uuid === '') {
    console.warn(`[UUID Validator] Empty string detected for ${context}, using null`);
    return null;
  }
  
  // CRITICAL: Invalid literal values that would cause UUID format errors
  const invalidValues = ['system', 'undefined', 'null', 'false', 'true', 'NaN', 'object', 'function'];
  if (typeof uuid === 'string' && invalidValues.includes(uuid.toLowerCase())) {
    console.error(`[UUID Validator] ❌ CRITICAL: Invalid literal value "${uuid}" for ${context}`);
    console.error(`[UUID Validator] This would cause PostgreSQL UUID format error (22P02)`);
    console.error(`[UUID Validator] Using null instead to prevent database error`);
    return null;
  }
  
  // Type check - UUID must be string
  if (typeof uuid !== 'string') {
    console.error(`[UUID Validator] ❌ CRITICAL: Non-string value for ${context}:`, typeof uuid, uuid);
    return null;
  }
  
  // UUID formatını yoxlayır
  if (isValidUUID(uuid)) {
    console.log(`[UUID Validator] ✅ Valid UUID for ${context}: ${uuid.substring(0, 8)}...`);
    return uuid;
  }
  
  console.error(`[UUID Validator] ❌ Invalid UUID format "${uuid}" for ${context}, using null`);
  console.error(`[UUID Validator] Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`);
  return null;
};
