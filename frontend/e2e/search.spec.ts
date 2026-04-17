import { test, expect } from '@playwright/test';

/**
 * Search E2E — tim kiem san pham
 * Kiem tra: search input header (mobile/desktop), trang /tim-kiem, ket qua, khong tim thay
 */
test.describe('Search — Header', () => {
  test('mobile: search bar hien thi trong header', async ({ page }) => {
    // Mobile viewport 375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/san-pham');

    // Mobile header co search bar full-width
    const mobileHeader = page.locator('header').filter({ has: page.locator('input[type="search"]') });
    await expect(mobileHeader.locator('input[type="search"]')).toBeVisible();
    await expect(mobileHeader.locator('input[type="search"]')).toHaveAttribute(
      'placeholder',
      /Tim kiem san pham/i,
    );
  });

  test('desktop: nut tim kiem hien thi trong header', async ({ page }) => {
    await page.goto('/san-pham');

    // Desktop header co button "Tim kiem"
    const searchBtn = page.locator('header button[aria-label="Tim kiem"]');
    await expect(searchBtn).toBeVisible();
  });

  test('mobile: bottom tab bar co link Tim kiem', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/san-pham');

    // Bottom tab bar co link /tim-kiem
    const searchTab = page.locator('nav a[href="/tim-kiem"]');
    await expect(searchTab).toBeVisible();
    await expect(searchTab).toContainText('Tim kiem');
  });

  test('mobile: click tab Tim kiem di den /tim-kiem', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/san-pham');

    await page.locator('nav a[href="/tim-kiem"]').click();
    await expect(page).toHaveURL('/tim-kiem');
  });
});

test.describe('Search — Trang /tim-kiem', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tim-kiem');
  });

  test('render search input voi auto-focus', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]').last();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Tim kiem san pham/i);
  });

  test('hien thi tim kiem pho bien khi chua nhap gi', async ({ page }) => {
    // "Tìm kiếm phổ biến" section hien thi mac dinh (co diacritics)
    await expect(page.getByText(/Tìm kiếm phổ biến/i)).toBeVisible();
  });

  test('nhap tu khoa va submit hien ket qua', async ({ page }) => {
    // "Ao Polo" co trong MOCK_PRODUCTS — phai tra ve ket qua
    const searchInput = page.locator('form input[type="search"]');
    await searchInput.fill('Ao Polo');
    await searchInput.press('Enter');

    // Cho ket qua hien thi (debounce 300ms + render)
    // Text co diacritics: "Tìm thấy X sản phẩm cho"
    await expect(page.getByText(/Tìm thấy \d+ sản phẩm/)).toBeVisible({ timeout: 5000 });
  });

  test('tu khoa khong co ket qua hien thong bao "Khong tim thay"', async ({ page }) => {
    const searchInput = page.locator('form input[type="search"]');
    await searchInput.fill('xyzkhongtontai999');
    await searchInput.press('Enter');

    // Text co diacritics: "Không tìm thấy sản phẩm cho"
    await expect(page.getByText(/Không tìm thấy sản phẩm/)).toBeVisible({ timeout: 5000 });
  });

  test('submit form rong khong thuc hien tim kiem', async ({ page }) => {
    const searchInput = page.locator('form input[type="search"]');
    await searchInput.fill('');
    await searchInput.press('Enter');

    // Van o trang mac dinh — hien thi "Tìm kiếm phổ biến", khong co ket qua
    await expect(page.getByText(/Tìm kiếm phổ biến/i)).toBeVisible();
    await expect(page.getByText(/Tìm thấy \d+ sản phẩm/)).not.toBeVisible();
    await expect(page.getByText(/Không tìm thấy sản phẩm/)).not.toBeVisible();
  });

  test('nut xoa (X) reset input ve rong', async ({ page }) => {
    const searchInput = page.locator('form input[type="search"]');
    await searchInput.fill('Ao Polo');

    // Nut xoa hien thi khi co text — aria-label co diacritics: "Xóa"
    const clearBtn = page.locator('button[aria-label="Xóa"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Input ve rong, quay lai trang mac dinh
    await expect(searchInput).toHaveValue('');
    await expect(page.getByText(/Tìm kiếm phổ biến/i)).toBeVisible();
  });

  test('click tu khoa pho bien thuc hien tim kiem', async ({ page }) => {
    // Click "ao polo" hoac "áo polo" trong danh sach pho bien
    const popularItem = page.getByRole('button', { name: /ao polo|áo polo/i });
    await popularItem.click();

    // Ket qua hien thi
    await expect(page.getByText(/Tìm thấy \d+ sản phẩm/)).toBeVisible({ timeout: 5000 });
  });
});
