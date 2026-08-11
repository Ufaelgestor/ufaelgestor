// Ponto de entrada único carregado pelo index.html. Mantém motion.js, observability.js
// e otel.js como módulos puros/testáveis, sem efeitos colaterais na importação —
// só este arquivo (o bootstrap real da página) os executa.
import { initMotion } from './motion.js';
import { initSentry } from './observability.js';
import { initOtel } from './otel.js';

initMotion(document, window);
initSentry(window);
initOtel(window);
