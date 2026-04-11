import { test, expect, Page } from '@playwright/test';

/**
 * Checkout E2E — luong thanh toan /thanh-toan
 * 3 steps: review -> shipping -> payment
 */

/** Seed 1 san pham vao cart qua localStorage (giong cart.spec.ts) */
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
    // Clear localStorage truoc khi vao trang thanh toan
    await page.goto('/san-pham');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/thanh-toan');
    await expect(page.getByText(/Gio hang trong/i)).toBeVisible();
  });

  test('khong hien form shipping khi gio hang trong', async ({ page }) => {
    await page.goto('/san-pham');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/thanh-toan');
    // Form shipping khong xuat hien
    await expect(page.getByText(/Thong tin giao hang/i)).not.toBeVisible();
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
    await expect(page.getByRole('heading', { level: 1, name: /Thanh toan/i })).toBeVisible();
  });

  test('hien order summary voi san pham tu cart', async ({ page }) => {
    await page.goto('/thanh-toan');
    // Review step hien thi so san pham trong accordion
    const accordion = page.getByRole('button', { name: /Don hang.*2 san pham/i });
    await expect(accordion).toBeVisible();
    // Click expand accordion de xem chi tiet
    await accordion.click();
    // Hien ten san pham ben trong
    await expect(page.getByText('Ao Polo Nam Cao Cap')).toBeVisible();
    await expect(page.getByText('Quan Tay Slim Fit')).toBeVisible();
  });

  test('hien thi mau sac va size cua san pham', async ({ page }) => {
    await page.goto('/thanh-toan');
    // Expand accordion truoc
    await page.getByRole('button', { name: /Don hang.*san pham/i }).click();
    await expect(page.getByText(/Den.*L/)).toBeVisible();
    await expect(page.getByText(/Xam.*M/)).toBeVisible();
  });

  test('co nut TIEP TUC de chuyen sang shipping', async ({ page }) => {
    await page.goto('/thanh-toan');
    const nextBtn = page.getByRole('button', { name: /TIEP TUC/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    // Sau khi click, hien form shipping
    await expect(page.getByText(/Thong tin giao hang/i)).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/*  Shipping step — form fields + validation                           */
/* ------------------------------------------------------------------ */
test.describe('Checkout — Shipping step', () => {
  test.beforeEach(async ({ page }) => {
    await seedCart(page);
    await page.goto('/thanh-toan');
    // Click TIEP TUC de vao shipping step
    await page.getByRole('button', { name: /TIEP TUC/i }).click();
    await expect(page.getByText(/Thong tin giao hang/i)).toBeVisible();
  });

  test('hien day du form fields: ten, SDT, dia chi', async ({ page }) => {
    // Ho ten
    await expect(page.getByPlaceholder('Nguyen Van A')).toBeVisible();
    // So dien thoai
    await expect(page.getByPlaceholder('0901234567')).toBeVisible();
    // Tinh/Thanh pho (select)
    await expect(page.getByText('Tinh/Thanh pho *')).toBeVisible();
    // Quan/Huyen (select)
    await expect(page.getByText('Quan/Huyen *')).toBeVisible();
    // Phuong/Xa (select)
    await expect(page.getByText('Phuong/Xa *')).toBeVisible();
    // Dia chi cu the
    await expect(page.getByPlaceholder(/So nha, ten duong/)).toBeVisible();
    // Ghi chu (khong bat buoc)
    await expect(page.getByPlaceholder(/Ghi chu cho don hang/)).toBeVisible();
  });

  test('nut CHON THANH TOAN bi disabled khi chua dien du thong tin', async ({ page }) => {
    // Nut next hien thi "CHON THANH TOAN" va bi disabled
    const nextBtn = page.getByRole('button', { name: /CHON THANH TOAN/i });
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeDisabled();
  });

  test('co nut QUAY LAI de quay ve review', async ({ page }) => {
    const backBtn = page.getByRole('button', { name: /QUAY LAI/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    // Quay lai review step — hien lai danh sach san pham
    await expect(page.getByText(/2 san pham/i)).toBeVisible();
  });

  test('dien form shipping va enable nut next', async ({ page }) => {
    // Dien ho ten
    await page.getByPlaceholder('Nguyen Van A').fill('Tran Van B');
    // Dien SDT
    await page.getByPlaceholder('0901234567').fill('0987654321');
    // Chon tinh/thanh pho: Ho Chi Minh
    await page.locator('select').nth(0).selectOption('79');
    // Cho quan/huyen load, chon Quan 1
    await page.locator('select').nth(1).waitFor({ state: 'attached' });
    await page.locator('select').nth(1).selectOption('760');
    // Dien dia chi cu the
    await page.getByPlaceholder(/So nha, ten duong/).fill('123 Nguyen Hue');

    // Nut CHON THANH TOAN phai enabled
    const nextBtn = page.getByRole('button', { name: /CHON THANH TOAN/i });
    await expect(nextBtn).toBeEnabled();
  });

  test('dien form day du va chuyen sang payment step', async ({ page }) => {
    await page.getByPlaceholder('Nguyen Van A').fill('Tran Van B');
    await page.getByPlaceholder('0901234567').fill('0987654321');
    await page.locator('select').nth(0).selectOption('79');
    await page.locator('select').nth(1).waitFor({ state: 'attached' });
    await page.locator('select').nth(1).selectOption('760');
    await page.getByPlaceholder(/So nha, ten duong/).fill('123 Nguyen Hue');

    await page.getByRole('button', { name: /CHON THANH TOAN/i }).click();

    // Payment step — co nut DAT HANG
    await expect(page.getByRole('button', { name: /DAT HANG/i })).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/*  Order summary panel (desktop sidebar)                              */
/* ------------------------------------------------------------------ */
test.describe('Checkout — Order summary panel', () => {
  test('hien tong don hang tren desktop', async ({ page }) => {
    await seedCart(page);
    await page.goto('/thanh-toan');

    // OrderSummaryPanel chi hien tren md+ (hidden md:block)
    // Playwright Desktop Chrome du rong de hien
    await expect(page.getByText(/Tong don hang/i)).toBeVisible();
  });
});
