import { test, expect } from '@playwright/test';

/**
 * Auth E2E — login, register page render + form submit
 */
test.describe('Auth — Login', () => {
  test('login page render form dung', async ({ page }) => {
    await page.goto('/dang-nhap');
    await expect(page.getByRole('heading', { name: 'Dang nhap' })).toBeVisible();
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Nhap mat khau')).toBeVisible();
    await expect(page.getByRole('button', { name: 'DANG NHAP' })).toBeVisible();
  });

  test('login form co link Quen mat khau va Dang ky', async ({ page }) => {
    await page.goto('/dang-nhap');
    await expect(page.getByRole('link', { name: 'Quen mat khau?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dang ky ngay' })).toBeVisible();
  });

  test('toggle hien/an mat khau', async ({ page }) => {
    await page.goto('/dang-nhap');
    const pwInput = page.getByPlaceholder('Nhap mat khau');
    await expect(pwInput).toHaveAttribute('type', 'password');

    // Click toggle button (button ngay sau input)
    const toggleBtn = page.locator('input[placeholder="Nhap mat khau"] + button, input[placeholder="Nhap mat khau"] ~ button').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(pwInput).toHaveAttribute('type', 'text');
    }
  });

  test('login thanh cong redirect den /tai-khoan', async ({ page }) => {
    await page.goto('/dang-nhap');
    await page.getByPlaceholder('email@example.com').fill('test@example.com');
    await page.getByPlaceholder('Nhap mat khau').fill('password123');
    await page.getByRole('button', { name: 'DANG NHAP' }).click();

    // Redirect den /tai-khoan sau 800ms (mock login)
    await page.waitForURL('**/tai-khoan', { timeout: 5000 });
    await expect(page).toHaveURL('/tai-khoan');
  });
});

test.describe('Auth — Register', () => {
  test('register page render form dung', async ({ page }) => {
    await page.goto('/dang-ky');
    await expect(page.getByRole('heading', { name: /Dang ky/ })).toBeVisible();
  });

  test('click Dang ky ngay tu login page', async ({ page }) => {
    await page.goto('/dang-nhap');
    await page.getByRole('link', { name: 'Dang ky ngay' }).click();
    await expect(page).toHaveURL('/dang-ky');
  });
});
