import { test, expect } from '@test-setup/fixtures';
import { AmazonCartFlowPage } from '@/pages/amazon-cart-flow.page';

/**
 * Scenario: Search for a product on Amazon, open the first recorded result, add it to the cart,
 * and verify the cart contains the same product with quantity 1.
 *
 * Expectations:
 * - Amazon home page loads successfully.
 * - Search for "Wireless Mouse" returns results and the recorded first product can be opened.
 * - After adding to cart and navigating to cart, the cart contains the selected product title and quantity is 1.
 */
/**
 * Add a wireless mouse to the Amazon cart and verify the cart contains the same item with quantity 1.
 */
test('Amazon | add wireless mouse to cart and verify quantity', async ({ page, context, browser, testBase }) => {
    const amazonCartFlowPage = new AmazonCartFlowPage(page, context, browser);

    try {
        await amazonCartFlowPage.navigateToHome();

        // Basic homepage verification after navigation.
        await expect(page).toHaveTitle(/Amazon/i);
        await expect(page.getByRole('searchbox', { name: 'Search Amazon' })).toBeVisible();

        // Optional interstitial: "Continue shopping" may appear depending on prior state.
        try {
            await amazonCartFlowPage.continueShoppingIfPresent();
        } catch {
            // Intentionally ignored: button is not always present.
        }

        await amazonCartFlowPage.searchForProduct('Wireless Mouse');
        await amazonCartFlowPage.submitSearch();
        await amazonCartFlowPage.openRecordedFirstProduct();

        const productTitle = await amazonCartFlowPage.getProductTitleOnPdp();

        await amazonCartFlowPage.addToCart();
        await amazonCartFlowPage.goToCart();
        await amazonCartFlowPage.verifyCartHasItemWithQuantity(productTitle, 1);
    } catch (error) {
        await testBase.handleTestFailure(error as Error);
        throw error;
    }
});
