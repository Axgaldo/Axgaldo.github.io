import { expect, test } from '@playwright/test';
import { MANUAL_PROJECTS, SITE } from '../../assets/js/data.js';

/**
 * Escenario simulado de la API de GitHub: dos Pages nuevas (una con
 * dominio propio), un repo sin Pages y el propio lobby (que nunca
 * debe aparecer en la lista).
 */
const REPOS = [
  {
    name: 'Axgaldo.github.io',
    has_pages: true,
    description: 'el propio lobby',
    html_url: 'https://github.com/AxGaldo/Axgaldo.github.io',
    homepage: 'https://axgaldo.github.io/',
    pushed_at: '2026-11-19T00:00:00Z',
  },
  {
    name: 'Proyecto-Uno',
    has_pages: true,
    description: 'Pages uno de prueba',
    html_url: 'https://github.com/AxGaldo/Proyecto-Uno',
    homepage: null,
    pushed_at: '2026-11-18T00:00:00Z',
  },
  {
    name: 'proyecto-dos',
    has_pages: true,
    description: 'Pages dos de prueba',
    html_url: 'https://github.com/AxGaldo/proyecto-dos',
    homepage: 'https://dos.ejemplo.com/',
    pushed_at: '2026-11-17T00:00:00Z',
  },
  {
    name: 'sin-pages',
    has_pages: false,
    description: 'no debería aparecer',
    html_url: 'https://github.com/AxGaldo/sin-pages',
    homepage: null,
    pushed_at: '2026-11-01T00:00:00Z',
  },
];

const TOTAL = MANUAL_PROJECTS.length + 2;
const TYPING_TIMEOUT = 20_000;

test.beforeEach(async ({ page }) => {
  await page.route('**/api.github.com/users/AxGaldo/repos*', (route) =>
    route.fulfill({ json: REPOS }),
  );
});

test('arranca con los datos del usuario y el cursor visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#console')).toContainText(SITE.user.name);
  await expect(page.locator('#console')).toContainText(`@${SITE.user.github}`);
  await expect(page.locator('.cursor')).toBeVisible();
});

test('lista pages detectadas y manuales, sin el propio lobby', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCount(TOTAL, { timeout: TYPING_TIMEOUT });
  await expect(page.locator('#console')).not.toContainText('Axgaldo.github.io');
});

test('al cambiar de proyecto la consola se reescribe', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCount(TOTAL, { timeout: TYPING_TIMEOUT });
  await expect(page.locator('#console-project')).toContainText(MANUAL_PROJECTS[0].title, {
    timeout: TYPING_TIMEOUT,
  });

  await page.locator('.card').nth(2).click();
  await expect(page.locator('#console-project')).toContainText('Proyecto-Uno', {
    timeout: TYPING_TIMEOUT,
  });

  await page.locator('.card').nth(3).click();
  await expect(page.locator('#console-project')).toContainText('dos.ejemplo.com', {
    timeout: TYPING_TIMEOUT,
  });
});

test('flechas móviles cambian de proyecto', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible({ timeout: TYPING_TIMEOUT });

  await expect(page.locator('#console-project')).toContainText(MANUAL_PROJECTS[0].title, {
    timeout: TYPING_TIMEOUT,
  });
  await page.locator('#carousel-next').click();
  await expect(page.locator('#console-project')).toContainText(MANUAL_PROJECTS[1].title, {
    timeout: TYPING_TIMEOUT,
  });
  await page.locator('#carousel-prev').click();
  await expect(page.locator('#console-project')).toContainText(MANUAL_PROJECTS[0].title, {
    timeout: TYPING_TIMEOUT,
  });
});

test('el botón de fósforo alterna y persiste', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-phosphor', 'white');

  await page.locator('#phosphor-btn').click();
  await expect(page.locator('html')).toHaveAttribute('data-phosphor', 'green');
  await expect(page.locator('#phosphor-btn')).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-phosphor', 'green');
});

test('cae a la lista manual si la API no responde', async ({ page }) => {
  await page.route('**/api.github.com/**', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCount(MANUAL_PROJECTS.length, {
    timeout: TYPING_TIMEOUT,
  });
  await expect(page.locator('#console')).toContainText('modo manual', {
    timeout: TYPING_TIMEOUT,
  });
});
