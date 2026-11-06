import dns from 'node:dns/promises';
import {
  getSeverityFromWeight,
  INDICATOR_TITLES,
  URL_INDICATOR_WEIGHTS,
} from '../../config/scoring';
import type { CheckStatusValue, Indicator } from '../../types/analysis';

function buildDomainIndicator(type: string, evidence: string, description: string): Indicator {
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

function extractRootDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname;
  // Handle two-part TLDs like .co.id, .or.id, .com.au
  const secondLast = parts[parts.length - 2];
  if (['co', 'or', 'ac', 'go', 'biz', 'net', 'com'].includes(secondLast) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

function isPrivateIp(ip: string): boolean {
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('127.') ||
    ip === '::1'
  );
}

export async function inspectDomainAndDns(hostname: string): Promise<{
  indicators: Indicator[];
  dnsStatus: CheckStatusValue;
  dnsNote: string;
  ageStatus: CheckStatusValue;
  ageNote: string;
  details?: Record<string, unknown>;
}> {
  const indicators: Indicator[] = [];

  // 1. DNS Resolution Check
  let dnsStatus: CheckStatusValue = 'completed';
  let dnsNote = 'Resolusi DNS berhasil.';
  let resolvedIps: string[] = [];

  try {
    resolvedIps = await dns.resolve4(hostname);
    for (const ip of resolvedIps) {
      if (isPrivateIp(ip)) {
        indicators.push(
          buildDomainIndicator(
            'ip_private_host',
            ip,
            'Domain menyelesaikan ke alamat IP privat lokal, bukan IP server publik yang sah.'
          )
        );
        break;
      }
    }
    dnsNote = `DNS A record ditemukan: ${resolvedIps.slice(0, 3).join(', ')}`;
  } catch (err: any) {
    dnsStatus = 'partial';
    dnsNote = `Resolusi DNS tidak dapat menemukan record A: ${err.message || 'Domain tidak merespon'}`;
  }

  // 2. Domain Age Check via RDAP REST API
  let ageStatus: CheckStatusValue = 'skipped';
  let ageNote = 'Pemeriksaan usia domain dilewati.';
  const rootDomain = extractRootDomain(hostname);

  // Skip for raw IP or localhost
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || !hostname.includes('.')) {
    return {
      indicators,
      dnsStatus,
      dnsNote,
      ageStatus: 'skipped',
      ageNote: 'Pemeriksaan RDAP dilewati untuk host IP.',
    };
  }

  try {
    const rdapUrl = `https://rdap-bootstrap.arin.net/bootstrap/domain/${rootDomain}`;
    const response = await fetch(rdapUrl, {
      signal: AbortSignal.timeout(3500),
      headers: { Accept: 'application/rdap+json, application/json' },
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      const events: Array<{ eventAction: string; eventDate: string }> = data.events || [];
      const regEvent = events.find((e) => e.eventAction === 'registration');

      if (regEvent && regEvent.eventDate) {
        const regDate = new Date(regEvent.eventDate);
        const ageDays = Math.floor((Date.now() - regDate.getTime()) / (24 * 60 * 60 * 1000));

        if (ageDays < 30) {
          indicators.push(
            buildDomainIndicator(
              'very_new_domain',
              `${ageDays} hari lalu (${regEvent.eventDate})`,
              `Domain terdaftar kurang dari 30 hari (${ageDays} hari lalu). Domain baru memiliki risiko penipuan sangat tinggi.`
            )
          );
        } else if (ageDays < 90) {
          indicators.push(
            buildDomainIndicator(
              'recently_registered_domain',
              `${ageDays} hari lalu (${regEvent.eventDate})`,
              `Domain baru didaftarkan ${ageDays} hari yang lalu.`
            )
          );
        }

        ageStatus = 'completed';
        ageNote = `Usia domain terverifikasi (${ageDays} hari, didaftarkan pada ${regEvent.eventDate.split('T')[0]}).`;
      } else {
        ageStatus = 'partial';
        ageNote = 'Data tanggal registrasi tidak disertakan oleh server RDAP registrar.';
      }
    } else {
      ageStatus = 'partial';
      ageNote = `Server RDAP mengembalikan status HTTP ${response.status}.`;
    }
  } catch (err: any) {
    ageStatus = 'partial';
    ageNote = `Pemeriksaan RDAP waktu habis (timeout) atau registrar tidak mendukung: ${err.message}`;
  }

  return {
    indicators,
    dnsStatus,
    dnsNote,
    ageStatus,
    ageNote,
    details: {
      dns_ips: resolvedIps,
      root_domain: rootDomain,
    },
  };
}

