
export function createIndexedMap<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);
}

export function indexByProperty<T>(items: T[], property: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = String(item[property]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function createLookupMap<T>(items: T[], keyProperty: keyof T, valueProperty: keyof T): Record<string, any> {
  return items.reduce((acc, item) => {
    const key = String(item[keyProperty]);
    acc[key] = item[valueProperty];
    return acc;
  }, {} as Record<string, any>);
}

export function safeArrayFind<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  if (!Array.isArray(array)) return undefined;
  return array.find(predicate);
}

export function safeGetByUUID<T extends { id: string }>(items: T[], id: string): T | undefined {
  if (!Array.isArray(items) || !id) return undefined;
  return items.find(item => item.id === id);
}
