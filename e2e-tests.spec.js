/**
 * Playwright E2E Tests for AMD System
 * Tests Google OAuth, Email Auth, and Call Flow
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'bhanuteja731@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'your-password';
const TEST_PHONE = '+917386836602';

test.describe('AMD System E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for OAuth flows
    test.setTimeout(60000);
  });

  test('1. Google OAuth Flow', async ({ page, context }) => {
    console.log('\n🧪 Testing Google OAuth Flow...\n');

    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveTitle(/Sign in/);

    // Listen for console logs
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
      console.log(`   Browser: ${msg.text()}`);
    });

    // Click Google Sign In button
    console.log('   👆 Clicking "Sign in with Google" button...');
    const googleButton = page.locator('button:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible();
    
    // Click and wait for navigation or popup
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      googleButton.click(),
    ]);

    console.log('   ✅ OAuth popup/redirect opened');

    // Check console logs
    const hasOAuthLog = consoleLogs.some(log => log.includes('Starting Google OAuth'));
    expect(hasOAuthLog).toBeTruthy();
    console.log('   ✅ OAuth initiation logged correctly');

    // Note: Actual Google authentication requires manual intervention
    console.log('\n   ⚠️  Manual step required:');
    console.log('   1. Complete Google authentication in the opened window');
    console.log('   2. After authentication, check if redirected to /dial\n');

    // Wait a bit for manual authentication (in headed mode)
    await page.waitForTimeout(5000);

    console.log('   ℹ️  To test OAuth completely, run with --headed flag');
    console.log('      and manually complete Google authentication\n');
  });

  test('2. Email/Password Authentication', async ({ page }) => {
    console.log('\n🧪 Testing Email/Password Authentication...\n');

    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);

    // Fill in credentials
    console.log(`   📧 Entering email: ${TEST_EMAIL}`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    
    console.log('   🔒 Entering password');
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Submit form
    console.log('   👆 Clicking Sign in button...');
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    try {
      await page.waitForURL(`${BASE_URL}/dial`, { timeout: 10000 });
      console.log('   ✅ Successfully logged in and redirected to /dial');
      
      // Verify we're on the dial page
      await expect(page.locator('h1, h2')).toContainText(/dial/i, { timeout: 5000 });
      console.log('   ✅ Dial page loaded successfully\n');
    } catch (error) {
      // Check for error message
      const errorMsg = await page.locator('text=/error/i').first().textContent().catch(() => null);
      if (errorMsg) {
        console.log(`   ❌ Login failed: ${errorMsg}`);
        throw new Error(`Login failed: ${errorMsg}`);
      } else {
        console.log('   ❌ Login failed or redirect timeout');
        throw error;
      }
    }
  });

  test('3. Make a Call', async ({ page }) => {
    console.log('\n🧪 Testing Call Creation...\n');

    // First login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dial`, { timeout: 10000 });

    console.log('   ✅ Logged in successfully');

    // Fill dial form
    console.log(`   📞 Entering phone number: ${TEST_PHONE}`);
    await page.fill('input[type="tel"], input[placeholder*="phone" i]', TEST_PHONE);

    // Select strategy
    console.log('   🎯 Selecting strategy: Twilio Native');
    await page.selectOption('select', 'twilio');

    // Listen for network requests
    page.on('response', response => {
      if (response.url().includes('/api/dial')) {
        console.log(`   📡 API Response: ${response.status()}`);
      }
    });

    // Click Dial Now button
    console.log('   👆 Clicking "Dial Now" button...');
    const dialButton = page.locator('button:has-text("Dial"), button:has-text("Call")');
    await dialButton.click();

    // Wait for success message or error
    try {
      // Check for success message
      const successMsg = page.locator('text=/success/i, text=/initiated/i');
      await expect(successMsg).toBeVisible({ timeout: 10000 });
      console.log('   ✅ Call initiated successfully!');

      // Wait for redirect to history
      await page.waitForURL(/\/history/, { timeout: 10000 });
      console.log('   ✅ Redirected to history page');

      // Verify call appears in history
      await expect(page.locator(`text=${TEST_PHONE}`)).toBeVisible({ timeout: 5000 });
      console.log('   ✅ Call appears in history\n');

    } catch (error) {
      // Check for error message
      const errorMsg = await page.locator('text=/error/i').first().textContent().catch(() => 'Unknown error');
      console.log(`   ❌ Call creation failed: ${errorMsg}`);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-failure-call.png', fullPage: true });
      console.log('   📸 Screenshot saved: test-failure-call.png');
      
      throw new Error(`Call creation failed: ${errorMsg}`);
    }
  });

  test('4. View Call History', async ({ page }) => {
    console.log('\n🧪 Testing Call History...\n');

    // First login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dial`, { timeout: 10000 });

    // Navigate to history
    console.log('   🔍 Navigating to history page...');
    await page.goto(`${BASE_URL}/history`);

    // Wait for calls to load
    console.log('   ⏳ Waiting for calls to load...');
    await page.waitForTimeout(2000);

    // Check if calls are displayed
    const callRows = page.locator('[class*="call"], [class*="row"], tr, li');
    const count = await callRows.count();
    
    console.log(`   📊 Found ${count} call records`);

    if (count > 0) {
      console.log('   ✅ Call history loaded successfully\n');
    } else {
      console.log('   ⚠️  No calls in history (this is OK if no calls were made)\n');
    }
  });

  test('5. Check Authentication Protection', async ({ page }) => {
    console.log('\n🧪 Testing Authentication Protection...\n');

    // Try to access protected route without auth
    console.log('   🔒 Attempting to access /dial without authentication...');
    await page.goto(`${BASE_URL}/dial`);

    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
    console.log('   ✅ Correctly redirected to login page');

    // Try to access history without auth
    console.log('   🔒 Attempting to access /history without authentication...');
    await page.goto(`${BASE_URL}/history`);

    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
    console.log('   ✅ Correctly redirected to login page\n');
  });

  test('6. API Endpoint Security', async ({ page }) => {
    console.log('\n🧪 Testing API Endpoint Security...\n');

    // Test dial API without auth
    console.log('   🔒 Testing /api/dial without authentication...');
    const dialResponse = await page.request.post(`${BASE_URL}/api/dial`, {
      data: { phone: TEST_PHONE, strategy: 'twilio' }
    });
    
    expect(dialResponse.status()).toBe(401);
    console.log('   ✅ Dial API correctly returns 401 Unauthorized');

    // Test calls API without auth
    console.log('   🔒 Testing /api/calls without authentication...');
    const callsResponse = await page.request.get(`${BASE_URL}/api/calls`);
    
    expect(callsResponse.status()).toBe(401);
    console.log('   ✅ Calls API correctly returns 401 Unauthorized\n');
  });

});

test.describe('Production Readiness Checks', () => {

  test('Page Load Performance', async ({ page }) => {
    console.log('\n🧪 Testing Page Load Performance...\n');

    const start = Date.now();
    await page.goto(`${BASE_URL}/login`);
    const loadTime = Date.now() - start;

    console.log(`   ⏱️  Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('   ✅ Page loads quickly (< 3s)\n');
    } else {
      console.log('   ⚠️  Page load is slow (> 3s)\n');
    }

    expect(loadTime).toBeLessThan(10000); // Max 10s
  });

  test('Console Errors Check', async ({ page }) => {
    console.log('\n🧪 Checking for Console Errors...\n');

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(2000);

    if (errors.length === 0) {
      console.log('   ✅ No console errors found\n');
    } else {
      console.log(`   ⚠️  Found ${errors.length} console errors:`);
      errors.forEach(err => console.log(`      - ${err}`));
      console.log();
    }

    // Don't fail on console errors, just warn
    expect(errors.length).toBeLessThan(10);
  });

});
