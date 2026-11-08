import { formatNetworkError } from './networkErrors';
export interface ExtractedForm {
  action: string;
  method: string;
  hasPasswordInput: boolean;
  hasSensitiveFinancialInput: boolean;
  inputNames: string[];
}

export interface CrawlResult {
  status: 'completed' | 'failed' | 'skipped';
  httpStatus?: number;
  finalUrl?: string;
  contentType?: string;
  title?: string;
  metaDescription?: string;
  extractedText: string;
  hasPasswordInput: boolean;
  hasSensitiveFinancialInput: boolean;
  hasApkDownloadLink: boolean;
  isDirectApkDownload: boolean;
  detectedForms: ExtractedForm[];
  externalFormTargets: string[];
  apkLinks: string[];
  note: string;
}

const MAX_BYTES = 256 * 1024; // 256 KB max to avoid resource exhaustion
const CRAWL_TIMEOUT_MS = 6000; // 6 seconds timeout

/**
 * SSRF Guard: Prevent crawling private or loopback IP ranges
 */
export function isPrivateOrReservedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();

  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower === '0.0.0.0'
  ) {
    return true;
  }

  // IPv4 private & reserved ranges
  const ipMatch = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const a = parseInt(ipMatch[1], 10);
    const b = parseInt(ipMatch[2], 10);

    // 10.0.0.0/8
    if (a === 10) return true;
    // 127.0.0.0/8
    if (a === 127) return true;
    // 169.254.0.0/16 (link-local / cloud metadata)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
  }

  // Internal domain TLDs
  if (
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.lan') ||
    lower.endsWith('.home') ||
    lower.endsWith('.corp')
  ) {
    return true;
  }

  return false;
}

/**
 * Decode common HTML entities into plain characters
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return '';
      }
    });
}

/**
 * Safely extract readable text from HTML by stripping scripts, styles, and tags
 */
export function extractCleanText(html: string): string {
  let cleaned = html;

  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, ' ');

  // Remove script, style, svg, noscript blocks
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  cleaned = cleaned.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  // Replace block tags with space to preserve separation
  cleaned = cleaned.replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>/gi, ' ');

  // Remove remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode entities
  cleaned = decodeHtmlEntities(cleaned);

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Limit characters for prompt safety (first 3000 chars is sufficient for intent detection)
  return cleaned.slice(0, 3000);
}

/**
 * Extract form elements, input types, and action targets
 */
function analyzeHtmlForms(
  html: string,
  baseDomain: string
): {
  forms: ExtractedForm[];
  hasPasswordInput: boolean;
  hasSensitiveFinancialInput: boolean;
  externalFormTargets: string[];
} {
  const forms: ExtractedForm[] = [];
  const externalFormTargets: string[] = [];
  let globalHasPassword = false;
  let globalHasFinancial = false;

  // Global input search in case inputs are not wrapped in form tag
  const inputRegex = /<input\b([^>]*)>/gi;
  let inputMatch: RegExpExecArray | null;

  while ((inputMatch = inputRegex.exec(html)) !== null) {
    const attrs = inputMatch[1] || '';
    if (/\btype\s*=\s*["']?password["']?/i.test(attrs)) {
      globalHasPassword = true;
    }
    if (
      /\b(?:name|id|placeholder)\s*=\s*["']?[^"']*(?:pin|cvv|rekening|atm|kartu|nik|ktp|otp)[^"']*/i.test(
        attrs
      )
    ) {
      globalHasFinancial = true;
    }
  }

  // Parse <form> blocks
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let formMatch: RegExpExecArray | null;

  while ((formMatch = formRegex.exec(html)) !== null) {
    const formAttrs = formMatch[1] || '';
    const formBody = formMatch[2] || '';

    const actionMatch = formAttrs.match(/\baction\s*=\s*["']([^"']*)["']/i);
    const methodMatch = formAttrs.match(/\bmethod\s*=\s*["']([^"']*)["']/i);

    const action = actionMatch ? actionMatch[1].trim() : '';
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    let formHasPassword = false;
    let formHasFinancial = false;
    const inputNames: string[] = [];

    const innerInputRegex = /<input\b([^>]*)>/gi;
    let innerMatch: RegExpExecArray | null;

    while ((innerMatch = innerInputRegex.exec(formBody)) !== null) {
      const attrs = innerMatch[1] || '';
      const nameMatch = attrs.match(/\b(?:name|id)\s*=\s*["']([^"']+)["']/i);
      if (nameMatch) {
        inputNames.push(nameMatch[1]);
      }

      if (/\btype\s*=\s*["']?password["']?/i.test(attrs)) {
        formHasPassword = true;
        globalHasPassword = true;
      }

      if (
        /\b(?:name|id|placeholder)\s*=\s*["']?[^"']*(?:pin|cvv|rekening|atm|kartu|nik|ktp|otp)[^"']*/i.test(
          attrs
        )
      ) {
        formHasFinancial = true;
        globalHasFinancial = true;
      }
    }

    // Check if form action submits to an external domain or suspicious endpoint
    if (action.startsWith('http://') || action.startsWith('https://')) {
      try {
        const actionUrl = new URL(action);
        if (
          !actionUrl.hostname.endsWith(baseDomain) &&
          !baseDomain.endsWith(actionUrl.hostname)
        ) {
          externalFormTargets.push(action);
        }
      } catch {
        // Ignore invalid URL
      }
    } else if (action.includes('api.telegram.org') || action.includes('wa.me')) {
      externalFormTargets.push(action);
    }

    forms.push({
      action,
      method,
      hasPasswordInput: formHasPassword,
      hasSensitiveFinancialInput: formHasFinancial,
      inputNames,
    });
  }

  return {
    forms,
    hasPasswordInput: globalHasPassword,
    hasSensitiveFinancialInput: globalHasFinancial,
    externalFormTargets,
  };
}

/**
 * Look for direct APK or installer download links in HTML
 */
function findApkLinks(html: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a\b[^>]*\bhref\s*=\s*["']([^"']+\.apk(?:[?#][^"']*)?)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }

  return links;
}

/**
 * Crawl a target URL safely and extract metadata, form structures, and text
 */
export async function crawlWebPage(targetUrl: string): Promise<CrawlResult> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return {
      status: 'failed',
      extractedText: '',
      hasPasswordInput: false,
      hasSensitiveFinancialInput: false,
      hasApkDownloadLink: false,
      isDirectApkDownload: false,
      detectedForms: [],
      externalFormTargets: [],
      apkLinks: [],
      note: 'Format URL tidak valid untuk perayapan konten.',
    };
  }

  // SSRF check
  if (isPrivateOrReservedHost(parsed.hostname)) {
    return {
      status: 'skipped',
      extractedText: '',
      hasPasswordInput: false,
      hasSensitiveFinancialInput: false,
      hasApkDownloadLink: false,
      isDirectApkDownload: false,
      detectedForms: [],
      externalFormTargets: [],
      apkLinks: [],
      note: 'Perayapan dibatalkan: Alamat IP atau host privat dilarang demi keamanan (SSRF Protection).',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CRAWL_TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ScamoraCrawler/2.0 (+https://scamora.ai)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const finalUrl = response.url || targetUrl;
    const httpStatus = response.status;
    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    // Direct APK download detection
    if (
      contentType.includes('application/vnd.android.package-archive') ||
      finalUrl.toLowerCase().endsWith('.apk')
    ) {
      return {
        status: 'completed',
        httpStatus,
        finalUrl,
        contentType,
        extractedText: 'Tautan mengarahkan langsung ke pengunduhan berkas APK Android.',
        hasPasswordInput: false,
        hasSensitiveFinancialInput: false,
        hasApkDownloadLink: true,
        isDirectApkDownload: true,
        detectedForms: [],
        externalFormTargets: [],
        apkLinks: [finalUrl],
        note: 'Perayapan mendeteksi pengunduhan berkas biner aplikasi (.apk) secara langsung.',
      };
    }

    // Only process text / html responses
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return {
        status: 'completed',
        httpStatus,
        finalUrl,
        contentType,
        extractedText: '',
        hasPasswordInput: false,
        hasSensitiveFinancialInput: false,
        hasApkDownloadLink: false,
        isDirectApkDownload: false,
        detectedForms: [],
        externalFormTargets: [],
        apkLinks: [],
        note: `Perayapan selesai: Konten non-HTML (${contentType || 'biner'}) tidak diproses lebih lanjut.`,
      };
    }

    // Read response with max byte limit
    const reader = response.body?.getReader();
    let receivedBytes = 0;
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (receivedBytes < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
        }
      }
      reader.cancel();
    }

    const totalBuffer = Buffer.concat(chunks);
    const html = totalBuffer.toString('utf-8');

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1]).replace(/\s+/g, ' ').trim() : undefined;

    // Extract Meta Description
    const metaMatch =
      html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const metaDescription = metaMatch ? decodeHtmlEntities(metaMatch[1]).trim() : undefined;

    // Analyze forms and inputs
    const baseHost = parsed.hostname.toLowerCase();
    const { forms, hasPasswordInput, hasSensitiveFinancialInput, externalFormTargets } =
      analyzeHtmlForms(html, baseHost);

    // Look for APK download links
    const apkLinks = findApkLinks(html);
    const hasApkDownloadLink = apkLinks.length > 0;

    // Extract readable text
    const extractedText = extractCleanText(html);

    return {
      status: 'completed',
      httpStatus,
      finalUrl,
      contentType,
      title,
      metaDescription,
      extractedText,
      hasPasswordInput,
      hasSensitiveFinancialInput,
      hasApkDownloadLink,
      isDirectApkDownload: false,
      detectedForms: forms,
      externalFormTargets,
      apkLinks,
      note: `Perayapan berhasil (HTTP ${httpStatus}). Ditemukan ${forms.length} form, title: "${title || 'Tidak ada'}"`,
    };
  } catch (err: any) {
    const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
    return {
      status: 'failed',
      extractedText: '',
      hasPasswordInput: false,
      hasSensitiveFinancialInput: false,
      hasApkDownloadLink: false,
      isDirectApkDownload: false,
      detectedForms: [],
      externalFormTargets: [],
      apkLinks: [],
      note: isAbort
        ? 'Perayapan konten melebihi batas waktu (timeout 6 detik). Server target lambat atau menolak bot.'
        : `Gagal merayapi konten web: ${formatNetworkError(err)}`,
    };
  }
}

