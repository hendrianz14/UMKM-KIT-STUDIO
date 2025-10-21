/**
 * Extracts a JSON object from a markdown code block.
 * @param markdown The markdown string to parse.
 * @returns The extracted JSON string, or null if not found.
 */
export function extractJsonFromMarkdown(markdown: string): string | null {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = markdown.match(jsonRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Fallback for cases where the AI might not use the markdown block
  // and returns a string that is a valid JSON object.
  try {
    JSON.parse(markdown.trim());
    return markdown.trim();
  } catch (e) {
    return null;
  }
}
