import { test, expect, Page } from '@playwright/test';

/**
 * Checkout E2E — luong thanh toan /thanh-toan
 * 3 steps: review -> shipping -> payment
 */

/** Seed 2 san pham vao cart qua localStorage */
async function seedCart(page: Page) {
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
            color_hex: '#000000',
            size: 'L',
            price: 590000,
            compare_at_price: 790000,
            image: '',
            qty: 2,
            sku: 'POLO-DEN-L',
            max_qty: 10,
          },
          {
            variantId: 'v2',
            productId: 'prod-2',
            name: 'Quan Tay Slim Fit',
            slug: 'san-pham-2',
            color: 'Xam',
            color_hex: '#808080',
            size: 'M',
            price: 450000,
            compare_at_price: 600000,
            image: '',
            qty: 1,
            sku: 'QTAY-XAM-M',
            max_qty: 5,
          },
        ],
      },
      version: 0,
    };
    localStorage.setItem('fashionecom-cart', JSON.stringify(cartState));
  });
}

/* ------------------------------------------------------------------ */
/*  Gio hang trong — /thanh-toan hien thong bao                       */
/* ------------------------------------------------------------------ */
test.describe('Checkout — Gio hang trong', () => {
  test('hien thong bao khi gio hang trong', async ({ page }) => {
    await page.goto('/san-pham');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/thanh-toan');
    await expect(page.getByText(/Giỏ hàng trống/i)).toBeVisible();
  });

  test('khong hien form shipping khi gio hang trong', async ({ page }) => {
    await page.goto('/san-pham');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/thanh-toan');
    await expect(page.getByText(/Thông tin giao hàng/i)).not.toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/*  Co san pham — checkout review step                                 */
/* ------------------------------------------------------------------ */
test.describe('Checkout — Review step', () => {
  test.beforeEach(async ({ page }) => {
    await seedCart(page);
  });

  test('hien heading "Thanh toan"', async ({ page }) => {
    await page.goto('/thanh-toan');
    await expect(page.getByRole('heading', { level: 1, name: /Thanh toán/i })).toBeVisible();
  });

  test('hien order summary voi san pham tu cart', async ({ page }) => {
    await page.goto('/thanh-toan');
    // Accordion trigger "Đơn hàng (2 sản phẩm)"
    const accordion = page.locator('button', { hasText: /sản phẩm/ });
    await expect(accordion).toBeVisible();
    await accordion.click();
    // Hien ten san pham ben trong
    await expect(page.getByText('Ao Polo Nam Cao Cap')).toBeVisible();
    await expect(page.getByText('Quan Tay Slim Fit')).toBeVisible();
  });

  test('hien thi mau sac va size cua san pham', async ({ page }) => {
    await page.goto('/thanh-toan');
    // Expand accordion
    await page.locator('button', { hasText: /sản phẩm/ }).click();
    await expect(page.getByText(/Den.*L/)).toBeVisible();
    await expect(page.getByText(/Xam.*M/)).toBeVisible();
  });

  test('co nut TIEP TUC de chuyen sang shipping', async ({ page }) => {
    await page.goto('/thanh-toan');
    const nextBtn = page.getByRole('button', { name: /TIẾP TỤC/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await expect(page.getByText(/Thông tin giao hàng/i)).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/*  Shipping step — form fields + validation                           */
/* ------------------------------------------------------------------ */
test.describe('Checkout — Shipping step', () => {
  test.beforeEach(async ({ page }) => {
    await seedCart(page);
    await page.goto('/thanh-toan');
    await page.getByRole('button', { name: /TIẾP TỤC/i }).click();
    await expect(page.getByText(/Thông tin giao hàng/i)).toBeVisible();
  });

  test('hien day du form fields: ten, SDT, dia chi', async ({ page }) => {
    await expect(page.getByPlaceholder('Nguyễn Văn A')).toBeVisible();
    await expect(page.getByPlaceholder('0901234567')).toBeVisible();
    await expect(page.getByText(/Tỉnh\/Thành phố/)).toBeVisible();
    await expect(page.getByText(/Quận\/Huyện/)).toBeVisible();
    await expect(page.getByText(/Phường\/Xã/)).toBeVisible();
    await expect(page.getByPlaceholder(/Số nhà, tên đường/)).toBeVisible();
    await expect(page.getByPlaceholder(/Ghi chú cho đơn hàng/)).toBeVisible();
  });

  test('nut CHON THANH TOAN bi disabled khi chua dien du thong tin', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /CHỌN THANH TOÁN/i });
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeDisabled();
  });

  test('co nut QUAY LAI de quay ve review', async ({ page }) => {
    const backBtn = page.getByRole('button', { name: /QUAY LẠI/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    // Quay lai review — accordion "sản phẩm" hien lai
    await expect(page.locator('button', { hasText: /sản phẩm/ })).toBeVisible();
  });

  test('dien form shipping va enable nut next', async ({ page }) => {
    await page.getByPlaceholder('Nguyễn Văn A').fill('Tran Van B');
    await page.getByPlaceholder('0901234567').fill('0987654321');
    await page.locator('select').nth(0).selectOption('79');
    await page.locator('select').nth(1).waitFor({ state: 'attached' });
    await page.locator('select').nth(1).selectOption('760');
    await page.getByPlaceholder(/Số nhà, tên đường/).fill('123 Nguyen Hue');

    const nextBtn = page.getByRole('button', { name: /CHỌN THANH TOÁN/i });
    await expect(nextBtn).toBeEnabled();
  });

  test('dien form day du va chuyen sang payment step', async ({ page }) => {
    await page.getByPlaceholder('Nguyễn Văn A').fill('Tran Van B');
    await page.getByPlaceholder('0901234567').fill('0987654321');
    await page.locator('select').nth(0).selectOption('79');
    await page.locator('select').nth(1).waitFor({ state: 'attached' });
    await page.locator('select').nth(1).selectOption('760');
    await page.getByPlaceholder(/Số nhà, tên đường/).fill('123 Nguyen Hue');

    await page.getByRole('button', { name: /CHỌN THANH TOÁN/i }).click();

    // Payment step — co nut ĐẶT HÀNG
    await expect(page.getByRole('button', { name: /ĐẶT HÀNG/i })).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/*  Order summary panel (desktop sidebar)                              */
/* ------------------------------------------------------------------ */
test.describe('Checkout — Order summary panel', () => {
  test('hien tong don hang tren desktop', async ({ page }) => {
    await seedCart(page);
    await page.goto('/thanh-toan');
    // Desktop sidebar "Tổng đơn hàng" — dung last() vi first la mobile (hidden)
    await expect(page.getByRole('heading', { name: /Tổng đơn hàng/i }).last()).toBeVisible();
  });
});
