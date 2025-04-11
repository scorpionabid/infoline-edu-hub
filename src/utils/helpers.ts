
// Random ID yaratmaq üçün köməkçi funksiya
export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
