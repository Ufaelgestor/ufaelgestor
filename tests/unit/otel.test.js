import { beforeEach, describe, expect, it } from 'vitest';
import { initOtel } from '../../src/otel.js';

describe('initOtel (unitário)', () => {
  beforeEach(() => {
    window.__OBSERVABILITY_CONFIG__ = undefined;
  });

  it('não faz nada (nem tenta importar) quando não há endpoint OTLP configurado', async () => {
    window.__OBSERVABILITY_CONFIG__ = { otelExporterUrl: '' };
    await expect(initOtel(window)).resolves.toBe(false);
  });

  it('não faz nada quando a config de observabilidade está ausente', async () => {
    await expect(initOtel(window)).resolves.toBe(false);
  });
});
