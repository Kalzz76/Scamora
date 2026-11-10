import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          action?: string;
          cData?: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'flexible' | 'compact';
          language?: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: string) => void;
          'expired-callback'?: () => void;
          'timeout-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
    __turnstileLoaded?: boolean;
    __turnstileCallbacks?: Array<() => void>;
    __turnstileScriptLoading?: boolean;
  }
}

export interface TurnstileWidgetHandle {
  reset: () => void;
  getResponse: () => string | null;
}

export interface TurnstileWidgetProps {
  siteKey?: string;
  action?: 'login' | 'register' | string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  onVerify: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  className?: string;
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Resolve Turnstile Site Key from environment variables (Vite, Next.js convention, or fallback)
const getTurnstileSiteKey = (): string => {
  const envKey =
    (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ||
    (import.meta.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string | undefined) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_TURNSTILE_SITE_KEY) ||
    '1x00000000000000000000AA'; // Official Cloudflare Always-Pass Test Sitekey
  return envKey;
};

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  (
    {
      siteKey: propSiteKey,
      action = 'auth',
      theme = 'light',
      size = 'normal',
      onVerify,
      onError,
      onExpire,
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const resolvedSiteKey = propSiteKey || getTurnstileSiteKey();

    // Use refs for callbacks to prevent re-rendering/re-mounting when parent state changes
    const onVerifyRef = useRef(onVerify);
    onVerifyRef.current = onVerify;

    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'expired' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Expose reset and getResponse methods via ref
    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.reset(widgetIdRef.current);
            } catch {
              // Ignore reset errors
            }
          }
          setStatus('ready');
          setErrorMessage(null);
        },
        getResponse: () => {
          if (widgetIdRef.current && window.turnstile) {
            try {
              return window.turnstile.getResponse(widgetIdRef.current) || null;
            } catch {
              return null;
            }
          }
          return null;
        },
      }),
      []
    );

    // Initialize or re-render widget (stable dependencies only!)
    const renderWidget = useCallback(() => {
      if (!window.turnstile || !containerRef.current) return;

      // Clean up previous widget instance if present
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore removal errors
        }
        widgetIdRef.current = null;
      }

      containerRef.current.innerHTML = '';
      setStatus('loading');
      setErrorMessage(null);

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: resolvedSiteKey,
          action,
          theme,
          size,
          language: 'id',
          retry: 'auto',
          'retry-interval': 1500,
          callback: (token: string) => {
            setStatus('verified');
            setErrorMessage(null);
            onVerifyRef.current(token);
          },
          'error-callback': (errorCode?: string) => {
            setStatus('error');
            const msg =
              errorCode === '110200'
                ? 'Domain ini (localhost) belum didaftarkan di Cloudflare Turnstile dashboard.'
                : `Verifikasi keamanan gagal dimuat (Error: ${errorCode || 'unknown'}).`;
            setErrorMessage(msg);
            onErrorRef.current?.(msg);
          },
          'expired-callback': () => {
            setStatus('expired');
            setErrorMessage('Sesi verifikasi keamanan telah kedaluwarsa. Silakan verifikasi ulang.');
            onExpireRef.current?.();
          },
          'timeout-callback': () => {
            setStatus('expired');
            setErrorMessage('Waktu tunggu verifikasi habis. Silakan klik untuk memuat ulang.');
            onExpireRef.current?.();
          },
        });

        widgetIdRef.current = id;
        setStatus('ready');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage('Gagal menginisialisasi widget keamanan Cloudflare.');
        onErrorRef.current?.(err?.message);
      }
    }, [action, resolvedSiteKey, size, theme]);

    // Ensure Cloudflare Turnstile explicit script is loaded
    useEffect(() => {
      let isMounted = true;

      const ensureScript = () => {
        if (window.turnstile) {
          if (isMounted) renderWidget();
          return;
        }

        if (!window.__turnstileCallbacks) {
          window.__turnstileCallbacks = [];
        }

        window.__turnstileCallbacks.push(() => {
          if (isMounted) renderWidget();
        });

        if (window.__turnstileScriptLoading) {
          return;
        }

        const existingScript = document.querySelector(`script[src^="${SCRIPT_URL}"]`);
        if (existingScript) {
          window.__turnstileScriptLoading = true;
          return;
        }

        window.__turnstileScriptLoading = true;
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          window.__turnstileLoaded = true;
          window.__turnstileScriptLoading = false;
          if (window.__turnstileCallbacks) {
            const cbs = [...window.__turnstileCallbacks];
            window.__turnstileCallbacks = [];
            cbs.forEach((cb) => cb());
          }
        };

        script.onerror = () => {
          window.__turnstileScriptLoading = false;
          if (isMounted) {
            setStatus('error');
            setErrorMessage(
              'Gagal memuat sistem perlindungan Cloudflare. Periksa koneksi internet atau nonaktifkan ad-blocker.'
            );
            onErrorRef.current?.('Script load error');
          }
        };

        document.head.appendChild(script);
      };

      ensureScript();

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Ignore removal errors
          }
          widgetIdRef.current = null;
        }
      };
    }, [renderWidget]);

    const handleRetry = () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          setStatus('ready');
          setErrorMessage(null);
          return;
        } catch {
          // Fall through to re-render
        }
      }
      renderWidget();
    };

    return (
      <div className={`turnstile-container w-full my-2 flex flex-col items-center justify-center ${className}`}>
        {/* Cloudflare Turnstile Mount Container */}
        <div className="w-full flex flex-col items-center justify-center min-h-[65px] transition-all relative py-0.5">
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 py-3 text-xs text-[#64748b] z-10">
              <Loader2 className="w-4 h-4 animate-spin text-[#0f9b8a]" />
              <span>Menyiapkan verifikasi keamanan...</span>
            </div>
          )}

          {/* Turnstile renders its iframe inside this div (must remain mounted and visible) */}
          <div
            ref={containerRef}
            className="w-full flex justify-center items-center min-h-[65px]"
          />

          {/* Expired State Notice */}
          {status === 'expired' && (
            <div className="w-full p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-800 animate-in fade-in">
              <span className="text-[11px] leading-tight font-medium">
                {errorMessage || 'Sesi verifikasi telah kedaluwarsa.'}
              </span>
              <button
                type="button"
                onClick={handleRetry}
                className="shrink-0 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Verifikasi Ulang
              </button>
            </div>
          )}

          {/* Error State Notice */}
          {status === 'error' && (
            <div className="w-full p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 text-xs text-rose-800 animate-in fade-in">
              <div className="flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5" />
                <span className="text-[11px] leading-tight font-medium">
                  {errorMessage || 'Gagal memuat proteksi keamanan.'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="shrink-0 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

