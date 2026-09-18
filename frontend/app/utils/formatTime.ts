import { formatDistanceToNow } from "date-fns";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Formats an article's original publish time (never fetch/scrape time):
 * relative ("5m ago") within the last 24h, absolute date beyond that.
 */
export function formatArticleTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();

  if (diffMs < ONE_DAY_MS) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}
