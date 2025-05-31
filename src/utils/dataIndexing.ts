
export const safeGetByUUID = (map: Record<string, any> | null | undefined, uuid: string | null | undefined): any => {
  if (!map || !uuid || typeof map !== 'object') {
    return null;
  }
  
  return map[uuid] || null;
};

export const safeArrayFind = <T>(array: T[] | null | undefined, predicate: (item: T) => boolean): T | undefined => {
  if (!Array.isArray(array)) {
    return undefined;
  }
  
  return array.find(predicate);
};
