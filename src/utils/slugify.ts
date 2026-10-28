/**
 * Generates URL-safe slugs supporting Bengali and English characters.
 */
export function generateSlug(title: string): string {
  if (!title) return '';

  const slug = title
    .trim()
    .toLowerCase()
    // Replace punctuation and symbols with hyphens, preserve Bengali characters (\u0980-\u09FF) and English alphanumeric
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // GitHub Pages/filesystems limit one path segment to roughly 255 bytes;
  // Bengali characters use multiple UTF-8 bytes, so a character-count limit
  // alone is not sufficient for generated static routes.
  let result = '';
  for (const character of slug) {
    const next = result + character;
    if (new TextEncoder().encode(next).length > 180) break;
    result = next;
  }
  return result.replace(/-+$/g, '');
}
