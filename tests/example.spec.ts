import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('pw-storage-reset')) {
      localStorage.clear();
      sessionStorage.setItem('pw-storage-reset', '1');
    }
  });
});

async function addIphone13Lcd(page: Page) {
  await page.goto('/');
  const product = page.locator('article').filter({ hasText: 'iPhone 13 LCD Premium' });
  await product.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByRole('link', { name: /Cart/ }).first()).toContainText('1');
}

test('Homepage displays products', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Quality Mobile Parts/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Best Selling Parts' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add' }).first()).toBeVisible();
});

test('Add product to cart', async ({ page }) => {
  await addIphone13Lcd(page);

  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Your Cart', exact: true })).toBeVisible();
  await expect(page.getByText('iPhone 13 LCD Premium')).toBeVisible();
  await expect(page.getByText('1 item in your cart')).toBeVisible();
});

test('Cart quantity can be increased', async ({ page }) => {
  await addIphone13Lcd(page);

  await page.goto('/cart');
  await page.getByRole('button', { name: '+', exact: true }).click();

  await expect(page.getByText('2 items in your cart')).toBeVisible();
  await expect(page.getByText('Rs. 25,000')).toBeVisible();
});

test('Product can be removed from cart', async ({ page }) => {
  await addIphone13Lcd(page);

  await page.goto('/cart');
  await page.getByRole('button', { name: 'Remove' }).click();

  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('Checkout form rejects invalid customer details', async ({ page }) => {
  await addIphone13Lcd(page);

  await page.goto('/checkout');
  await page.getByPlaceholder('Your full name').fill('AB');
  await page.getByPlaceholder('03001234567').fill('03001234567');
  await page.getByPlaceholder('House / Shop / Street / Area').fill('House 123, Main Road');

  await page.getByRole('button', { name: 'Place Order' }).click();

  await expect(page.getByRole('alert')).toContainText('Please enter your full name.');
  await expect(page).toHaveURL(/\/checkout$/);
});

test('Checkout rejects invalid Pakistani phone number', async ({ page }) => {
  await addIphone13Lcd(page);

  await page.goto('/checkout');
  await page.getByPlaceholder('Your full name').fill('Test Customer');
  await page.getByPlaceholder('03001234567').fill('12345');
  await page.getByPlaceholder('House / Shop / Street / Area').fill('House 123, Main Road');

  await page.getByRole('button', { name: 'Place Order' }).click();

  await expect(page.getByRole('alert')).toContainText('Please enter a valid Pakistani phone number');
  await expect(page).toHaveURL(/\/checkout$/);
});
