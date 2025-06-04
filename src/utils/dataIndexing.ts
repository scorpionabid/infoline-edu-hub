
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
