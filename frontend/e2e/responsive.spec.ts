import { test, expect } from '@playwright/test';

/**
 * Responsive E2E — kiem tra layout tren cac viewport
 */
test.describe('Responsive — Mobile', () => {
  test('mobile header hien thi search bar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/san-pham');
    const searchMobile = page.locator('input[placeholder*="Tim kiem"]');
    await expect(searchMobile).toBeVisible();
  });

  test('bottom tab bar hien thi', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/san-pham');
    const lastNav = page.locator('nav').last();
    await expect(lastNav.getByText('Trang chu')).toBeVisible();
    await expect(lastNav.getByText('Tai khoan')).toBeVisible();
  });

  test('san-pham: nut Bo loc hien thi', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/san-pham');
    await expect(page.getByRole('button', { name: /Bo loc/i })).toBeVisible();
  });
});

test.describe('Responsive — Desktop', () => {
  test('desktop header hien thi nav links', async ({ page }) => {
    await page.goto('/san-pham');
    await expect(page.locator('header a[href="/san-pham"]')).toBeVisible();
    await expect(page.locator('header a[href="/danh-muc/ao-nam"]')).toBeVisible();
  });

  test('footer hien thi', async ({ page }) => {
    await page.goto('/san-pham');
    await expect(page.locator('footer').getByRole('heading', { name: 'FASHION ECOM' })).toBeVisible();
  });
});
