import { test, expect } from '@playwright/test';

/**
 * Exemplo mínimo de teste E2E.
 *
 * Substitua pelo fluxo real do projeto. Mantenha ao menos 1 spec verde
 * no starter para que `npx playwright test` não retorne "no tests found"
 * no primeiro run do DoD gate.
 */
test.describe('starter smoke', () => {
  test('home carrega e tem título', async ({ page }) => {
    const baseUrl = process.env.BASE_URL ?? 'https://example.com';
    await page.goto(baseUrl);
    await expect(page).toHaveTitle(/.+/);
  });
});
