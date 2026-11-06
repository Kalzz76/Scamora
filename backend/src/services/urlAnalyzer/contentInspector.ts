import {
  getSeverityFromWeight,
  INDICATOR_TITLES,
  URL_INDICATOR_WEIGHTS,
} from '../../config/scoring';
import type { CheckStatusValue, Indicator } from '../../types/analysis';

function buildContentIndicator(type: string, evidence: string, description: string): Indicator {
  const weight = URL_INDICATOR_WEIGHTS[type] || 15;
  return {
    type,
    title: INDICATOR_TITLES[type] || type,
    severity: getSeverityFromWeight(weight),
    weight,
    source: 'reputation',
    evidence,
    description,
  };
}

export async function inspectLiveContent(targetUrl: string): Promise<{
  indicators: Indicator[];
  status: CheckStatusValue;
  note: string;
  details?: Record<string, unknown>;
}> {
  const indicators: Indicator[] = [];

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (Scamora-Security-Auditor)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(4000),
    });

    const status = response.status;
    const headers = response.headers;

    // Check missing security headers
    const hasFrameOptions = headers.has('x-frame-options');
    const hasContentTypeOptions = headers.has('x-content-type-options');
    if (!hasFrameOptions || !hasContentTypeOptions) {
      indicators.push(
        buildContentIndicator(
          'missing_security_headers',
          `X-Frame-Options: ${hasFrameOptions ? 'Ada' : 'Absen'}, X-Content-Type-Options: ${hasContentTypeOptions ? 'Ada' : 'Absen'}`,
          'Situs web mengabaikan header pertahanan browser standar (rentan teknik Clickjacking & MIME-sniffing).'
        )
      );
    }

    const contentType = headers.get('content-type') || '';
    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      // Read at most 500KB of HTML to ensure speed and memory safety
      const text = await response.text();
      const htmlSlice = text.slice(0, 500000);

      // Check for password inputs
      const hasPasswordInput = /<input[^>]+type=["']password["']/i.test(htmlSlice);
      if (hasPasswordInput) {
        // Find the form containing the password input
        const forms = htmlSlice.match(/<form[\s\S]*?<\/form>/gi) || [];
        for (const formHtml of forms) {
          if (/<input[^>]+type=["']password["']/i.test(formHtml)) {
            const isGetMethod = /method=["']get["']/i.test(formHtml);
            const isSuspiciousAction = /action=["'](javascript:|#|)["']/i.test(formHtml);

            if (isGetMethod || isSuspiciousAction) {
              indicators.push(
                buildContentIndicator(
                  'password_form_insecure',
                  formHtml.slice(0, 100),
                  'Ditemukan formulir pengisian password berbahaya yang dikirim tanpa enkripsi POST atau dengan aksi mencurigakan.'
                )
              );
              break;
            }
          }
        }
      }

      // Check for hidden iframes (commonly used in clickjacking & credential overlays)
      const hasHiddenIframe =
        /<iframe[^>]+style=["'][^"']*(display:\s*none|visibility:\s*hidden)[^"']*["']/i.test(htmlSlice) ||
        /<iframe[^>]+hidden/i.test(htmlSlice);

      if (hasHiddenIframe) {
        indicators.push(
          buildContentIndicator(
            'hidden_iframe',
            'iframe[style*="hidden|none"]',
            'Terdeteksi elemen iframe yang disembunyikan secara visual (potensi eksploitasi Clickjacking).'
          )
        );
      }
    }

    return {
      indicators,
      status: 'completed',
      note: `Analisis konten halaman selesai (Status HTTP: ${status}).`,
      details: {
        http_status: status,
        final_url: response.url,
      },
    };
  } catch (err: any) {
    return {
      indicators,
      status: 'partial',
      note: `Inspeksi konten web dilewati atau tidak merespon: ${err.message}`,
    };
  }
}

