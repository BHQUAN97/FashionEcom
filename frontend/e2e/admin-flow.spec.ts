import { test, expect, Page } from '@playwright/test';

/**
 * Admin Flow E2E — full luong admin
 * Login → Dashboard → San pham → Don hang → Khach hang → Danh muc
 * → Ton kho → Khuyen mai → Thuoc tinh → Cai dat → Nguoi dung → Media
 */

/** Seed admin auth vao localStorage + cookie */
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
    document.cookie = 'fashionecom-auth-token=e2e-fake-token-admin; path=/; max-age=604800; SameSite=Strict';
  });
}

/* ================================================================== */
/*  1. ADMIN LOGIN PAGE                                                */
/* ================================================================== */
test.describe('Admin Login', () => {
  test('login page hien thi form dang nhap', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.getByRole('heading', { name: /Admin Login/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Đăng nhập/i })).toBeVisible();
  });

  test('login form co placeholder dung', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.locator('input[placeholder="admin@example.com"]')).toBeVisible();
  });

  test('submit form trong — form van hien (khong redirect)', async ({ page }) => {
    await page.goto('/admin-login');
    await page.getByRole('button', { name: /Đăng nhập/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /Admin Login/i })).toBeVisible();
  });
});

/* ================================================================== */
/*  2. ADMIN LAYOUT — Sidebar + Topbar                                 */
/* ================================================================== */
test.describe('Admin Layout', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin');
  });

  test('sidebar hien thi voi logo ADMIN', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('ADMIN')).toBeVisible();
  });

  test('topbar hien thi "FashionEcom Admin"', async ({ page }) => {
    await expect(page.getByText('FashionEcom Admin')).toBeVisible();
  });

  test('sidebar co cac nav links chinh', async ({ page }) => {
    const sidebar = page.locator('aside nav');
    // Links don (khong trung href="/admin" voi logo)
    const expectedLinks = [
      '/admin/don-hang',
      '/admin/san-pham',
      '/admin/danh-muc',
      '/admin/thuoc-tinh',
      '/admin/ton-kho',
      '/admin/khach-hang',
      '/admin/khuyen-mai',
      '/admin/bao-cao',
      '/admin/cai-dat',
      '/admin/nhat-ky',
    ];

    for (const href of expectedLinks) {
      await expect(sidebar.locator(`a[href="${href}"]`)).toBeVisible();
    }
  });

  test('avatar dropdown hien thi khi click', async ({ page }) => {
    // Avatar circle button
    const avatarBtn = page.locator('header button').last();
    await avatarBtn.click();
    await expect(page.getByText(/Đăng xuất/i)).toBeVisible();
  });
});

/* ================================================================== */
/*  3. DASHBOARD                                                       */
/* ================================================================== */
test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin');
  });

  test('heading Dashboard hien thi', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('range buttons 7d / 30d / 90d hien thi', async ({ page }) => {
    await expect(page.getByRole('button', { name: '7d' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30d' })).toBeVisible();
    await expect(page.getByRole('button', { name: '90d' })).toBeVisible();
  });

  test('click range button thay doi active state', async ({ page }) => {
    const btn7d = page.getByRole('button', { name: '7d' });
    await btn7d.click();
    await expect(btn7d).toHaveClass(/bg-gray-900/);
  });

  test('KPI cards hien thi', async ({ page }) => {
    await expect(page.getByText(/Doanh thu/i).first()).toBeVisible();
  });

  test('charts section hien thi', async ({ page }) => {
    // Chart title — khong co diacritics: "Doanh thu theo ngay"
    await expect(page.getByText(/Doanh thu theo ng/i).first()).toBeVisible();
  });
});

/* ================================================================== */
/*  4. SAN PHAM — Product Management                                   */
/* ================================================================== */
test.describe('Admin — San pham', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/san-pham');
  });

  test('trang san pham hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Sản phẩm/i })).toBeVisible();
  });

  test('co nut "Them san pham"', async ({ page }) => {
    await expect(page.getByText(/Thêm sản phẩm/i)).toBeVisible();
  });

  test('co status filter tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Tất cả/i })).toBeVisible();
  });

  test('co search input', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Tìm"]')).toBeVisible();
  });

  test('click Them san pham navigate den trang tao', async ({ page }) => {
    await page.getByRole('link', { name: /Thêm sản phẩm/i }).click();
    await expect(page).toHaveURL(/\/admin\/san-pham\/tao/);
    await expect(page.getByRole('heading', { name: /Thêm sản phẩm mới/i })).toBeVisible();
  });
});

/* ================================================================== */
/*  5. TAO SAN PHAM — Create Product                                   */
/* ================================================================== */
test.describe('Admin — Tao san pham', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/san-pham/tao');
  });

  test('form tao san pham hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Thêm sản phẩm mới/i })).toBeVisible();
  });

  test('co 5 tabs thong tin', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Thông tin cơ bản/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Thông tin chi tiết/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mô tả/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Vận chuyển/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Thông tin khác/i })).toBeVisible();
  });

  test('content quality score hien thi', async ({ page }) => {
    await expect(page.getByText(/Cấp độ Nội dung/i)).toBeVisible();
  });

  test('co nut Luu & Hien thi', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Lưu/i })).toBeVisible();
  });

  test('co link quay lai danh sach', async ({ page }) => {
    await expect(page.getByText(/Quay lại danh sách/i)).toBeVisible();
  });
});

/* ================================================================== */
/*  6. DON HANG — Orders                                               */
/* ================================================================== */
test.describe('Admin — Don hang', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/don-hang');
  });

  test('trang don hang hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Đơn hàng/i })).toBeVisible();
  });

  test('co status filter tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Tất cả/i })).toBeVisible();
  });

  test('co search input', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Tìm"]')).toBeVisible();
  });
});

/* ================================================================== */
/*  7. KHACH HANG — Customers                                          */
/* ================================================================== */
test.describe('Admin — Khach hang', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/khach-hang');
  });

  test('trang khach hang hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Khách hàng/i })).toBeVisible();
  });

  test('table hien thi', async ({ page }) => {
    // Table luon hien — co the co data hoac empty state row
    await expect(page.locator('table')).toBeVisible();
  });
});

/* ================================================================== */
/*  8. DANH MUC — Categories                                           */
/* ================================================================== */
test.describe('Admin — Danh muc', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/danh-muc');
  });

  test('trang danh muc hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Danh mục/i })).toBeVisible();
  });

  test('co nut "Them danh muc"', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Thêm danh mục/i })).toBeVisible();
  });

  test('click Them danh muc mo modal', async ({ page }) => {
    await page.getByRole('button', { name: /Thêm danh mục/i }).click();
    await expect(page.getByText(/Thêm danh mục mới/i)).toBeVisible();
  });
});

/* ================================================================== */
/*  9. TON KHO — Inventory                                             */
/* ================================================================== */
test.describe('Admin — Ton kho', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/ton-kho');
  });

  test('trang ton kho load duoc — khong 404', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
    // Heading "Ton kho" (khong diacritics)
    await expect(page.getByText(/Ton kho/i).first()).toBeVisible();
  });

  test('co stock status tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Tất cả/i }).first()).toBeVisible();
  });
});

/* ================================================================== */
/*  10. KHUYEN MAI — Promotions Hub                                    */
/* ================================================================== */
test.describe('Admin — Khuyen mai', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/khuyen-mai');
  });

  test('trang khuyen mai load duoc — khong 404', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
    // Heading "Khuyen mai" (khong diacritics)
    await expect(page.getByText(/Khuyen mai/i).first()).toBeVisible();
  });

  test('co card links cho cac loai khuyen mai', async ({ page }) => {
    // Cards text khong co diacritics
    await expect(page.getByText(/Chuong trinh Sale/i)).toBeVisible();
    await expect(page.getByText(/Flash Sale/i)).toBeVisible();
    await expect(page.getByText(/Ma giam gia/i)).toBeVisible();
    await expect(page.getByText('Loyalty')).toBeVisible();
  });

  test('click Ma giam gia navigate den sub-page', async ({ page }) => {
    // Card link — dung <a> tag
    await page.locator('a', { hasText: /Ma giam gia/i }).click();
    await expect(page).toHaveURL(/\/admin\/khuyen-mai\/ma-giam/);
  });
});

/* ================================================================== */
/*  11. THUOC TINH — Attributes                                        */
/* ================================================================== */
test.describe('Admin — Thuoc tinh', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/thuoc-tinh');
  });

  test('trang thuoc tinh load duoc — khong 404', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
    // Heading "Thuoc tinh san pham" (khong diacritics)
    await expect(page.getByText(/Thuoc tinh/i).first()).toBeVisible();
  });

  test('co tab Mau sac va Kich co', async ({ page }) => {
    await page.waitForTimeout(500);
    // Dung exact name de tranh "Them mau sac" match "Mau sac"
    await expect(page.getByRole('button', { name: 'Mau sac', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kich co (Size)', exact: true })).toBeVisible();
  });

  test('switch tab Kich co hien thi noi dung', async ({ page }) => {
    await page.getByRole('button', { name: /Kich co/i }).click();
    await page.waitForTimeout(500);
    // Bang hoac content phai thay doi
    const table = page.locator('table');
    await expect(table.first()).toBeVisible();
  });
});

/* ================================================================== */
/*  12. CAI DAT — Settings                                             */
/* ================================================================== */
test.describe('Admin — Cai dat', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/cai-dat');
  });

  test('trang cai dat hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Cài đặt/i })).toBeVisible();
  });

  test('co setting group buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Thông tin cửa hàng/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Giao hàng/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Thanh toán/i })).toBeVisible();
  });

  test('co nut Luu thay doi', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Lưu thay đổi/i })).toBeVisible();
  });

  test('switch tab Giao hang hien setting shipping', async ({ page }) => {
    await page.getByRole('button', { name: /Giao hàng/i }).click();
    await page.waitForTimeout(300);
    // Shipping settings hien — dung first() vi co the trung
    await expect(page.getByText(/giao hàng|ship/i).first()).toBeVisible();
  });
});

/* ================================================================== */
/*  13. NGUOI DUNG — System Users                                      */
/* ================================================================== */
test.describe('Admin — Nguoi dung', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/nguoi-dung');
  });

  test('trang nguoi dung hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Người dùng/i })).toBeVisible();
  });

  test('co nut Them nguoi dung', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Thêm người dùng/i })).toBeVisible();
  });

  test('click Them nguoi dung mo modal', async ({ page }) => {
    await page.getByRole('button', { name: /Thêm người dùng/i }).click();
    await expect(page.getByText(/Thêm người dùng mới/i)).toBeVisible();
  });
});

/* ================================================================== */
/*  14. MEDIA — Media Library                                          */
/* ================================================================== */
test.describe('Admin — Media', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/media');
  });

  test('trang media hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Media/i })).toBeVisible();
  });

  test('co nut Tai len', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Tải lên/i })).toBeVisible();
  });
});

/* ================================================================== */
/*  15. DANH GIA — Reviews                                             */
/* ================================================================== */
test.describe('Admin — Danh gia', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/danh-gia');
  });

  test('trang danh gia hien thi heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Đánh giá/i })).toBeVisible();
  });

  test('co status filter tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Chờ duyệt/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Đã duyệt/i })).toBeVisible();
  });
});

/* ================================================================== */
/*  16. NHA CUNG CAP — Suppliers                                       */
/* ================================================================== */
test.describe('Admin — Nha cung cap', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/nha-cung-cap');
  });

  test('trang nha cung cap load duoc — khong 404', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
    // Heading "Nha cung cap" (khong diacritics)
    await expect(page.getByText(/Nha cung cap/i).first()).toBeVisible();
  });

  test('co nut Them NCC', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Them NCC/i })).toBeVisible();
  });
});

/* ================================================================== */
/*  17. LAYOUT BUILDER                                                 */
/* ================================================================== */
test.describe('Admin — Layout Builder', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/layout-builder');
  });

  test('trang layout builder load duoc', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
  });
});

/* ================================================================== */
/*  18. NHAT KY — Audit Log                                            */
/* ================================================================== */
test.describe('Admin — Nhat ky', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin/nhat-ky');
  });

  test('trang nhat ky load duoc', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=404')).not.toBeVisible();
  });
});

/* ================================================================== */
/*  19. SIDEBAR NAVIGATION — Click test                                */
/* ================================================================== */
test.describe('Admin — Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
    await page.goto('/admin');
  });

  const navTests = [
    { label: 'Don hang',   href: '/admin/don-hang' },
    { label: 'San pham',   href: '/admin/san-pham' },
    { label: 'Danh muc',   href: '/admin/danh-muc' },
    { label: 'Ton kho',    href: '/admin/ton-kho' },
    { label: 'Khach hang', href: '/admin/khach-hang' },
    { label: 'Khuyen mai', href: '/admin/khuyen-mai' },
  ];

  for (const nav of navTests) {
    test(`click ${nav.label} navigate den ${nav.href}`, async ({ page }) => {
      await page.locator(`aside nav a[href="${nav.href}"]`).click();
      await expect(page).toHaveURL(nav.href);
    });
  }
});
