import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initSentry } from '../../src/observability.js';

describe('initSentry (unitário)', () => {
  beforeEach(() => {
    window.__OBSERVABILITY_CONFIG__ = undefined;
    window.Sentry = undefined;
  });

  it('não inicializa quando não há DSN configurado', () => {
    window.__OBSERVABILITY_CONFIG__ = { sentryDsn: '' };
    window.Sentry = { init: vi.fn() };
    expect(initSentry(window)).toBe(false);
    expect(window.Sentry.init).not.toHaveBeenCalled();
  });

  it('não inicializa quando o SDK do Sentry (CDN) não carregou', () => {
    window.__OBSERVABILITY_CONFIG__ = { sentryDsn: 'https://example@o0.ingest.sentry.io/0' };
    expect(initSentry(window)).toBe(false);
  });

  it('inicializa o Sentry quando DSN e SDK estão disponíveis', () => {
    const init = vi.fn();
    window.__OBSERVABILITY_CONFIG__ = {
      sentryDsn: 'https://example@o0.ingest.sentry.io/0',
      environment: 'staging',
    };
    window.Sentry = { init };

    expect(initSentry(window)).toBe(true);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://example@o0.ingest.sentry.io/0',
        environment: 'staging',
      }),
    );
  });

  it('nunca lança erro, mesmo se Sentry.init falhar', () => {
    window.__OBSERVABILITY_CONFIG__ = { sentryDsn: 'https://example@o0.ingest.sentry.io/0' };
    window.Sentry = {
      init: () => {
        throw new Error('boom');
      },
    };
    expect(() => initSentry(window)).not.toThrow();
    expect(initSentry(window)).toBe(false);
  });
});
