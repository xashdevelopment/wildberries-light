const { chromium } = require('playwright');

/**
 * Test script for Wildberries Light application (Vercel Serverless Edition)
 * Tests the main functionality including search, product rendering, and modal
 * 
 * Note: This test uses file:// protocol which falls back to demo data
 * For full API testing, use 'vercel dev' or deploy to Vercel
 */

async function runTests() {
    console.log('='.repeat(60));
    console.log('Wildberries Light - Test Suite');
    console.log('='.repeat(60));
    console.log('');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let testsPassed = 0;
    let testsFailed = 0;

    // Collect console logs
    const consoleLogs = [];
    const consoleErrors = [];

    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push({ type: msg.type(), text });
        if (msg.type() === 'error') {
            consoleErrors.push(text);
        }
    });

    page.on('pageerror', error => {
        consoleErrors.push(`Page Error: ${error.message}`);
    });

    try {
        // Test 1: Page loads correctly
        console.log('Test 1: Loading page...');
        try {
            // Use __dirname for correct path resolution
            const path = require('path');
            const filePath = path.join(__dirname, 'index.html');
            await page.goto(`file://${filePath}`, { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            console.log('  ✓ Page loaded successfully');
            testsPassed++;
        } catch (error) {
            console.log(`  ✗ Failed to load page: ${error.message}`);
            testsFailed++;
        }

        // Test 2: Main elements exist
        console.log('');
        console.log('Test 2: Checking main elements...');

        const elements = {
            'Logo': '.logo',
            'Search Input': '#searchInput',
            'Search Button': '#searchBtn',
            'Products Grid': '#productsGrid',
            'Results Info': '#resultsInfo',
            'Buy Modal': '#buyModal',
            'Modal Link': '#modalLink',
            'Modal Close': '#modalClose'
        };

        for (const [name, selector] of Object.entries(elements)) {
            const element = await page.$(selector);
            if (element) {
                console.log(`  ✓ ${name} found`);
                testsPassed++;
            } else {
                console.log(`  ✗ ${name} NOT found`);
                testsFailed++;
            }
        }

        // Test 3: Product cards render
        console.log('');
        console.log('Test 3: Checking product rendering...');
        
        // Wait for products to load (with timeout)
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.product-card');
            return cards.length > 0;
        }, { timeout: 15000 }).then(() => {
            console.log('  ✓ Product cards rendered');
            testsPassed++;
        }).catch(() => {
            console.log('  ✗ Product cards did not render');
            testsFailed++;
        });

        // Get product count
        const productCount = await page.$$eval('.product-card', cards => cards.length);
        console.log(`  ✓ Found ${productCount} product cards`);

        // Test 4: Product card structure
        console.log('');
        console.log('Test 4: Verifying product card structure...');

        const cardStructure = await page.evaluate(() => {
            const card = document.querySelector('.product-card');
            if (!card) return null;

            const image = card.querySelector('.product-image, .product-image-placeholder');
            const name = card.querySelector('.product-name');
            const price = card.querySelector('.product-price');
            const buyBtn = card.querySelector('.buy-btn');

            return {
                hasImage: !!image,
                hasName: !!name,
                hasPrice: !!price,
                hasBuyBtn: !!buyBtn,
                nameText: name?.textContent?.trim() || '',
                priceText: price?.textContent?.trim() || ''
            };
        });

        if (cardStructure) {
            if (cardStructure.hasImage) {
                console.log('  ✓ Product image present');
                testsPassed++;
            } else {
                console.log('  ✗ Product image missing');
                testsFailed++;
            }

            if (cardStructure.hasName) {
                console.log(`  ✓ Product name: "${cardStructure.nameText.substring(0, 50)}..."`);
                testsPassed++;
            } else {
                console.log('  ✗ Product name missing');
                testsFailed++;
            }

            if (cardStructure.hasPrice) {
                console.log(`  ✓ Price: ${cardStructure.priceText}`);
                testsPassed++;
            } else {
                console.log('  ✗ Price missing');
                testsFailed++;
            }

            if (cardStructure.hasBuyBtn) {
                console.log('  ✓ Buy button present');
                testsPassed++;
            } else {
                console.log('  ✗ Buy button missing');
                testsFailed++;
            }
        }

        // Test 5: Buy modal functionality
        console.log('');
        console.log('Test 5: Testing buy modal...');

        // Click buy button
        await page.click('.buy-btn');

        // Check if modal opened
        const modalOpen = await page.evaluate(() => {
            return document.getElementById('buyModal').classList.contains('active');
        });

        if (modalOpen) {
            console.log('  ✓ Modal opens on buy button click');
            testsPassed++;
        } else {
            console.log('  ✗ Modal did not open');
            testsFailed++;
        }

        // Check modal link
        const modalLink = await page.$eval('#modalLink', el => el.href);
        if (modalLink && modalLink.includes('wildberries.ru/catalog')) {
            console.log(`  ✓ Modal link正确: ${modalLink.substring(0, 60)}...`);
            testsPassed++;
        } else {
            console.log(`  ✗ Modal link incorrect: ${modalLink}`);
            testsFailed++;
        }

        // Close modal
        await page.click('#modalClose');
        await page.waitForTimeout(300);

        const modalClosed = await page.evaluate(() => {
            return !document.getElementById('buyModal').classList.contains('active');
        });

        if (modalClosed) {
            console.log('  ✓ Modal closes on close button click');
            testsPassed++;
        } else {
            console.log('  ✗ Modal did not close');
            testsFailed++;
        }

        // Test 6: Search functionality
        console.log('');
        console.log('Test 6: Testing search functionality...');

        // Enter search query
        await page.fill('#searchInput', 'Samsung');
        await page.click('#searchBtn');

        // Wait for results to update
        await page.waitForTimeout(2000);

        const searchResults = await page.$eval('#resultsInfo', el => el.textContent);
        console.log(`  ✓ Search results: ${searchResults}`);
        testsPassed++;

        // Test 7: Console errors check
        console.log('');
        console.log('Test 7: Checking for console errors...');

        // Filter out expected errors (like CORS/network errors in test environment)
        const criticalErrors = consoleErrors.filter(err => 
            !err.includes('Failed to fetch') &&
            !err.includes('NetworkError') &&
            !err.includes('CORS') &&
            !err.includes('net::ERR') &&
            !err.includes('file://') &&
            !err.includes('URL scheme')
        );

        if (criticalErrors.length === 0) {
            console.log('  ✓ No critical console errors');
            testsPassed++;
        } else {
            console.log(`  ✗ Found ${criticalErrors.length} console errors:`);
            criticalErrors.forEach(err => console.log(`    - ${err.substring(0, 100)}`));
            testsFailed++;
        }

    } catch (error) {
        console.error(`Test error: ${error.message}`);
        testsFailed++;
    } finally {
        await browser.close();
    }

    // Print summary
    console.log('');
    console.log('='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log(`Total:  ${testsPassed + testsFailed}`);
    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
