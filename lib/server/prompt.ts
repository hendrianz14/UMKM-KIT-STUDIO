//const REQUIRED_PHRASE = "";

// const BANNED_KEYWORDS = [
//   "nude",
//   "nudity",
//   "weapon",
//   "gun",
//   "violence",
//   "blood",
//   "gore",
//   "kill",
//   "terror",
//   "extremist",
//   "explosive",
//   "self-harm",
// ];

// export function enforceRequiredPhrase(input: string): string {
//   if (!input) {
//     return REQUIRED_PHRASE;
//   }

//   const normalized = input.toLowerCase();
//   if (normalized.includes(REQUIRED_PHRASE)) {
//     return input;
//   }

//   const trimmed = input.trim();
//   const suffix = trimmed.endsWith('.') ? '' : '.';
//   return `${trimmed}${suffix} ${REQUIRED_PHRASE}.`;
// }

// export function detectBannedKeyword(input: string): string | null {
//   const normalized = input.toLowerCase();
//   for (const keyword of BANNED_KEYWORDS) {
//     if (normalized.includes(keyword)) {
//       return keyword;
//     }
//   }
//   return null;
// }

// export function getRequiredPhrase() {
//   return REQUIRED_PHRASE;
// }