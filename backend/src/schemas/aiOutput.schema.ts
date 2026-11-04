import { z } from 'zod';

export const aiIndicatorSchema = z.object({
  type: z.enum([
    'otp_request',
    'advance_fee',
    'threat_link',
    'impersonation_data',
    'unrealistic_offer',
    'time_pressure',
    'move_platform',
    'guaranteed_profit',
    'odd_language',
    'unknown_sender',
  ]),
  evidence_quote: z.string().min(1),
  reason: z.string().min(1),
});

export const aiOutputSchema = z.object({
  scam_type: z.enum([
    'phishing',
    'job_scam',
    'giveaway_scam',
    'impersonation',
    'banking_fraud',
    'investment_scam',
    'apk_malware',
    'unknown',
  ]),
  can_conclude: z.boolean(),
  summary: z.string().default(''),
  indicators: z.array(aiIndicatorSchema),
});

export type AiOutput = z.infer<typeof aiOutputSchema>;
export type AiIndicator = z.infer<typeof aiIndicatorSchema>;

