
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date | null, formatStr: string = "PP") {
  if (!dateString) return "";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

export function formatDistanceToNow(dateString?: string | Date | null) {
  if (!dateString) return "";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date distance:", error);
    return "";
  }
}

export function createId(length: number = 6): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
