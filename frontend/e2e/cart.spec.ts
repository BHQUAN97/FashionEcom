import { test, expect } from '@playwright/test';

/**
 * Cart E2E — gio hang trong va co san pham
 */
test.describe('Cart — Empty', () => {
  test('gio hang trong hien thi empty state', async ({ page }) => {
    await page.goto('/san-pham');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/gio-hang');
    await expect(page.getByText('Giỏ hàng trống')).toBeVisible();
  });

  test('co link TIEP TUC MUA SAM', async ({ page }) => {
    await page.goto('/san-pham');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/gio-hang');
    const link = page.getByRole('link', { name: /TIẾP TỤC MUA SẮM/i });
    await expect(link).toBeVisible();
  });
});

test.describe('Cart — Co san pham', () => {
  test.beforeEach(async ({ page }) => {
    // Seed cart data
    await page.goto('/san-pham');
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              variantId: 'v1',
              productId: 'prod-1',
              name: 'Ao Polo Nam Cao Cap',
              slug: 'san-pham-1',
              color: 'Den',
              size: 'L',
              price: 590000,
              qty: 2,
              image: '',
              sku: 'POLO-DEN-L',
              max_qty: 10,
            },
          ],
        },
        version: 0,
      };
      localStorage.setItem('fashionecom-cart', JSON.stringify(cartState));
    });
  });

  test('hien thi heading gio hang', async ({ page }) => {
    await page.goto('/gio-hang');
    await expect(page.getByRole('heading', { name: /Giỏ hàng/i })).toBeVisible();
  });

  test('co link thanh toan', async ({ page }) => {
    await page.goto('/gio-hang');
    const checkoutLink = page.getByRole('link', { name: /TIẾN HÀNH THANH TOÁN/i }).first();
    await expect(checkoutLink).toBeVisible();
  });
});
