
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert decimal hours to HH:MM format
export function hoursToTimeFormat(hours: number): string {
  if (isNaN(hours)) return "00:00";
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  // Handle the case where minutes round to 60
  if (minutes === 60) {
    return `${wholeHours + 1}:00`;
  }
  
  return `${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Convert HH:MM format to decimal hours
export function timeFormatToHours(timeString: string): number {
  if (!timeString || timeString === "") return 0;
  
  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  return hours + (minutes / 60);
}
