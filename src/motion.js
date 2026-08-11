// Motion: loader inicial, progresso de leitura, entrada ao rolar e skeleton de imagem.
// Funções puras e funções de inicialização exportadas separadamente para permitir
// testes unitários (funções puras) e de integração (DOM via jsdom) sem precisar
// de um navegador real.

/**
 * Calcula o progresso de leitura da página (0 a 1), sempre limitado ao intervalo.
 */
export function computeScrollProgress(scrollTop, scrollHeight, clientHeight) {
  const total = scrollHeight - clientHeight;
  if (total <= 0) return 0;
  return Math.min(Math.max(scrollTop / total, 0), 1);
}

/**
 * Lê a preferência de movimento reduzido do usuário via matchMedia injetável (testável).
 */
export function prefersReducedMotion(matchMediaFn) {
  const mm =
    matchMediaFn ||
    (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia.bind(window) : null);
  if (!mm) return false;
  return mm('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Loader inicial: skeleton + barra de progresso indeterminada, some com fade/blur ao carregar.
 */
export function initPageLoader(doc, win) {
  const loader = doc.getElementById('page-loader');
  if (!loader) return;

  function hideLoader() {
    if (!loader.parentNode) return;
    loader.classList.add('page-loader--hidden');
    loader.addEventListener('transitionend', function onEnd() {
      loader.removeEventListener('transitionend', onEnd);
      if (loader.parentNode) loader.remove();
    });
    // Fallback caso transitionend não dispare (ex.: reduced motion, aba em segundo plano)
    win.setTimeout(() => {
      if (loader.parentNode) loader.remove();
    }, 700);
  }

  if (doc.readyState === 'complete') {
    hideLoader();
  } else {
    win.addEventListener('load', hideLoader);
  }
}

/**
 * Barra de progresso de leitura fixa no topo, sincronizada ao scroll (rAF-throttled).
 */
export function initScrollProgress(doc, win) {
  const progressBar = doc.getElementById('scroll-progress');
  if (!progressBar) return;

  function updateProgress() {
    const docEl = doc.documentElement;
    const scrollTop = win.scrollY || docEl.scrollTop;
    const progress = computeScrollProgress(scrollTop, docEl.scrollHeight, docEl.clientHeight);
    progressBar.style.transform = `scaleX(${progress})`;
  }

  let ticking = false;
  win.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        win.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
  updateProgress();
}

/**
 * Entrada do Hero (acima da dobra) assim que o loader some.
 */
export function initHeroReveal(doc, win, reducedMotion) {
  const heroEls = doc.querySelectorAll('.hero-reveal');

  function revealHero() {
    for (const el of heroEls) {
      el.classList.add('in-view');
    }
  }

  if (reducedMotion) {
    revealHero();
  } else if (doc.readyState === 'complete') {
    win.requestAnimationFrame(revealHero);
  } else {
    win.addEventListener('load', () => {
      win.requestAnimationFrame(revealHero);
    });
  }
}

/**
 * Entrada ao rolar (scroll reveal) para o restante da página via IntersectionObserver.
 */
export function initScrollReveal(doc, win, reducedMotion) {
  const revealEls = doc.querySelectorAll(
    '.reveal:not(.hero-reveal), .reveal-fade:not(.hero-reveal), .reveal-sm:not(.hero-reveal)',
  );

  if (reducedMotion || !('IntersectionObserver' in win)) {
    for (const el of revealEls) {
      el.classList.add('in-view');
    }
    return;
  }

  const observer = new win.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.style.willChange = 'transform, opacity, filter';
        el.classList.add('in-view');
        el.addEventListener('transitionend', function onEnd() {
          el.removeEventListener('transitionend', onEnd);
          el.style.willChange = '';
        });
        observer.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );
  for (const el of revealEls) {
    observer.observe(el);
  }
}

/**
 * Skeleton + lazy loading da(s) imagem(ns): remove o shimmer quando a imagem carrega (ou falha).
 */
export function initImageSkeletons(doc) {
  for (const img of doc.querySelectorAll('.img-skeleton img')) {
    const wrapper = img.closest('.img-skeleton');
    const markLoaded = () => {
      if (wrapper) wrapper.classList.add('img-skeleton--loaded');
    };
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markLoaded);
    }
  }
}

/**
 * Inicializa toda a camada de motion. Ponto de entrada único chamado por src/main.js.
 */
export function initMotion(doc, win) {
  const document_ = doc || (typeof document !== 'undefined' ? document : null);
  const window_ = win || (typeof window !== 'undefined' ? window : null);
  if (!document_ || !window_) return;

  const reducedMotion = prefersReducedMotion(
    window_.matchMedia ? window_.matchMedia.bind(window_) : null,
  );

  initPageLoader(document_, window_);
  initScrollProgress(document_, window_);
  initHeroReveal(document_, window_, reducedMotion);
  initScrollReveal(document_, window_, reducedMotion);
  initImageSkeletons(document_);
}
