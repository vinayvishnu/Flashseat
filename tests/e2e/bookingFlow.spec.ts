import { test, expect } from '@playwright/test';

test.describe('FlashSeat End-to-End Ticketing Workflow', () => {
  test('should complete a successful ticket booking journey', async ({ page }) => {
    // 1. Open FlashSeat Web App
    console.log('📡 Navigating to homepage...');
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle(/FlashSeat AI/);
    
    // 2. Click Join Queue button (should redirect to Login page because user is unauthenticated)
    console.log('🔒 Checking login wall...');
    const queueBtn = page.locator('button:has-text("Join Live Queue")').first();
    await queueBtn.click();
    await expect(page).toHaveURL(/.*login/);

    // 3. Authenticate using the "Quick Testing Access" user shortcut button
    console.log('🔑 Performing authentication...');
    const userLoginBtn = page.locator('button:has-text("Login as User")');
    await userLoginBtn.click();
    await expect(page).toHaveURL(/.*dashboard/);

    // 4. Join Match Booking Room from the dashboard
    console.log('🏟️ Entering Match Room...');
    const enterRoomBtn = page.locator('button:has-text("Enter Booking Room")').first();
    await enterRoomBtn.click();
    await expect(page).toHaveURL(/.*queue/);

    // 5. Wait in the Virtual waiting queue countdown to complete
    console.log('⏳ Waiting in queue...');
    // We expect the backend to count down position to 0 and redirect within 12 seconds
    await page.waitForURL(/.*seat-selection/, { timeout: 15000 });
    console.log('✅ Redirected to Seat Selection Map!');

    // 6. Select an available seat in the map
    // We target general stand seats (e.g. seat 15, 16, etc. to avoid locked seats)
    const seatId = '15'; 
    const seatBtn = page.locator(`button[title*="-${seatId}"]`).first();
    await expect(seatBtn).toBeVisible();
    await seatBtn.click();

    // Verify seat is selected in checkout summary
    const summaryHeader = page.locator('h2:has-text("Allocation Summary")');
    await expect(summaryHeader).toBeVisible();
    
    // 7. Click Proceed to Checkout
    const checkoutBtn = page.locator('button:has-text("Proceed to Checkout")');
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*booking-status/);

    // 8. Fill in Attendee details
    console.log('✍️ Filling attendee details...');
    const nameInput = page.locator('input[placeholder="Enter Full Name"]');
    await nameInput.fill('E2E Tester');

    const phoneInput = page.locator('input[placeholder="+91 9988776655"]');
    await phoneInput.fill('+91 9900000001');

    const proceedPaymentBtn = page.locator('button:has-text("Proceed to Payment")');
    await proceedPaymentBtn.click();

    // 9. Choose Wallet and Pay
    console.log('💳 Confirming payment...');
    const payBtn = page.locator('button:has-text("Settle Ticket Payment")');
    await payBtn.click();

    // 10. Verify Ticket Success Confirmation Screen
    await expect(page.locator('h2:has-text("IPL Pass Secured!")')).toBeVisible({ timeout: 10000 });
    console.log('🎉 Booking completed successfully! Pass is secured.');
  });
});
