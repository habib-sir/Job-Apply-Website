/**
 * Generates URL-safe slugs supporting Bengali and English characters.
 */
export function generateSlug(title: string): string {
  if (!title) return '';

  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let result = '';
  for (const character of slug) {
    const next = result + character;
    if (new TextEncoder().encode(next).length > 180) break;
    result = next;
  }
  return result.replace(/-+$/g, '');
}

const MAX_PUBLIC_SLUG_BYTES = 160;

/** Use the legacy slug when it is safe; long records use their stable id. */
export function getPublicJobSlug(job: { slug?: string; id?: string } | null | undefined): string {
  const slug = String(job?.slug || '').trim();
  if (!slug) return String(job?.id || '').trim();
  if (new TextEncoder().encode(slug).length <= MAX_PUBLIC_SLUG_BYTES) return slug;
  return String(job?.id || slug).trim();
}
