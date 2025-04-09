
/**
 * Utilities for handling time format conversions
 */

/**
 * Convert decimal hours to time format (HH:MM)
 * @param hours Decimal hours (e.g., 1.5 for 1 hour and 30 minutes)
 * @returns Time in HH:MM format
 */
export const formatHoursToTimeFormat = (hours: number): string => {
  if (isNaN(hours) || hours < 0) return "0:00";
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  // Handle case where rounding minutes results in 60
  if (minutes === 60) {
    return `${wholeHours + 1}:00`;
  }
  
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
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
