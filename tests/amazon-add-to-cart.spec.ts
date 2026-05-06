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
test('Amazon | add wireless mouse to cart and verify quantity', async ({ page, context, browser, testBase }) => {
    const amazonCartFlowPage = new AmazonCartFlowPage(page, context, browser);

    try {
        // 1) Navigate to homepage using page object navigation (do not call page.goto directly).
        await amazonCartFlowPage.navigateToHome();

        // 2) Verify homepage loads successfully.
        await expect(page).toHaveTitle(/Amazon/i);
        await expect(page.getByRole('searchbox', { name: 'Search Amazon' })).toBeVisible();

        // 3) Search for product and submit.
        await amazonCartFlowPage.searchForProduct('Wireless Mouse');
        await amazonCartFlowPage.submitSearch();

        // 4) Select product.
        // NOTE: This uses the recorded first product link and does NOT guarantee the item is non-sponsored.
        await amazonCartFlowPage.openRecordedFirstProduct();

        // 5) Capture product title on PDP for later verification.
        const productTitle = await amazonCartFlowPage.getProductTitleOnPdp();

        // 6) Add to cart then go to cart.
        await amazonCartFlowPage.addToCart();
        await amazonCartFlowPage.goToCart();

        // 7) Verify cart contains the captured title and quantity 1.
        await amazonCartFlowPage.verifyCartHasItemWithQuantity(productTitle, 1);
    } catch (error) {
        await testBase.handleTestFailure(error as Error);
        throw error;
    }
});
