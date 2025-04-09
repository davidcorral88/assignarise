
/**
 * Utilities for handling time format conversions
 */

/**
 * Format decimal hours to display with one decimal place
 * @param hours Decimal hours (e.g., 1.5 for 1 hour and 30 minutes)
 * @returns Hours with one decimal place (e.g., "1.5")
 */
export const formatHoursToTimeFormat = (hours: number): string => {
  if (isNaN(hours) || hours < 0) return "0.0";
  
  // Format to one decimal place
  return hours.toFixed(1);
};

/**
 * Convert time format (HH:MM) to decimal hours
 * @param timeStr Time in HH:MM format
 * @returns Decimal hours
 */
export const parseTimeFormatToHours = (timeStr: string): number => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  
  // If already a number, return it
  if (!isNaN(Number(timeStr))) return Number(timeStr);
  
  // Handle different format possibilities
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  return hours + (minutes / 60);
};
