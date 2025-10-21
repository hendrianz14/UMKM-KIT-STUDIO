/**
 * Extracts a JSON string from a Markdown code block.
 * Handles cases with or without the "json" language identifier.
 * @param markdownText The text that may contain a JSON code block.
 * @returns The extracted JSON string, or null if not found.
 */
export function extractJsonFromMarkdown(markdownText: string): string | null {
  // Regex to find a JSON block enclosed in triple backticks, with an optional "json" language tag.
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = markdownText.match(jsonBlockRegex);

  // If a markdown block is found, return the content inside it.
  if (match && match[1]) {
    return match[1].trim();
  }

  // As a fallback, if the model forgets the backticks, check if the whole string is a valid JSON.
  // This is less robust but can handle simple cases.
  try {
    // Attempt to parse the entire string to see if it's a JSON object or array.
    const parsed = JSON.parse(markdownText);
    if (typeof parsed === 'object' && parsed !== null) {
      return markdownText.trim();
    }
  } catch (e) {
    // The string is not a plain JSON object, so we can't use it.
  }

  // If no JSON is found, return null.
  return null;
}
