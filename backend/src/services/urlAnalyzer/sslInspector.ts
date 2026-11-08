import tls from 'node:tls';
import { formatNetworkError } from './networkErrors';
import {
  getSeverityFromWeight,
  INDICATOR_TITLES,
  URL_INDICATOR_WEIGHTS,
} from '../../config/scoring';
import type { CheckStatusValue, Indicator } from '../../types/analysis';

function buildSslIndicator(type: string, evidence: string, description: string): Indicator {
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

export async function inspectSslCertificate(hostname: string): Promise<{
  indicators: Indicator[];
  status: CheckStatusValue;
  note: string;
  details?: Record<string, unknown>;
}> {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || !hostname.includes('.')) {
    return {
      indicators: [],
      status: 'skipped',
      note: 'Inspeksi sertifikat SSL dilewati untuk alamat host IP atau lokal.',
    };
  }

  return new Promise((resolve) => {
    const indicators: Indicator[] = [];
    let isResolved = false;

    const timeoutTimer = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        resolve({
          indicators: [],
          status: 'partial',
          note: 'Pemeriksaan handshake SSL/TLS melebihi batas waktu (timeout).',
        });
      }
    }, 3500);

    try {
      const socket = tls.connect(
        {
          host: hostname,
          port: 443,
          servername: hostname,
          rejectUnauthorized: false,
        },
        () => {
          if (isResolved) return;
          clearTimeout(timeoutTimer);
          isResolved = true;

          const cert = socket.getPeerCertificate();
          socket.destroy();

          if (!cert || !cert.valid_to) {
            resolve({
              indicators: [],
              status: 'partial',
              note: 'Server tidak mengembalikan sertifikat SSL/TLS publik.',
            });
            return;
          }

          const now = Date.now();
          const validTo = new Date(cert.valid_to).getTime();
          const validFrom = new Date(cert.valid_from).getTime();

          if (validTo < now) {
            indicators.push(
              buildSslIndicator(
                'ssl_expired',
                `Kedaluwarsa: ${cert.valid_to}`,
                'Sertifikat SSL/TLS situs web telah melewati masa berlaku (Expired).'
              )
            );
          } else if (validTo - now < 7 * 24 * 60 * 60 * 1000) {
            indicators.push(
              buildSslIndicator(
                'ssl_expiring_soon',
                `Berakhir: ${cert.valid_to}`,
                'Sertifikat SSL/TLS mendekati masa kedaluwarsa kurang dari 7 hari.'
              )
            );
          }

          const subjectCn = cert.subject?.CN || '';
          const issuerCn = cert.issuer?.CN || '';
          if (
            (subjectCn && subjectCn === issuerCn) ||
            (cert.subject && cert.issuer && JSON.stringify(cert.subject) === JSON.stringify(cert.issuer))
          ) {
            indicators.push(
              buildSslIndicator(
                'ssl_self_signed',
                `Issuer: ${issuerCn}`,
                'Sertifikat diterbitkan sendiri (Self-Signed) tanpa otoritas CA terpercaya.'
              )
            );
          }

          const certAgeDays = Math.floor((now - validFrom) / (24 * 60 * 60 * 1000));
          if (certAgeDays >= 0 && certAgeDays < 7) {
            indicators.push(
              buildSslIndicator(
                'ssl_very_new',
                `Diterbitkan ${certAgeDays} hari lalu (${cert.valid_from})`,
                'Sertifikat SSL/TLS baru saja diterbitkan kurang dari 7 hari yang lalu.'
              )
            );
          }

          resolve({
            indicators,
            status: 'completed',
            note: `Inspeksi SSL selesai. Penerbit: ${issuerCn || 'Valid CA'}, Masa aktif: ${cert.valid_to}`,
            details: {
              issuer: issuerCn,
              subject: subjectCn,
              valid_from: cert.valid_from,
              valid_to: cert.valid_to,
            },
          });
        }
      );

      socket.on('error', (err) => {
        if (isResolved) return;
        clearTimeout(timeoutTimer);
        isResolved = true;
        socket.destroy();

        const friendlyMsg = formatNetworkError(err);
        indicators.push(
          buildSslIndicator(
            'ssl_error',
            friendlyMsg,
            'Koneksi SSL/TLS ke server gagal atau ditolak.'
          )
        );

        resolve({
          indicators,
          status: 'partial',
          note: `Koneksi SSL port 443 gagal: ${friendlyMsg}`,
        });
      });
    } catch (err: any) {
      if (!isResolved) {
        clearTimeout(timeoutTimer);
        isResolved = true;
        const friendlyMsg = formatNetworkError(err);
        resolve({
          indicators: [],
          status: 'partial',
          note: `Inspeksi SSL tidak dapat diselesaikan: ${friendlyMsg}`,
        });
      }
    }
  });
}

