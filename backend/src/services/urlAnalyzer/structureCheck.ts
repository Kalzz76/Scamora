import {
  getSeverityFromWeight,
  INDICATOR_TITLES,
  URL_INDICATOR_WEIGHTS,
} from '../../config/scoring';
import type { Indicator } from '../../types/analysis';

const RISKY_TLDS = [
  '.xyz',
  '.top',
  '.work',
  '.click',
  '.loan',
  '.fit',
  '.gq',
  '.cf',
  '.ga',
  '.ml',
  '.zip',
  '.mov',
  '.surf',
  '.buzz',
];

const KNOWN_BRANDS = [
  'bca',
  'mandiri',
  'bri',
  'bni',
  'cimb',
  'shopee',
  'tokopedia',
  'gojek',
  'dana',
  'ovo',
  'whatsapp',
  'telegram',
  'facebook',
  'instagram',
  'google',
];

const SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'cutt.ly',
  'is.gd',
  's.id',
  'shorturl.at',
  'rb.gy',
];

const SENSITIVE_KEYWORDS = [
  'login',
  'verifikasi',
  'otp',
  'hadiah',
  'klaim',
  'claim',
  'rekening',
  'update',
  'bantuan',
];

function buildIndicator(
  type: string,
  evidence: string,
  description: string
): Indicator {
  const weight = URL_INDICATOR_WEIGHTS[type] || 10;
  const severity = getSeverityFromWeight(weight);
  const title = INDICATOR_TITLES[type] || type;

  return {
    type,
    title,
    severity,
    weight,
    source: 'url_structure',
    evidence,
    description,
  };
}

export function checkUrlStructure(
  parsedUrl: URL,
  hasUserInfo: boolean,
  originalUrl: string
): Indicator[] {
  const indicators: Indicator[] = [];
  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = (parsedUrl.pathname + parsedUrl.search).toLowerCase();

  if (parsedUrl.protocol === 'http:') {
    indicators.push(
      buildIndicator(
        'no_https',
        'http://',
        'Protokol tautan tidak menggunakan enkripsi standar HTTPS.'
      )
    );
  }

  if (hasUserInfo) {
    indicators.push(
      buildIndicator(
        'userinfo_in_url',
        'user:pass@host',
        'Terdapat tanda kredensial login yang disisipkan sebelum alamat host.'
      )
    );
  }

  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIp) {
    indicators.push(
      buildIndicator(
        'ip_host',
        hostname,
        'Host menggunakan alamat IP langsung untuk menyamarkan identitas domain.'
      )
    );
  }

  for (const shortener of SHORTENERS) {
    if (hostname === shortener || hostname.endsWith('.' + shortener)) {
      indicators.push(
        buildIndicator(
          'url_shortener',
          hostname,
          'Tautan menggunakan layanan pemendek URL sehingga tujuan akhir tersembunyi.'
        )
      );
      break;
    }
  }

  for (const tld of RISKY_TLDS) {
    if (hostname.endsWith(tld)) {
      indicators.push(
        buildIndicator(
          'risky_tld',
          tld,
          'Domain menggunakan ekstensi yang kerap disalahgunakan dalam aksi penipuan.'
        )
      );
      break;
    }
  }

  const hostParts = hostname.split('.');
  if (hostParts.length >= 2) {
    const domainRoot = hostParts.slice(-2).join('.');
    for (const brand of KNOWN_BRANDS) {
      if (hostname.includes(brand)) {
        if (!domainRoot.includes(brand)) {
          indicators.push(
            buildIndicator(
              'brand_in_subdomain',
              hostname,
              `Nama institusi resmi (${brand.toUpperCase()}) diletakkan pada subdomain untuk mengelabui korban.`
            )
          );
          break;
        }
      }
    }
  }

  if (originalUrl.includes('xn--') || hostname.includes('xn--')) {
    indicators.push(
      buildIndicator(
        'punycode_homograph',
        'xn--',
        'Domain memakai format punycode yang menyerupai karakter alfabet resmi.'
      )
    );
  }

  if (hostParts.length >= 2) {
    const mainDomain = hostParts.slice(-2, -1)[0] || '';
    for (const brand of KNOWN_BRANDS) {
      if (mainDomain !== brand && (
        mainDomain.startsWith(`${brand}-`) ||
        mainDomain.endsWith(`-${brand}`) ||
        mainDomain.startsWith(`${brand}official`) ||
        mainDomain.endsWith(`${brand}center`) ||
        mainDomain.includes(`${brand}secure`) ||
        mainDomain === `${brand}a` ||
        mainDomain === `${brand}s`
      )) {
        indicators.push(
          buildIndicator(
            'typosquatting',
            mainDomain,
            `Nama domain menyerupai merek terpercaya (${brand.toUpperCase()}) secara tidak wajar.`
          )
        );
        break;
      }
    }
  }

  if (hostParts.length >= 5) {
    indicators.push(
      buildIndicator(
        'excessive_subdomains',
        hostname,
        'Struktur subdomain bertingkat empat level atau lebih yang tidak lazim.'
      )
    );
  }

  for (const kw of SENSITIVE_KEYWORDS) {
    if (pathname.includes(kw)) {
      indicators.push(
        buildIndicator(
          'sensitive_keywords',
          kw,
          `Ditemukan kata kunci berisiko manipulasi (${kw}) pada jalur alamat web.`
        )
      );
      break;
    }
  }

  if (parsedUrl.port && !['80', '443', '8080'].includes(parsedUrl.port)) {
    indicators.push(
      buildIndicator(
        'unusual_port',
        parsedUrl.port,
        `Tautan menggunakan nomor port (${parsedUrl.port}) yang tidak standar.`
      )
    );
  }

  if (originalUrl.length > 120 || (originalUrl.match(/%[0-9a-fA-F]{2}/g) || []).length >= 5) {
    indicators.push(
      buildIndicator(
        'long_encoded_url',
        originalUrl.slice(0, 40) + '...',
        'Tautan sangat panjang atau menyematkan banyak karakter ter-encode yang mencurigakan.'
      )
    );
  }

  return indicators;
}

