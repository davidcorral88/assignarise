
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts decimal hours to hh:mm format
 * @param decimalHours number of hours in decimal format (e.g., 1.5 for 1h 30min)
 * @returns string in format "hh:mm"
 */
export function decimalToTimeFormat(decimalHours: number | string): string {
  if (typeof decimalHours === 'string') {
    if (!decimalHours || decimalHours === '') return '';
    decimalHours = parseFloat(decimalHours);
    if (isNaN(decimalHours)) return '';
  }
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts time in hh:mm format to decimal hours
 * @param timeString string in format "hh:mm"
 * @returns decimal hours (e.g., 1.5 for "01:30")
 */
export function timeFormatToDecimal(timeString: string): number {
  if (!timeString) return 0;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  return parseFloat((hours + minutes / 60).toFixed(1));
}
