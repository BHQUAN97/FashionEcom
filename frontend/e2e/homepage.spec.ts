import { test, expect } from '@playwright/test';

/**
 * Storefront layout E2E — announcement bar, header, footer
 * Layout chi render tren storefront routes (VD: /san-pham), KHONG phai /
 */
test.describe('Storefront Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Dung /san-pham vi no nam trong (storefront) route group
    await page.goto('/san-pham');
  });

  test('render announcement bar', async ({ page }) => {
    await expect(page.getByText(/Mien phi giao hang/i)).toBeVisible();
  });

  test('render brand logo FASHION', async ({ page }) => {
    // Desktop header co class "hidden md:block"
    const desktopHeader = page.locator('header.hidden.md\\:block, header:not(.md\\:hidden)').last();
    await expect(desktopHeader.locator('a[href="/"]').first()).toBeVisible();
  });

  test('render desktop header nav links', async ({ page }) => {
    await expect(page.locator('header a[href="/san-pham"]')).toBeVisible();
    await expect(page.locator('header a[href="/danh-muc/sale"]')).toBeVisible();
  });

  test('render footer', async ({ page }) => {
    await expect(page.locator('footer').getByRole('heading', { name: 'FASHION ECOM' })).toBeVisible();
    await expect(page.locator('footer').getByText('COD | MoMo | VNPAY | ZaloPay')).toBeVisible();
  });
});
