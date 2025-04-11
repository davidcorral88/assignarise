
/**
 * Utility functions for type conversions used throughout the app
 */

/**
 * Safely converts a string or number ID to a number
 * @param id The ID to convert
 * @returns The numeric ID or undefined if conversion fails
 */
export const toNumericId = (id: string | number | undefined): number | undefined => {
  if (id === undefined) return undefined;
  
  if (typeof id === 'number') return id;
  
  const numId = parseInt(id, 10);
  return isNaN(numId) ? undefined : numId;
};

/**
 * Safely converts a string or number ID to a string
 * @param id The ID to convert
 * @returns The string ID or undefined if conversion fails
 */
export const toStringId = (id: string | number | undefined): string | undefined => {
  if (id === undefined) return undefined;
  return id.toString();
};

/**
 * Safely compares two IDs that might be of different types (string or number)
 * @param id1 First ID to compare
 * @param id2 Second ID to compare
 * @returns True if the IDs represent the same value
 */
export const isSameId = (id1: string | number | undefined, id2: string | number | undefined): boolean => {
  if (id1 === undefined || id2 === undefined) return false;
  
  return id1.toString() === id2.toString();
};
