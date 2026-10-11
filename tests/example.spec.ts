import { test, expect, type Page } from '@playwright/test';

async function addIphone13Lcd(page: Page) {
  await page.goto('/');
  const product = page.locator('article').filter({ hasText: 'iPhone 13 LCD Premium' });
  const addButton = product.getByRole('button', { name: 'Add to Cart' });
  await page.waitForLoadState('networkidle');
  await addButton.click();
}

test('Homepage displays products', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Find Quality Mobile Spare Parts/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'More Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shop by Mobile Brand' })).toBeVisible();
  await expect(page.getByText('Wholesale & Retail').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to Cart' }).first()).toBeVisible();
});

test('Category navigation links to category products', async ({ page }) => {
  await page.goto('/');
  const menu = page.locator('#desktop-category-menu');
  await page.getByRole('button', { name: 'All Categories' }).hover();
  await menu.getByRole('button', { name: 'Show products in Displays' }).click();

  const productLink = menu.locator('a[href^="/product/"]').first();
  await expect(productLink).toBeVisible();
  const productPath = await productLink.getAttribute('href');
  const productName = (await productLink.textContent())?.trim() ?? "";
  await productLink.click();

  await expect(page).toHaveURL(new RegExp(`${productPath}$`));
  await expect(page.getByRole('heading', { name: productName, exact: true })).toBeVisible();
});

test('Mobile category menu exposes category products', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('button', { name: 'All Categories' }).click();
  await page.getByRole('button', { name: 'Show products in Displays' }).click();

  const productLink = page.locator('#mobile-category-menu').getByRole('link', { name: 'iPhone 13 LCD Premium' });
  await expect(productLink).toBeVisible();
  await productLink.click();

  await expect(page).toHaveURL(/\/product\/iphone-13-lcd-premium$/);
  await expect(page.getByRole('heading', { name: 'iPhone 13 LCD Premium', exact: true })).toBeVisible();
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
  await expect(page.getByText('Rs. 25,000', { exact: true }).last()).toBeVisible();
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

  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.locator('div[role="alert"]').filter({ hasText: 'Please enter your full name.' })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
});

test('Checkout rejects invalid Pakistani phone number', async ({ page }) => {
  await addIphone13Lcd(page);

  await page.goto('/checkout');
  await page.getByPlaceholder('Your full name').fill('Test Customer');
  await page.getByPlaceholder('03001234567').fill('12345');
  await page.getByPlaceholder('House / Shop / Street / Area').fill('House 123, Main Road');

  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.locator('div[role="alert"]').filter({ hasText: 'Please enter a valid Pakistani phone number' })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
});
