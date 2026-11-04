export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

export function isEvidenceInText(evidenceQuote: string, sourceText: string): boolean {
  if (!evidenceQuote || !sourceText) {
    return false;
  }

  const cleanQuote = normalizeWhitespace(evidenceQuote);
  const cleanSource = normalizeWhitespace(sourceText);

  if (cleanQuote.length === 0) {
    return false;
  }

  return cleanSource.includes(cleanQuote);
}

