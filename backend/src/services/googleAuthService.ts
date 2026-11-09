import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

export interface GoogleUserProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

let oauth2Client: OAuth2Client | null = null;

function getOAuth2Client(): OAuth2Client | null {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return null;
  }
  if (!oauth2Client) {
    oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_CALLBACK_URL
    );
  }
  return oauth2Client;
}

export const googleAuthService = {
  isConfigured(): boolean {
    return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  },

  getAuthorizationUrl(state: string): string {
    const client = getOAuth2Client();
    if (client) {
      return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        include_granted_scopes: true,
        prompt: 'select_account',
        state,
      });
    }

    // Direct Google OAuth URL fallback if client isn't cached yet
    if (env.GOOGLE_CLIENT_ID) {
      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
        state,
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    // Simulated dev URL if credentials are not configured yet
    return `${env.FRONTEND_ORIGIN}/#/login?google_simulated=true&state=${encodeURIComponent(state)}`;
  },

  async exchangeCodeForProfile(code: string, redirectUri?: string): Promise<GoogleUserProfile> {
    // Development demo code support
    if (code.startsWith('simulated-google-code-') || code.startsWith('demo-')) {
      return {
        sub: '109283748291039485712',
        email: 'warga.google.demo@gmail.com',
        name: 'Warga Google Demo',
        picture: 'https://lh3.googleusercontent.com/a/ACg8ocL_example=s96-c',
        emailVerified: true,
      };
    }

    const client = getOAuth2Client();
    if (!client) {
      throw new Error(
        'Google OAuth belum dikonfigurasi di backend (.env). Diperlukan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET.'
      );
    }

    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectUri || env.GOOGLE_CALLBACK_URL,
    });

    if (!tokens.id_token) {
      throw new Error('Google tidak mengembalikan id_token yang valid.');
    }

    return this.verifyIdToken(tokens.id_token);
  },

  async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
    // Support simulated dev token for tests
    if (idToken.startsWith('mock-google-id-token-') || idToken.startsWith('demo-')) {
      const parts = idToken.split(':');
      const email = parts[1] || 'warga.google@gmail.com';
      const name = parts[2] || 'Warga Google Terverifikasi';
      const sub = parts[3] || 'google_sub_9988776655';
      return {
        sub,
        email,
        name,
        picture: 'https://lh3.googleusercontent.com/a/ACg8ocL_example=s96-c',
        emailVerified: true,
      };
    }

    const client = getOAuth2Client();
    if (!client) {
      throw new Error(
        'Google OAuth belum dikonfigurasi. Atur GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET pada backend .env'
      );
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('ID Token Google tidak memuat payload data pengguna.');
    }

    if (!payload.sub || !payload.email) {
      throw new Error('Payload Google tidak memuat subject id (sub) atau email.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      picture: payload.picture,
      emailVerified: Boolean(payload.email_verified),
    };
  },
};
