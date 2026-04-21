let counter = 0;
export function nextId(prefix = 'e'): string {
  counter += 1;
  return `${prefix}_${counter}`;
}
export function resetIds(): void { counter = 0; }
