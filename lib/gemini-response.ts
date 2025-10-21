import type { GenerateContentResponse, Part } from '@google/genai';

type TextPart = Part & { text: string };
type InlineDataPart = Part & {
  inlineData: {
    data: string;
    mimeType: string;
  };
};

function isTextPart(part: Part): part is TextPart {
  return typeof (part as { text?: unknown }).text === 'string';
}

function isInlineDataPart(part: Part): part is InlineDataPart {
  const inlineData = (part as { inlineData?: { data?: unknown; mimeType?: unknown } }).inlineData;
  return typeof inlineData?.data === 'string' && typeof inlineData?.mimeType === 'string';
}

export function extractTextFromResponse(response: GenerateContentResponse): string {
  if (typeof response.text === 'string' && response.text.trim()) {
    return response.text;
  }

  const candidate = response.candidates?.find((item) => item.content?.parts?.some(isTextPart));
  if (!candidate?.content?.parts) {
    return '';
  }

  const textPart = candidate.content.parts.find(isTextPart);
  return textPart?.text ?? '';
}

export function findFirstInlineData(response: GenerateContentResponse) {
  const candidate = response.candidates?.find((item) => item.content?.parts?.some(isInlineDataPart));
  if (!candidate?.content?.parts) {
    return null;
  }

  return candidate.content.parts.find(isInlineDataPart)?.inlineData ?? null;
}
