// OpenTelemetry Web: tracing de performance, complementar ao error tracking do Sentry
// (propósitos diferentes — não é redundante). Não há bundler neste site estático,
// então os pacotes do OTel são importados dinamicamente de um build ESM via CDN,
// e só quando um endpoint OTLP estiver configurado — sem endpoint, nenhum código
// do OTel é sequer baixado. Qualquer falha (rede, incompatibilidade de versão do
// CDN) é contida em try/catch e nunca quebra a página.
//
// Configuração:
//   window.__OBSERVABILITY_CONFIG__ = { otelExporterUrl: 'https://collector.exemplo.com/v1/traces' }

const OTEL_CDN = 'https://esm.sh';

/**
 * Inicializa um WebTracerProvider do OpenTelemetry se houver endpoint OTLP configurado.
 * Retorna uma Promise<boolean> (true se inicializado).
 */
export async function initOtel(win) {
  const w = win || (typeof window !== 'undefined' ? window : null);
  if (!w) return false;

  const config = w.__OBSERVABILITY_CONFIG__ || {};
  const endpoint = config.otelExporterUrl;
  if (!endpoint) return false;

  try {
    const [
      { WebTracerProvider },
      { OTLPTraceExporter },
      { BatchSpanProcessor },
      { registerInstrumentations },
      { DocumentLoadInstrumentation },
    ] = await Promise.all([
      import(/* @vite-ignore */ `${OTEL_CDN}/@opentelemetry/sdk-trace-web@1.26.0`),
      import(/* @vite-ignore */ `${OTEL_CDN}/@opentelemetry/exporter-trace-otlp-http@0.53.0`),
      import(/* @vite-ignore */ `${OTEL_CDN}/@opentelemetry/sdk-trace-base@1.26.0`),
      import(/* @vite-ignore */ `${OTEL_CDN}/@opentelemetry/instrumentation@0.53.0`),
      import(/* @vite-ignore */ `${OTEL_CDN}/@opentelemetry/instrumentation-document-load@0.40.0`),
    ]);

    const provider = new WebTracerProvider();
    provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter({ url: endpoint })));
    provider.register();
    registerInstrumentations({ instrumentations: [new DocumentLoadInstrumentation()] });
    return true;
  } catch (err) {
    if (w.console) w.console.warn('[observability] falha ao iniciar o OpenTelemetry Web:', err);
    return false;
  }
}
