declare module 'google-auth-library' {
  export class OAuth2Client {
    constructor(...args: any[]);
    generateAuthUrl(...args: any[]): any;
    getToken(...args: any[]): Promise<any>;
    verifyIdToken(...args: any[]): Promise<any>;
    setCredentials(...args: any[]): void;
  }
}
