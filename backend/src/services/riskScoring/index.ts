import {
  getSeverityFromWeight,
  INDICATOR_DEFAULT_SOURCES,
  INDICATOR_TITLES,
} from '../../config/scoring';
import type {
  CategoryReason,
  Indicator,
  PipelineCheck,
  RiskLevel,
  ScamType,
} from '../../types/analysis';
import { evaluateCategory } from './categoryRules';

export interface RiskScoringOutput {
  rawScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  categoryReason: CategoryReason;
  indicators: Indicator[];
  scamType: ScamType;
  explanation: string;
  recommendedActions: string[];
  limitations: string[];
}

export function determineScamType(indicators: Indicator[]): ScamType {
  for (const ind of indicators) {
    if (ind.type === 'malicious_apk_download') {
      return 'apk_malware';
    }
    if (ind.type === 'fake_giveaway_content') {
      return 'giveaway_scam';
    }
    if (
      ind.type === 'credential_harvesting_form' ||
      ind.type === 'safe_browsing_match' ||
      ind.type === 'typosquatting' ||
      ind.type === 'punycode_homograph' ||
      ind.type === 'brand_in_subdomain'
    ) {
      return 'phishing';
    }
    if (
      ind.type === 'otp_request' ||
      ind.type === 'financial_data_request'
    ) {
      return 'banking_fraud';
    }
    if (ind.type === 'advance_fee' || ind.type === 'unrealistic_offer') {
      return 'job_scam';
    }
    if (
      ind.type === 'brand_impersonation_content' ||
      ind.type === 'impersonation_data'
    ) {
      return 'impersonation';
    }
    if (ind.type === 'guaranteed_profit') {
      return 'investment_scam';
    }
  }
  return 'unknown';
}

export function deduplicateIndicators(rawIndicators: Indicator[]): Indicator[] {
  const seenTypes = new Set<string>();
  const uniqueList: Indicator[] = [];

  for (const ind of rawIndicators) {
    if (!seenTypes.has(ind.type)) {
      seenTypes.add(ind.type);
      const title = INDICATOR_TITLES[ind.type] || ind.title || ind.type;
      const source = ind.source || INDICATOR_DEFAULT_SOURCES[ind.type] || 'url_structure';
      const severity = getSeverityFromWeight(ind.weight);

      uniqueList.push({
        type: ind.type,
        title,
        severity,
        weight: ind.weight,
        source,
        evidence: ind.evidence,
        description: ind.description,
      });
    }
  }

  return uniqueList;
}

export function generateExplanation(
  riskLevel: RiskLevel,
  rawScore: number,
  categoryReason: CategoryReason
): string {
  let base = '';
  if (riskLevel === 'high') {
    if (categoryReason === 'critical_indicator') {
      if (rawScore < 70) {
        base = `Ditemukan indikator ancaman kritis pada masukan yang diperiksa. Akumulasi bobot awal (${rawScore}) disesuaikan dengan eskalasi proteksi kritis (+${70 - rawScore}) ke kategori Risiko Tinggi (70) demi mencegah penipuan.`;
      } else {
        base = 'Ditemukan indikator ancaman kritis pada masukan yang diperiksa. Kategori risiko ditetapkan tinggi demi perlindungan keamanan Anda.';
      }
    } else {
      base = 'Ditemukan indikasi risiko tinggi berdasarkan akumulasi tanda bahaya kuat pada data yang diperiksa.';
    }
  } else if (riskLevel === 'review') {
    if (categoryReason === 'partial_data') {
      base = 'Sebagian pemeriksaan eksternal mengalami kendala teknis sehingga status dialihkan ke peninjauan lebih lanjut.';
    } else if (categoryReason === 'inconclusive') {
      base = 'Sistem belum memiliki bukti yang cukup untuk menarik kesimpulan pasti terhadap keamanan pesan ini.';
    } else {
      base = 'Terdapat beberapa indikasi yang perlu diverifikasi lebih lanjut sebelum mengambil tindakan.';
    }
  } else {
    base = 'Tidak ditemukan indikator ancaman umum dalam pemeriksaan lengkap saat ini. Hasil ini merupakan indikasi dan bukan jaminan keamanan mutlak.';
  }

  if (rawScore > 100) {
    base += ` Skor total akumulasi indikator (${rawScore}) dibatasi pada batas maksimum 100.`;
  }

  return base;
}

export function generateRecommendedActions(
  riskLevel: RiskLevel,
  indicators: Indicator[]
): string[] {
  const actions: string[] = [];

  if (riskLevel === 'high') {
    actions.push('Jangan pernah mengeklik tautan, mentransfer dana, atau mengunduh berkas apa pun.');
    actions.push('Blokir nomor kontak dan laporkan akun melalui fitur pelaporan aplikasi.');

    let hasOtp = false;
    for (const ind of indicators) {
      if (ind.type === 'otp_request' || ind.type === 'financial_data_request') {
        hasOtp = true;
        break;
      }
    }
    if (hasOtp) {
      actions.push('Segera amankan akun rekening bank atau dompet digital Anda dan hubungi call center resmi bank.');
    }
  } else if (riskLevel === 'review') {
    actions.push('Lakukan verifikasi silang (cross-check) melalui kontak atau situs resmi institusi terkait.');
    actions.push('Hindari memberikan data identitas pribadi seperti KTP, nomor rekening, atau kode rahasia.');
  } else {
    actions.push('Tetap terapkan kebiasaan digital yang aman saat berinteraksi daring.');
    actions.push('Waspadai apabila di tengah percakapan pihak pengirim tiba-tiba meminta data rahasia.');
  }

  return actions;
}

export function generateLimitations(isPartial: boolean): string[] {
  const limitations = [
    'Hasil evaluasi merupakan indikasi risiko berdasarkan aturan dan data latih, bukan vonis mutlak atau jaminan hukum.',
    'Perayapan konten web dilakukan dalam sandbox statis terisolasi tanpa eksekusi skrip aktif klien demi keamanan pengujian.',
  ];

  if (isPartial) {
    limitations.push('Pemeriksaan eksternal mengalami kendala parsial; rekomendasi didasarkan pada aturan lokal dan tidak dapat menghasilkan vonis risiko rendah.');
  }

  return limitations;
}

export function calculateRiskScore(
  rawIndicators: Indicator[],
  checks: PipelineCheck[],
  canConclude: boolean = true,
  aiScamType?: ScamType | null
): RiskScoringOutput {
  const indicators = deduplicateIndicators(rawIndicators);

  let rawScore = 0;
  for (const ind of indicators) {
    rawScore += ind.weight;
  }
  const riskScore = Math.min(100, rawScore);

  let hasFailedMandatoryCheck = false;
  for (const check of checks) {
    if (check.status === 'failed') {
      hasFailedMandatoryCheck = true;
      break;
    }
  }

  const { riskLevel, categoryReason } = evaluateCategory(
    riskScore,
    indicators,
    hasFailedMandatoryCheck,
    canConclude
  );

  let scamType: ScamType = 'unknown';
  if (aiScamType && aiScamType !== 'unknown') {
    scamType = aiScamType;
  } else {
    scamType = determineScamType(indicators);
  }

  const explanation = generateExplanation(riskLevel, rawScore, categoryReason);
  const recommendedActions = generateRecommendedActions(riskLevel, indicators);
  const limitations = generateLimitations(hasFailedMandatoryCheck);

  return {
    rawScore,
    riskScore,
    riskLevel,
    categoryReason,
    indicators,
    scamType,
    explanation,
    recommendedActions,
    limitations,
  };
}
