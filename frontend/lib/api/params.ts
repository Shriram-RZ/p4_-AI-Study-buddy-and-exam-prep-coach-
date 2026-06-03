/** Drop null/undefined/empty values so axios never sends `?foo=undefined`. */
export function cleanParams<T extends Record<string, unknown>>(
  params: T
): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(params) as [keyof T, T[keyof T]][]) {
    if (value !== undefined && value !== null && value !== "") {
      out[key] = value;
    }
  }
  return out;
}
