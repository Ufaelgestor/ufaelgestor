import { expect, test } from '@playwright/test';

// 1x1 PNG usado como stand-in para a foto (hospedada externamente no Imgur) e para o
// bundle do Sentry/Tailwind/fontes: mockamos os poucos recursos de terceiros para manter
// o e2e determinístico e independente da disponibilidade desses serviços externos.
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

async function mockExternalAssets(page) {
  await page.route('https://cdn.tailwindcss.com', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.tailwind = { config: function(){} };',
    }),
  );
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  );
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('https://imgur.com/vLFXO5Z.jpg', (route) =>
    route.fulfill({ contentType: 'image/png', body: PNG_1PX }),
  );
  await page.route('https://browser.sentry-cdn.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
}

test.describe('Site institucional Ufaelgestor', () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalAssets(page);
  });

  test('carrega sem erros de console e mostra o hero', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/index.html');
    await expect(page.locator('h1.hero-reveal')).toBeVisible();
    await expect(page.locator('h1.hero-reveal')).toHaveCSS('opacity', '1');
    expect(consoleErrors).toEqual([]);
  });

  test('loader inicial some depois do carregamento', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#page-loader')).toHaveCount(0, { timeout: 5000 });
  });

  test('barra de progresso acompanha a rolagem da página', async ({ page }) => {
    await page.goto('/index.html');
    const progressBar = page.locator('#scroll-progress');

    await expect(progressBar).toHaveCSS('transform', 'matrix(0, 0, 0, 1, 0, 0)');

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(progressBar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 5000 });
  });

  test('seções entram (.in-view) ao rolar a página', async ({ page }) => {
    await page.goto('/index.html');
    const servicesHeading = page.locator('h2:has-text("Serviços: Organização")');

    await expect(servicesHeading).not.toHaveClass(/in-view/);
    await servicesHeading.scrollIntoViewIfNeeded();
    await expect(servicesHeading).toHaveClass(/in-view/, { timeout: 5000 });
  });

  test('skeleton da foto de perfil resolve para a imagem carregada', async ({ page }) => {
    await page.goto('/index.html');
    const skeleton = page.locator('.img-skeleton');
    await skeleton.scrollIntoViewIfNeeded();
    await expect(skeleton).toHaveClass(/img-skeleton--loaded/, { timeout: 5000 });
  });

  test('CTAs do WhatsApp apontam para o número correto', async ({ page }) => {
    await page.goto('/index.html');
    const ctas = page.locator('a.cta-button, a.cta-button-secondary');
    const count = await ctas.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(ctas.nth(i)).toHaveAttribute('href', /^https:\/\/wa\.me\/5562992234028/);
    }
  });
});

test.describe('Site institucional Ufaelgestor — prefers-reduced-motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('conteúdo aparece imediatamente, sem animação, e sem erros', async ({ page }) => {
    await mockExternalAssets(page);
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/index.html');
    await expect(page.locator('#page-loader')).toHaveCount(0, { timeout: 5000 });
    await expect(page.locator('h1.hero-reveal')).toHaveCSS('opacity', '1');

    const servicesHeading = page.locator('h2:has-text("Serviços: Organização")');
    await expect(servicesHeading).toHaveClass(/in-view/);

    expect(consoleErrors).toEqual([]);
  });
});
