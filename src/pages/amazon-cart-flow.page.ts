import { expect, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@/pages/base.page';
import { ActionUtils } from '@/utils/action-utils';

export class AmazonCartFlowPage extends BasePage {
    constructor(page: Page, context?: BrowserContext, browser?: Browser) {
        super(page, context, browser);
    }

    // ==================== RECORDED LOCATORS (PRIMARY SELECTORS) ====================

    private get searchBox(): Locator {
        return this.page.getByRole('searchbox', { name: 'Search Amazon' });
    }

    private get goButton(): Locator {
        return this.page.getByRole('button', { name: 'Go', exact: true });
    }

    private get recordedFirstProductLink(): Locator {
        return this.page.getByRole('link', {
            name: 'Logitech M185 Wireless Mouse, 2.4GHz with USB Mini Receiver, 12-Month Battery Life, 1000 DPI Optical Tracking, Ambidextrous PC/Mac/Laptop - Swift Grey',
            exact: true
        });
    }

    private get addToCartButton(): Locator {
        return this.page.getByRole('button', { name: 'Add to cart', exact: true });
    }

    private get goToCartLink(): Locator {
        return this.page.locator('#sw-gtc').getByRole('link', { name: 'Go to Cart' });
    }

    // ==================== FLOW METHODS ====================

    /**
     * Navigate to Amazon home page.
     */
    async navigateToHome(): Promise<void> {
        this.logStep('Navigate to Amazon home page');
        await this.navigateTo('https://www.amazon.com');
        await this.page.waitForLoadState('networkidle');
        await expect(this.searchBox).toBeVisible();
    }

    /**
     * Search for a product using the Amazon search box.
     * @param query Search query text
     */
    async searchForProduct(query: string): Promise<void> {
        this.logStep(`Search for product: ${query}`);
        // Recorded step basis:
        // await page.getByRole('searchbox', { name: 'Search Amazon' }).fill('Wireless Mouse');
        await ActionUtils.fill(this.searchBox, query, { page: this.page });
    }

    /**
     * Submit the search.
     */
    async submitSearch(): Promise<void> {
        this.logStep('Submit search');
        // Recorded step basis:
        // await page.getByRole('button', { name: 'Go', exact: true }).click();
        await ActionUtils.clickAndNavigate(this.goButton, { page: this.page });
    }

    /**
     * Open the recorded first product from search results.
     */
    async openRecordedFirstProduct(): Promise<void> {
        this.logStep('Open recorded first product from search results');
        // Recorded step basis:
        // await page.getByRole('link', { name: 'Logitech M185 Wireless Mouse, ...', exact: true }).click();
        await ActionUtils.clickAndNavigate(this.recordedFirstProductLink, { page: this.page });
    }

    /**
     * Click "Add to cart" on the product details page and wait for confirmation.
     */
    async addToCart(): Promise<void> {
        this.logStep('Add product to cart');
        // Recorded step basis:
        // await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
        await ActionUtils.click(this.addToCartButton, { page: this.page });

        // Wait for the cart confirmation area (contains Go to Cart link)
        await expect(this.page.locator('#sw-gtc')).toBeVisible();
        await expect(this.goToCartLink).toBeVisible();
    }

    /**
     * Go to the cart from the add-to-cart confirmation area.
     */
    async goToCart(): Promise<void> {
        this.logStep('Go to cart');
        // Recorded step basis:
        // await page.locator('#sw-gtc').getByRole('link', { name: 'Go to Cart' }).click();
        await ActionUtils.clickAndNavigate(this.goToCartLink, { page: this.page });
    }

    /**
     * Get the product title on the product details page.
     */
    async getProductTitleOnPdp(): Promise<string> {
        this.logStep('Get product title on PDP');
        const titleLocator = this.page.locator('#productTitle');
        await expect(titleLocator).toBeVisible();
        const title = (await titleLocator.innerText()).trim();
        return title;
    }

    /**
     * Verify the cart contains an item matching the expected title and quantity.
     * @param expectedTitle Expected product title (substring match)
     * @param expectedQty Expected quantity (default 1)
     */
    async verifyCartHasItemWithQuantity(expectedTitle: string, expectedQty: number = 1): Promise<void> {
        this.logStep(`Verify cart has item with quantity ${expectedQty}`);

        // Cart item title(s)
        const cartItemTitles = this.page.locator('span.a-truncate-full.a-offscreen, span.sc-product-title');
        await expect(cartItemTitles.first()).toBeVisible();

        const titles = (await cartItemTitles.allInnerTexts()).map(t => t.trim()).filter(Boolean);
        const normalizedExpected = expectedTitle.trim().toLowerCase();
        const hasExpected = titles.some(t => t.toLowerCase().includes(normalizedExpected));
        expect(hasExpected, `Expected cart to contain title including: ${expectedTitle}. Actual titles: ${JSON.stringify(titles)}`).toBeTruthy();

        // Quantity: prefer the quantity dropdown if present
        const qtyDropdown = this.page.locator('select[name="quantity"], select[data-a-native-class="quantity"]');
        if (await qtyDropdown.first().count()) {
            await expect(qtyDropdown.first()).toBeVisible();
            const qtyValue = await qtyDropdown.first().inputValue();
            expect(parseInt(qtyValue, 10)).toBe(expectedQty);
            return;
        }

        // Fallback: quantity text (less reliable, but better than nothing)
        const qtyText = this.page.locator('span.sc-quantity-textfield, span.a-dropdown-prompt');
        await expect(qtyText.first()).toBeVisible();
        const qtyRaw = (await qtyText.first().innerText()).trim();
        const qtyParsed = parseInt(qtyRaw, 10);
        expect(qtyParsed).toBe(expectedQty);
    }
}
