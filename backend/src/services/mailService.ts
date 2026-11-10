import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

export interface SendOtpMailOptions {
  to: string;
  otp: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  userName?: string;
}

let transporter: Transporter | null = null;

/**
 * Inisialisasi transporter Nodemailer yang reusable untuk Gmail SMTP
 */
function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const rawUser = env.GMAIL_USER?.trim();
  const rawPass = env.GMAIL_APP_PASSWORD?.trim();

  if (!rawUser || !rawPass) {
    return null;
  }

  // Sanitasi kredensial: hapus spasi dari App Password (misal 'abcd efgh ijkl mnop' -> 'abcdefghijklmnop')
  const pass = rawPass.replace(/\s+/g, '');
  // Pastikan user memuat domain email jika hanya diisi username
  const user = rawUser.includes('@') ? rawUser : `${rawUser}@gmail.com`;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_SECURE || false, // false untuk 587 STARTTLS
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: env.NODE_ENV === 'production',
    },
  });

  return transporter;
}

/**
 * Template HTML Email Responsif & Profesional Scamora
 */
function buildOtpEmailHtml(options: {
  otp: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  userName?: string;
}): { subject: string; html: string; text: string } {
  const isVerification = options.purpose === 'EMAIL_VERIFICATION';
  const name = options.userName || 'Warga';

  const title = isVerification
    ? 'Verifikasi Pendaftaran Akun'
    : 'Permintaan Reset Kata Sandi';

  const subtitle = isVerification
    ? 'Terima kasih telah mendaftar di Scamora. Gunakan kode OTP di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun.'
    : 'Kami menerima permintaan untuk mereset kata sandi akun Scamora Anda. Gunakan kode OTP di bawah ini untuk melanjutkan.';

  const warning = isVerification
    ? 'Kode ini bersifat sangat rahasia. Jangan pernah membagikan kode OTP ini kepada siapa pun, termasuk pihak yang mengaku sebagai admin atau staf Scamora.'
    : 'Jika Anda TIDAK meminta pemulihan kata sandi ini, abaikan email ini dengan aman. Akun Anda tetap terlindungi selama Anda tidak membagikan kode OTP ini kepada siapa pun.';

  const subject = isVerification
    ? `Kode Verifikasi Scamora: ${options.otp}`
    : `Kode Reset Sandi Scamora: ${options.otp}`;

  const text = `Halo ${name},\n\n${title}\n\nKode OTP Anda: ${options.otp}\n(Berlaku selama 5 menit)\n\n${warning}\n\nSalam aman,\nTim Keamanan Scamora`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #14161c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2ded7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #14161c; padding: 28px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: #0f9b8a; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                      Sistem Keamanan Terpadu
                    </span>
                    <h1 style="margin: 12px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                      SCAMORA
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 500;">
                      Platform Edukasi & Perlindungan Kejahatan Siber Nasional
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #14161c; font-size: 18px; font-weight: 700;">
                ${title}
              </h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                ${subtitle}
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f1fbf9; border: 2px dashed #0f9b8a; border-radius: 16px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #0f9b8a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                      Kode Verifikasi Sekali Pakai (OTP)
                    </span>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0f9b8a; padding: 4px 0;">
                      ${options.otp}
                    </div>
                    <span style="display: inline-block; margin-top: 10px; background-color: #e2f4f0; color: #0c8274; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">
                      ⏱️ Berlaku selama 5 menit
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Security Warning Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 12px 0; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; color: #9f1239; font-size: 12px; line-height: 1.5; font-weight: 500;">
                      🔒 <strong>Peringatan Keamanan:</strong> ${warning}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                Jika Anda memiliki pertanyaan atau kendala, silakan hubungi tim kami di <a href="mailto:admin@scamora.id" style="color: #0f9b8a; text-decoration: none; font-weight: 600;">admin@scamora.id</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; border-top: 1px solid #e2ded7; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.4;">
                Email otomatis dari Scamora Security Service. Harap tidak membalas email ini secara langsung.<br>
                © ${new Date().getFullYear()} Scamora. Seluruh hak cipta dilindungi undang-undang.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, html, text };
}

/**
 * Mengirim email OTP via Gmail SMTP
 */
export async function sendOtpEmail(options: SendOtpMailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const mailTransporter = getTransporter();
  const { subject, html, text } = buildOtpEmailHtml({
    otp: options.otp,
    purpose: options.purpose,
    userName: options.userName,
  });

  const rawSender = env.GMAIL_USER?.trim() || 'no-reply@scamora.id';
  const cleanSender = rawSender.includes('@') ? rawSender : `${rawSender}@gmail.com`;
  const fromAddress = env.SMTP_FROM?.trim() || `"Scamora Keamanan Akun" <${cleanSender}>`;

  // Fallback Dev / Test jika GMAIL_USER / GMAIL_APP_PASSWORD belum diatur atau saat unit testing
  if (!mailTransporter || env.NODE_ENV === 'test' || options.to.endsWith('.test')) {
    console.log('\n======================================================');
    console.log('📧 [SMTP SIMULATION / DEVELOPMENT LOG]');
    console.log(`Kepada  : ${options.to}`);
    console.log(`Tujuan  : ${options.purpose}`);
    console.log(`Subjek  : ${subject}`);
    console.log(`Kode OTP: >>> ${options.otp} <<< (Berlaku 5 Menit)`);
    console.log('Pemberitahuan: Setel GMAIL_USER & GMAIL_APP_PASSWORD di .env untuk pengiriman email nyata via Gmail SMTP.');
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject,
      text,
      html,
      priority: 'high',
      headers: {
        'Auto-Submitted': 'auto-generated',
        'X-Auto-Response-Suppress': 'All',
        'X-Entity-Ref-ID': `${options.otp}-${Date.now()}`,
      },
    });

    console.log(`[SMTP] Email OTP (${options.purpose}) berhasil dikirim ke ${options.to} via Gmail SMTP.`);
    console.log(`[SMTP] Info: ${info.response || 'OK'} | MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (error: any) {
    console.error(`[SMTP Error] Gagal mengirim email OTP ke ${options.to}:`, error.message);
    throw new Error(`Gagal mengirimkan email OTP melalui SMTP: ${error.message}`);
  }
}

/**
 * Memeriksa status kesiapan koneksi Gmail SMTP
 */
export async function verifySmtpConnection(): Promise<{ connected: boolean; error?: string }> {
  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    return {
      connected: false,
      error: 'Kredensial Gmail SMTP (GMAIL_USER / GMAIL_APP_PASSWORD) belum dikonfigurasi.',
    };
  }

  try {
    await mailTransporter.verify();
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}
