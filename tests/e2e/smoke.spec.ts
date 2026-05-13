import { expect, test } from '@playwright/test';

test.describe('starter smoke', () => {
  test('base url loads and captures evidence', async ({ page }, testInfo) => {
    const baseUrl = process.env.BASE_URL ?? 'https://example.com';

    await page.goto(baseUrl);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);

    await page.screenshot({
      path: testInfo.outputPath('smoke-page.png'),
      fullPage: true,
    });
  });
});
