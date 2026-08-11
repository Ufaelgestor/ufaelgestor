import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initHeroReveal,
  initImageSkeletons,
  initPageLoader,
  initScrollProgress,
  initScrollReveal,
} from '../../src/motion.js';

class FakeIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    FakeIntersectionObserver.instances.push(this);
  }
  observe(el) {
    this.observed.push(el);
  }
  unobserve(el) {
    this.observed = this.observed.filter((e) => e !== el);
  }
  disconnect() {
    this.observed = [];
  }
  trigger(entries) {
    this.callback(entries, this);
  }
}
FakeIntersectionObserver.instances = [];

beforeEach(() => {
  document.body.innerHTML = '';
  FakeIntersectionObserver.instances = [];
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('initScrollProgress (integração DOM)', () => {
  it('atualiza a transform da barra de progresso ao rolar', () => {
    document.body.innerHTML = '<div id="scroll-progress"></div>';
    const progressBar = document.getElementById('scroll-progress');

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(window, 'scrollY', { value: 600, configurable: true });

    // requestAnimationFrame síncrono para o teste não depender de um frame real
    window.requestAnimationFrame = (cb) => cb();

    initScrollProgress(document, window);
    // initScrollProgress já chama updateProgress() uma vez na inicialização
    expect(progressBar.style.transform).toBe('scaleX(0.5)');

    Object.defineProperty(window, 'scrollY', { value: 1200, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(progressBar.style.transform).toBe('scaleX(1)');
  });

  it('não lança erro quando a barra de progresso não existe no DOM', () => {
    expect(() => initScrollProgress(document, window)).not.toThrow();
  });
});

describe('initPageLoader (integração DOM)', () => {
  it('some do DOM quando a página termina de carregar (transitionend)', () => {
    document.body.innerHTML = '<div id="page-loader"></div>';
    const loader = document.getElementById('page-loader');
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });

    initPageLoader(document, window);

    expect(loader.classList.contains('page-loader--hidden')).toBe(true);
    loader.dispatchEvent(new Event('transitionend'));
    expect(document.getElementById('page-loader')).toBeNull();
  });

  it('remove o loader mesmo sem transitionend, via fallback de timeout', () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="page-loader"></div>';
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });

    initPageLoader(document, window);
    expect(document.getElementById('page-loader')).not.toBeNull();

    vi.advanceTimersByTime(700);
    expect(document.getElementById('page-loader')).toBeNull();
  });
});

describe('initHeroReveal (integração DOM)', () => {
  it('revela o hero imediatamente quando reducedMotion é true', () => {
    document.body.innerHTML = '<h1 class="hero-reveal"></h1>';
    initHeroReveal(document, window, true);
    expect(document.querySelector('.hero-reveal').classList.contains('in-view')).toBe(true);
  });
});

describe('initScrollReveal (integração DOM, IntersectionObserver simulado)', () => {
  it('marca in-view e limpa will-change quando o elemento intersecta', () => {
    document.body.innerHTML = '<div class="reveal" id="card"></div>';
    const card = document.getElementById('card');
    window.IntersectionObserver = FakeIntersectionObserver;

    initScrollReveal(document, window, false);
    const observerInstance = FakeIntersectionObserver.instances[0];
    expect(observerInstance.observed).toContain(card);

    observerInstance.trigger([{ isIntersecting: true, target: card }]);

    expect(card.classList.contains('in-view')).toBe(true);
    expect(card.style.willChange).toBe('transform, opacity, filter');
    expect(observerInstance.observed).not.toContain(card);

    card.dispatchEvent(new Event('transitionend'));
    expect(card.style.willChange).toBe('');
  });

  it('ignora entradas que ainda não intersectam', () => {
    document.body.innerHTML = '<div class="reveal" id="card"></div>';
    const card = document.getElementById('card');
    window.IntersectionObserver = FakeIntersectionObserver;

    initScrollReveal(document, window, false);
    const observerInstance = FakeIntersectionObserver.instances[0];
    observerInstance.trigger([{ isIntersecting: false, target: card }]);

    expect(card.classList.contains('in-view')).toBe(false);
  });

  it('revela tudo de uma vez quando reducedMotion é true (sem observer)', () => {
    document.body.innerHTML = '<div class="reveal" id="card"></div>';
    initScrollReveal(document, window, true);
    expect(document.getElementById('card').classList.contains('in-view')).toBe(true);
  });
});

describe('initImageSkeletons (integração DOM)', () => {
  it('marca o skeleton como carregado quando a imagem já está completa', () => {
    document.body.innerHTML = '<div class="img-skeleton"><img id="photo" /></div>';
    const img = document.getElementById('photo');
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: 400, configurable: true });

    initImageSkeletons(document);
    expect(document.querySelector('.img-skeleton').classList.contains('img-skeleton--loaded')).toBe(
      true,
    );
  });

  it('marca o skeleton como carregado quando o evento load dispara', () => {
    document.body.innerHTML = '<div class="img-skeleton"><img id="photo" /></div>';
    const img = document.getElementById('photo');
    Object.defineProperty(img, 'complete', { value: false, configurable: true });

    initImageSkeletons(document);
    expect(document.querySelector('.img-skeleton').classList.contains('img-skeleton--loaded')).toBe(
      false,
    );

    img.dispatchEvent(new Event('load'));
    expect(document.querySelector('.img-skeleton').classList.contains('img-skeleton--loaded')).toBe(
      true,
    );
  });

  it('também marca como carregado quando a imagem falha (evento error)', () => {
    document.body.innerHTML = '<div class="img-skeleton"><img id="photo" /></div>';
    const img = document.getElementById('photo');
    Object.defineProperty(img, 'complete', { value: false, configurable: true });

    initImageSkeletons(document);
    img.dispatchEvent(new Event('error'));
    expect(document.querySelector('.img-skeleton').classList.contains('img-skeleton--loaded')).toBe(
      true,
    );
  });
});
