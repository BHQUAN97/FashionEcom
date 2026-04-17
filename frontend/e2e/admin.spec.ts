import { test, expect, Page } from '@playwright/test';

/**
 * Admin E2E — dashboard, sidebar navigation, cac trang quan ly chinh
 * Auth: seed zustand persist store vao localStorage truoc khi navigate
 */

/** Seed admin auth vao localStorage (zustand persist key: fashionecom-auth) */
async function seedAdminAuth(page: Page) {
  await page.goto('/admin');
  await page.evaluate(() => {
    const authData = {
      state: {
        user: {
          id: 'e2e-admin-001',
          email: 'admin@fashionecom.vn',
          name: 'E2E Admin',
          role: 1,
        },
        accessToken: 'e2e-fake-token-admin',
      },
      version: 0,
    };
    localStorage.setItem('fashionecom-auth', JSON.stringify(authData));
  });
}

test.describe('Admin — Layout & Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin');
  });

  test('admin layout render sidebar voi logo ADMIN', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('ADMIN')).toBeVisible();
  });

  test('topbar hien thi FashionEcom Admin', async ({ page }) => {
    await expect(page.getByText('FashionEcom Admin')).toBeVisible();
  });

  test('sidebar chua cac nav links chinh', async ({ page }) => {
    const sidebar = page.locator('aside nav');
    const expectedLinks = [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Don hang', href: '/admin/don-hang' },
      { label: 'San pham', href: '/admin/san-pham' },
      { label: 'Danh muc', href: '/admin/danh-muc' },
      { label: 'Khach hang', href: '/admin/khach-hang' },
      { label: 'Khuyen mai', href: '/admin/khuyen-mai' },
      { label: 'Bao cao', href: '/admin/bao-cao' },
      { label: 'Cai dat', href: '/admin/cai-dat' },
    ];

    for (const link of expectedLinks) {
      await expect(sidebar.locator(`a[href="${link.href}"]`)).toBeVisible();
    }
  });

  test('topbar co nut Thong bao', async ({ page }) => {
    await expect(page.locator('button[aria-label="Thong bao"]')).toBeVisible();
  });
});

test.describe('Admin — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin');
  });

  test('dashboard render heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('dashboard co range buttons 7d / 30d / 90d', async ({ page }) => {
    await expect(page.getByRole('button', { name: '7d' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30d' })).toBeVisible();
    await expect(page.getByRole('button', { name: '90d' })).toBeVisible();
  });

  test('click range button thay doi active state', async ({ page }) => {
    const btn7d = page.getByRole('button', { name: '7d' });
    await btn7d.click();
    // Button 7d phai co class active (bg-gray-900)
    await expect(btn7d).toHaveClass(/bg-gray-900/);
  });
});

test.describe('Admin — Trang quan ly', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
  });

  test('trang ton kho load duoc', async ({ page }) => {
    await page.goto('/admin/ton-kho');
    await expect(page.locator('aside')).toBeVisible();
    // Trang ton kho co page.tsx — kiem tra khong 404
    await expect(page.locator('text=404')).not.toBeVisible();
  });

  test('trang don dat hang load duoc', async ({ page }) => {
    await page.goto('/admin/don-dat-hang');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
  });

  test('trang danh gia load duoc', async ({ page }) => {
    await page.goto('/admin/danh-gia');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
  });

  test('trang nha cung cap load duoc', async ({ page }) => {
    await page.goto('/admin/nha-cung-cap');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
  });

  test('trang nhat ky load duoc', async ({ page }) => {
    await page.goto('/admin/nhat-ky');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
  });

  test('trang layout builder load duoc', async ({ page }) => {
    await page.goto('/admin/layout-builder');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
  });
});

test.describe('Admin — Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin');
  });

  test('click Don hang trong sidebar di den /admin/don-hang', async ({ page }) => {
    await page.locator('aside a[href="/admin/don-hang"]').click();
    await expect(page).toHaveURL('/admin/don-hang');
  });

  test('click San pham trong sidebar di den /admin/san-pham', async ({ page }) => {
    await page.locator('aside a[href="/admin/san-pham"]').click();
    await expect(page).toHaveURL('/admin/san-pham');
  });

  test('click Danh muc trong sidebar di den /admin/danh-muc', async ({ page }) => {
    await page.locator('aside a[href="/admin/danh-muc"]').click();
    await expect(page).toHaveURL('/admin/danh-muc');
  });

  test('click Bao cao trong sidebar di den /admin/bao-cao', async ({ page }) => {
    await page.locator('aside a[href="/admin/bao-cao"]').click();
    await expect(page).toHaveURL('/admin/bao-cao');
  });
});
