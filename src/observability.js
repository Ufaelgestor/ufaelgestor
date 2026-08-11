// Error tracking (Sentry). Sentry, Datadog e New Relic resolvem o mesmo problema
// (error tracking / RUM de navegador) — escolhemos Sentry para não rodar três
// agentes redundantes na mesma página. O SDK é carregado via <script> (CDN) no
// index.html; este módulo só chama Sentry.init() se houver DSN configurado.
//
// Configuração (sem servidor, então fica em window.__OBSERVABILITY_CONFIG__,
// definido inline no index.html — ver README para instruções):
//   window.__OBSERVABILITY_CONFIG__ = { sentryDsn: 'https://...ingest.sentry.io/...' }

/**
 * Inicializa o Sentry se houver DSN configurado e o SDK (CDN) estiver carregado.
 * Retorna true se inicializado, false caso contrário (no-op seguro).
 */
export function initSentry(win) {
  const w = win || (typeof window !== 'undefined' ? window : null);
  if (!w) return false;

  const config = w.__OBSERVABILITY_CONFIG__ || {};
  const dsn = config.sentryDsn;
  if (!dsn || !w.Sentry || typeof w.Sentry.init !== 'function') {
    return false;
  }

  try {
    w.Sentry.init({
      dsn: dsn,
      environment: config.environment || 'production',
      tracesSampleRate: 0,
    });
    return true;
  } catch (err) {
    if (w.console) w.console.warn('[observability] falha ao iniciar o Sentry:', err);
    return false;
  }
}
