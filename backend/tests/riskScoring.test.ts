import { describe, expect, it } from 'vitest';
import type { Indicator, PipelineCheck } from '../src/types/analysis';
import {
  calculateRiskScore,
  deduplicateIndicators,
  determineScamType,
} from '../src/services/riskScoring';
import { evaluateCategory } from '../src/services/riskScoring/categoryRules';

describe('riskScoring - Category Rules & Special Rules', () => {
  const okChecks: PipelineCheck[] = [
    { name: 'structure', status: 'completed', note: 'ok' },
    { name: 'reputation', status: 'completed', note: 'ok' },
  ];

  const failedChecks: PipelineCheck[] = [
    { name: 'structure', status: 'completed', note: 'ok' },
    { name: 'reputation', status: 'failed', note: 'timeout' },
  ];

  it('determines low category when score is below 30 and checks are complete', () => {
    const indicators: Indicator[] = [
      {
        type: 'risky_tld',
        title: 'TLD Berisiko',
        severity: 'low',
        weight: 10,
        source: 'url_structure',
        evidence: '.xyz',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, okChecks);
    expect(result.rawScore).toBe(10);
    expect(result.riskScore).toBe(10);
    expect(result.riskLevel).toBe('low');
    expect(result.categoryReason).toBe('score');
  });

  it('determines review category when score is between 30 and 59', () => {
    const indicators: Indicator[] = [
      {
        type: 'brand_in_subdomain',
        title: 'Merek di Subdomain',
        severity: 'high',
        weight: 30,
        source: 'url_structure',
        evidence: 'bca.evil.com',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, okChecks);
    expect(result.riskScore).toBe(30);
    expect(result.riskLevel).toBe('review');
    expect(result.categoryReason).toBe('score');
  });

  it('determines high category when score is 60 or above', () => {
    const indicators: Indicator[] = [
      {
        type: 'brand_in_subdomain',
        title: 'Merek di Subdomain',
        severity: 'high',
        weight: 30,
        source: 'url_structure',
        evidence: 'bca.evil.com',
        description: 'deskripsi',
      },
      {
        type: 'typosquatting',
        title: 'Typosquatting',
        severity: 'high',
        weight: 35,
        source: 'url_structure',
        evidence: 'bcaa.com',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, okChecks);
    expect(result.rawScore).toBe(65);
    expect(result.riskScore).toBe(65);
    expect(result.riskLevel).toBe('high');
    expect(result.categoryReason).toBe('score');
  });

  it('forces high category with critical_indicator when safe_browsing_match is present', () => {
    const indicators: Indicator[] = [
      {
        type: 'safe_browsing_match',
        title: 'Safe Browsing',
        severity: 'high',
        weight: 60,
        source: 'threat_db',
        evidence: 'evil.com',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, okChecks);
    expect(result.riskLevel).toBe('high');
    expect(result.categoryReason).toBe('critical_indicator');
  });

  it('forces high category with critical_indicator when otp_request is present even with low score', () => {
    const indicators: Indicator[] = [
      {
        type: 'otp_request',
        title: 'Minta OTP',
        severity: 'high',
        weight: 30,
        source: 'ai',
        evidence: 'kirim otp',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, okChecks);
    expect(result.riskScore).toBe(30);
    expect(result.riskLevel).toBe('high');
    expect(result.categoryReason).toBe('critical_indicator');
  });

  it('raises low category to review with partial_data when mandatory check fails', () => {
    const indicators: Indicator[] = [
      {
        type: 'no_https',
        title: 'Tanpa HTTPS',
        severity: 'low',
        weight: 10,
        source: 'url_structure',
        evidence: 'http://',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, failedChecks);
    expect(result.riskScore).toBe(10);
    expect(result.riskLevel).toBe('review');
    expect(result.categoryReason).toBe('partial_data');
    expect(result.limitations.length).toBeGreaterThan(2);
  });

  it('preserves high category when mandatory check fails but score is high', () => {
    const indicators: Indicator[] = [
      {
        type: 'brand_in_subdomain',
        title: 'Merek di Subdomain',
        severity: 'high',
        weight: 30,
        source: 'url_structure',
        evidence: 'bca.evil.com',
        description: 'deskripsi',
      },
      {
        type: 'typosquatting',
        title: 'Typosquatting',
        severity: 'high',
        weight: 35,
        source: 'url_structure',
        evidence: 'bcaa.com',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, failedChecks);
    expect(result.riskLevel).toBe('high');
    expect(result.categoryReason).toBe('score');
  });

  it('sets category to review with inconclusive when canConclude is false', () => {
    const indicators: Indicator[] = [];

    const result = calculateRiskScore(indicators, okChecks, false);
    expect(result.riskLevel).toBe('review');
    expect(result.categoryReason).toBe('inconclusive');
  });

  it('caps risk_score at 100 when raw_score exceeds 100 and mentions it in explanation', () => {
    const indicators: Indicator[] = [
      {
        type: 'safe_browsing_match',
        title: 'Threat',
        severity: 'high',
        weight: 60,
        source: 'threat_db',
        evidence: 'evil.com',
        description: 'deskripsi',
      },
      {
        type: 'typosquatting',
        title: 'Typosquatting',
        severity: 'high',
        weight: 35,
        source: 'url_structure',
        evidence: 'bca.com',
        description: 'deskripsi',
      },
      {
        type: 'punycode_homograph',
        title: 'Punycode',
        severity: 'high',
        weight: 30,
        source: 'url_structure',
        evidence: 'xn--',
        description: 'deskripsi',
      },
    ];

    const result = calculateRiskScore(indicators, okChecks);
    expect(result.rawScore).toBe(125);
    expect(result.riskScore).toBe(100);
    expect(result.explanation).toContain('125');
  });
});

describe('riskScoring - Deduplication & ScamType', () => {
  it('counts each indicator type once regardless of duplicates', () => {
    const duplicates: Indicator[] = [
      {
        type: 'no_https',
        title: 'Tanpa HTTPS',
        severity: 'low',
        weight: 10,
        source: 'url_structure',
        evidence: 'http://',
        description: 'deskripsi 1',
      },
      {
        type: 'no_https',
        title: 'Tanpa HTTPS',
        severity: 'low',
        weight: 10,
        source: 'url_structure',
        evidence: 'http://',
        description: 'deskripsi 2',
      },
    ];

    const unique = deduplicateIndicators(duplicates);
    expect(unique).toHaveLength(1);
    expect(unique[0]?.weight).toBe(10);
  });

  it('correctly maps scam types according to detected indicators', () => {
    const phishingIndicators: Indicator[] = [
      {
        type: 'brand_in_subdomain',
        title: 'Subdomain',
        severity: 'high',
        weight: 30,
        source: 'url_structure',
        evidence: 'bca',
        description: 'deskripsi',
      },
    ];
    expect(determineScamType(phishingIndicators)).toBe('phishing');

    const bankingIndicators: Indicator[] = [
      {
        type: 'otp_request',
        title: 'OTP',
        severity: 'high',
        weight: 30,
        source: 'ai',
        evidence: 'otp',
        description: 'deskripsi',
      },
    ];
    expect(determineScamType(bankingIndicators)).toBe('banking_fraud');

    const jobIndicators: Indicator[] = [
      {
        type: 'advance_fee',
        title: 'Biaya',
        severity: 'high',
        weight: 30,
        source: 'ai',
        evidence: 'biaya',
        description: 'deskripsi',
      },
    ];
    expect(determineScamType(jobIndicators)).toBe('job_scam');
  });
});

