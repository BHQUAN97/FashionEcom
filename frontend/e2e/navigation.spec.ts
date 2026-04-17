import { test, expect } from '@playwright/test';

/**
 * Navigation E2E — kiem tra cac route chinh hoat dong
 */
test.describe('Navigation', () => {
  test('click SAN PHAM MOI di den /san-pham', async ({ page }) => {
    await page.goto('/san-pham');
    await page.locator('header a[href="/san-pham"]').click();
    await expect(page).toHaveURL('/san-pham');
  });

  test('click AO NAM di den /danh-muc/ao-nam', async ({ page }) => {
    await page.goto('/san-pham');
    await page.locator('header a[href="/danh-muc/ao-nam"]').click();
    await expect(page).toHaveURL('/danh-muc/ao-nam');
  });

  test('click product card di den product detail', async ({ page }) => {
    await page.goto('/san-pham');
    const firstProduct = page.locator('a[href^="/san-pham/"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/san-pham\/.+/);
  });

  test('click brand logo di den trang chu', async ({ page }) => {
    await page.goto('/san-pham');
    // Desktop: logo nam trong header voi class "text-2xl"
    await page.locator('header a[href="/"].text-2xl').click();
    await expect(page).toHaveURL('/');
  });

  test('footer links hien thi', async ({ page }) => {
    await page.goto('/san-pham');
    await expect(page.locator('footer a[href="/chinh-sach/van-chuyen"]')).toBeVisible();
    await expect(page.locator('footer a[href="/chinh-sach/doi-tra"]')).toBeVisible();
  });
});
