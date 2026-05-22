export function sortByOrder(a: { sortOrder?: number }, b: { sortOrder?: number }): number {
  return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
}

export function reorderById<T extends { id: string; sortOrder?: number }>(
  items: T[],
  draggedId: string,
  targetId: string
): Array<T & { sortOrder: number }> {
  const sorted = [...items].sort(sortByOrder);
  const fromIndex = sorted.findIndex((item) => item.id === draggedId);
  const toIndex = sorted.findIndex((item) => item.id === targetId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return sorted.map((item, index) => ({ ...item, sortOrder: item.sortOrder ?? index + 1 }));
  }

  const [removed] = sorted.splice(fromIndex, 1);
  sorted.splice(toIndex, 0, removed);

  return sorted.map((item, index) => ({
    ...item,
    sortOrder: index + 1
  }));
}
