import {
  getSeverityFromWeight,
  INDICATOR_TITLES,
  URL_INDICATOR_WEIGHTS,
} from '../../config/scoring';
import type { Indicator } from '../../types/analysis';
import type { CrawlResult } from './pageCrawler';

const TRUSTED_DOMAINS = [
  'bca.co.id',
  'klikbca.com',
  'bankmandiri.co.id',
  'mandiri.co.id',
  'bri.co.id',
  'bni.co.id',
  'cimbniaga.co.id',
  'shopee.co.id',
  'tokopedia.com',
  'gojek.com',
  'dana.id',
  'ovo.id',
  'google.com',
  'google.co.id',
  'facebook.com',
  'instagram.com',
  'whatsapp.com',
  'telegram.org',
  'pajak.go.id',
  'kominfo.go.id',
  'polri.go.id',
];

const KNOWN_BRAND_NAMES: Record<string, string[]> = {
  BCA: ['bca', 'klikbca', 'bank central asia', 'mybca', 'halo bca'],
  Mandiri: ['mandiri', 'livin by mandiri', 'bank mandiri'],
  BRI: ['bri', 'brimo', 'bank rakyat indonesia'],
  BNI: ['bni', 'bni mobile', 'bank negara indonesia'],
  Shopee: ['shopee', 'shopeepay'],
  Tokopedia: ['tokopedia', 'tokopedia care'],
  DANA: ['dana dompet digital', 'akun dana'],
  Pajak: ['djp online', 'direktorat jenderal pajak', 'tagihan pajak'],
  Kurir: ['j&t express', 'jne express', 'sicepat', 'kurir paket'],
};

function buildCrawlerIndicator(
  type: string,
  evidence: string,
  description: string
): Indicator {
  const weight = URL_INDICATOR_WEIGHTS[type] || 25;
  const severity = getSeverityFromWeight(weight);
  const title = INDICATOR_TITLES[type] || type;

  return {
    type,
    title,
    severity,
    weight,
    source: 'web_crawler',
    evidence,
    description,
  };
}

export function scanCrawlHeuristics(
  parsedUrl: URL,
  crawl: CrawlResult
): Indicator[] {
  const indicators: Indicator[] = [];
  const hostname = parsedUrl.hostname.toLowerCase();

  const isTrusted = TRUSTED_DOMAINS.some(
    (td) => hostname === td || hostname.endsWith('.' + td)
  );

  // 1. Direct or Linked APK Download (High threat - APK fraud/malware)
  if (crawl.isDirectApkDownload || crawl.hasApkDownloadLink) {
    const apkTarget = crawl.apkLinks[0] || crawl.finalUrl || parsedUrl.pathname;
    indicators.push(
      buildCrawlerIndicator(
        'malicious_apk_download',
        apkTarget,
        'Halaman web menyediakan atau memicu pengunduhan berkas aplikasi Android (.apk) secara langsung, indikasi kuat modus malware surat undangan/paket kurir/surat tilang.'
      )
    );
  }

  // If domain is trusted official domain, don't flag legitimate login forms
  if (!isTrusted) {
    // 2. Credential harvesting (password input on untrusted host)
    if (crawl.hasPasswordInput) {
      indicators.push(
        buildCrawlerIndicator(
          'credential_harvesting_form',
          `<input type="password"> terdeteksi pada host ${hostname}`,
          'Ditemukan formulir input kata sandi pada domain yang tidak terafiliasi sebagai portal resmi institusi terkait.'
        )
      );
    }

    // 3. Financial data input (PIN, CVV, Rekening, ATM)
    if (crawl.hasSensitiveFinancialInput) {
      indicators.push(
        buildCrawlerIndicator(
          'financial_data_request',
          `Input data finansial/PIN/CVV/OTP terdeteksi pada form web`,
          'Halaman meminta data perbankan rahasia (PIN ATM, kode CVV, atau nomor rekening) di luar platform resmi.'
        )
      );
    }

    // 4. Form Action sends data to external/suspicious host or Telegram webhook
    if (crawl.externalFormTargets.length > 0) {
      indicators.push(
        buildCrawlerIndicator(
          'external_form_action',
          crawl.externalFormTargets[0],
          'Formulir mengirimkan data masukan korban ke server eksternal pihak ketiga atau webhook otomatis.'
        )
      );
    }

    // 5. Brand Impersonation in Title or Content
    const pageContext = `${crawl.title || ''} ${crawl.metaDescription || ''} ${crawl.extractedText}`.toLowerCase();
    for (const [brandLabel, brandAliases] of Object.entries(KNOWN_BRAND_NAMES)) {
      const matchAlias = brandAliases.find((alias) => pageContext.includes(alias));
      if (matchAlias) {
        // Check if hostname actually belongs to this brand
        const hostMatchesBrand = brandAliases.some((alias) =>
          hostname.replace(/[^a-z0-9]/g, '').includes(alias.replace(/[^a-z0-9]/g, ''))
        );

        if (!hostMatchesBrand || !isTrusted) {
          indicators.push(
            buildCrawlerIndicator(
              'brand_impersonation_content',
              crawl.title ? `Judul: "${crawl.title}"` : `Merek "${brandLabel}" dicatut pada konten`,
              `Halaman menampilkan nama atau identitas ${brandLabel}, namun di-hosting pada domain tidak resmi (${hostname}).`
            )
          );
          break;
        }
      }
    }

    // 6. Fake Giveaway / Prize Claim Content
    if (
      /(undian berhadiah|selamat anda memenangkan|klaim hadiah|roda putar|pemenang resmi|hadiah tunai|voucher gratis)\b/i.test(
        pageContext
      )
    ) {
      const match = pageContext.match(
        /([^\.\n]*?(?:undian|hadiah|memenangkan|roda putar|voucher gratis)[^\.\n]*)/i
      );
      indicators.push(
        buildCrawlerIndicator(
          'fake_giveaway_content',
          match ? match[0].trim().slice(0, 100) : 'klaim undian hadiah',
          'Konten halaman memuat janji hadiah atau undian tidak wajar untuk memancing korban memasukkan identitas.'
        )
      );
    }

    // 7. Urgency / Threat manipulation in Content
    if (
      /(akun diblokir|penutupan rekening|segera verifikasi dalam|waktu tersisa \d+|blokir permanen)\b/i.test(
        pageContext
      )
    ) {
      const match = pageContext.match(
        /([^\.\n]*?(?:diblokir|penutupan|verifikasi|tersisa)[^\.\n]*)/i
      );
      indicators.push(
        buildCrawlerIndicator(
          'urgency_scam_content',
          match ? match[0].trim().slice(0, 100) : 'ancaman pemblokiran akun',
          'Konten halaman memanfaatkan teknik manipulasi rasa takut dan desakan waktu agar korban terburu-buru mengisi data.'
        )
      );
    }
  }

  return indicators;
}

