/**
 * Generates URL-safe slugs supporting Bengali and English characters.
 */
export function generateSlug(title: string): string {
  if (!title) return '';
  
  return title
    .trim()
    .toLowerCase()
    // Replace punctuation and symbols with hyphens, preserve Bengali characters (\u0980-\u09FF) and English alphanumeric
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}
