import { test, expect } from '@playwright/test';

/**
 * Collection page E2E — /san-pham
 */
test.describe('Collection Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/san-pham');
  });

  test('hien thi heading san pham', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sản phẩm/i })).toBeVisible();
  });

  test('hien thi danh sach san pham', async ({ page }) => {
    const productCards = page.locator('a[href^="/san-pham/"]');
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('click product di den detail page', async ({ page }) => {
    const firstProduct = page.locator('.product-loop a[href^="/san-pham/"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/san-pham\/.+/);
  });

  test('sort select hien thi', async ({ page }) => {
    const sortEl = page.locator('select, [role="combobox"], [role="listbox"]').first();
    await expect(sortEl).toBeVisible();
  });

  test('filter sidebar hien thi tren desktop', async ({ page }) => {
    // FilterSidebar co heading "Bộ lọc"
    await expect(page.locator('aside').getByText('Bộ lọc')).toBeVisible();
  });
});
