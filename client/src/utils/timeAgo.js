import { formatDistanceToNowStrict } from "date-fns";

/**
 * Formats a timestamp as a compact relative string (e.g. "3m", "2h", "5d").
 */
export function timeAgo(date) {
  if (!date) return "";
  const result = formatDistanceToNowStrict(new Date(date));
  return result
    .replace(" seconds", "s")
    .replace(" second", "s")
    .replace(" minutes", "m")
    .replace(" minute", "m")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d")
    .replace(" months", "mo")
    .replace(" month", "mo")
    .replace(" years", "y")
    .replace(" year", "y");
}
