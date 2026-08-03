export function generateTitleFromMessage(message: string): string {
  // Remove common prefixes
  let title = message
    .replace(/^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did|please|help|explain|tell me|describe|write|create|make|give me)\s+/i, "")
    .replace(/[?!.]$/, "")
    .trim();

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Truncate if too long (max 50 characters)
  if (title.length > 50) {
    title = title.substring(0, 47) + "...";
  }

  // Fallback if title is empty after processing
  if (!title) {
    return "New Chat";
  }

  return title;
}
