
/**
 * Tarix formatını şəkilləndirmə funksiyası
 * @param dateString ISO format tarix.
 * @returns Relatif format şəklində tarix.
 */
export const formatTimeFromNow = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000); // millisecond -> minute
  
  if (diffMins < 1) {
    return 'indicə';
  } else if (diffMins < 60) {
    return `${diffMins} dəqiqə əvvəl`;
  } else if (diffMins < 24 * 60) {
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours} saat əvvəl`;
  } else {
    const diffDays = Math.round(diffMins / (60 * 24));
    return `${diffDays} gün əvvəl`;
  }
};

export default formatTimeFromNow;
