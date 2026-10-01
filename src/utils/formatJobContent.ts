/**
 * Smart Job Content Formatter
 * Automatically detects whether text is raw plain-text or HTML,
 * and formats raw text into clean, structured HTML with paragraphs,
 * lists, bold headers, and badges without requiring manual HTML editing.
 */
export function formatJobContent(content: string): string {
  if (!content) return '';

  const trimmed = content.trim();

  // If already full HTML with paragraph or block tags, return as-is
  const hasHtmlBlocks = /<(p|div|table|ul|ol|h[1-6]|blockquote)[\s>]/i.test(trimmed);
  if (hasHtmlBlocks) {
    return trimmed;
  }

  // Convert plain text into styled HTML
  const lines = trimmed.split(/\r?\n/);
  const result: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    if (!rawLine) {
      if (inBulletList) {
        result.push('</ul>');
        inBulletList = false;
      }
      if (inNumberedList) {
        result.push('</ol>');
        inNumberedList = false;
      }
      continue;
    }

    // Check for bullet list (-, *, •, ▪)
    const bulletMatch = rawLine.match(/^[-*•▪]\s*(.+)$/);
    if (bulletMatch) {
      if (!inBulletList) {
        if (inNumberedList) {
          result.push('</ol>');
          inNumberedList = false;
        }
        result.push('<ul class="list-disc pl-5 my-2 space-y-1">');
        inBulletList = true;
      }
      result.push(`<li>${formatInlineStyles(bulletMatch[1])}</li>`);
      continue;
    }

    // Check for numbered list (1., 2., ১., ২., ইত্যাদি)
    const numberedMatch = rawLine.match(/^([0-9১-৯]+)[.)]\s*(.+)$/);
    if (numberedMatch) {
      if (!inNumberedList) {
        if (inBulletList) {
          result.push('</ul>');
          inBulletList = false;
        }
        result.push('<ol class="list-decimal pl-5 my-2 space-y-1">');
        inNumberedList = true;
      }
      result.push(`<li>${formatInlineStyles(numberedMatch[2])}</li>`);
      continue;
    }

    // Close open lists if we encountered normal line
    if (inBulletList) {
      result.push('</ul>');
      inBulletList = false;
    }
    if (inNumberedList) {
      result.push('</ol>');
      inNumberedList = false;
    }

    // Check for section headings (e.g. "আবেদনের শর্তাবলী:", "শিক্ষাগত যোগ্যতা:", "পদের বিবরণ:", "জরুরি তারিখ:")
    const isHeading =
      rawLine.endsWith(':') ||
      rawLine.endsWith('ঃ') ||
      /^(পদের নাম|শিক্ষাগত যোগ্যতা|বয়সসীমা|বয়স সীমা|আবেদনের নিয়ম|আবেদন প্রক্রিয়া|বেতন স্কেল|শর্তাবলী|আবেদনের শেষ তারিখ|প্রয়োজনীয় কাগজপত্র|ফি পরিশোধের নিয়ম)/i.test(
        rawLine
      );

    if (isHeading && rawLine.length < 80) {
      result.push(
        `<h3 class="text-sm font-bold text-gray-900 mt-4 mb-2 pb-1 border-b border-gray-100 flex items-center gap-1.5"><span class="w-1.5 h-3.5 bg-emerald-600 rounded-full inline-block"></span>${formatInlineStyles(
          rawLine
        )}</h3>`
      );
      continue;
    }

    // Normal paragraph line
    result.push(`<p class="mb-2 text-gray-700 leading-relaxed">${formatInlineStyles(rawLine)}</p>`);
  }

  if (inBulletList) result.push('</ul>');
  if (inNumberedList) result.push('</ol>');

  return result.join('\n');
}

/**
 * Format inline text (bolding key: value pairs, URLs, dates)
 */
function formatInlineStyles(text: string): string {
  // Turn "মূল শব্দ: বিবরণ" into bold label
  let formatted = text.replace(
    /^([^:\n]{2,25})[:ঃ]\s*(.+)$/,
    '<strong>$1:</strong> $2'
  );

  // Turn URLs into clickable links
  formatted = formatted.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-emerald-700 underline font-medium hover:text-emerald-800">$1</a>'
  );

  return formatted;
}
