
import { formatDistanceToNow } from "date-fns";
import { az, ru, tr, enUS } from "date-fns/locale";

type Language = "az" | "ru" | "tr" | "en";

/**
 * Tarix formatlaması üçün köməkçi funksiya
 * @param dateString - Formatlanacaq tarix
 * @param language - İstifadə ediləcək dil
 * @returns Formatlanmış tarix
 */
export const formatRelativeDate = (dateString: string, language: Language) => {
  try {
    const getLocale = () => {
      switch (language) {
        case "az": return az;
        case "ru": return ru;
        case "tr": return tr;
        default: return enUS;
      }
    };
    
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: getLocale(),
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};
