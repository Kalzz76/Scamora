import rateLimit from 'express-rate-limit';

export const analyzeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Batas frekuensi permintaan terlampaui. Silakan coba lagi dalam beberapa saat.',
      },
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak percobaan autentikasi. Demi keamanan, silakan tunggu beberapa saat sebelum mencoba kembali.',
      },
    });
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak permintaan kode OTP. Demi keamanan, silakan tunggu 15 menit sebelum mencoba kembali.',
      },
    });
  },
});

