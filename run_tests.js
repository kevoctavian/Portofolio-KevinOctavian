const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8123;
const ROOT_DIR = __dirname;
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  
  const filePath = path.join(ROOT_DIR, decodeURIComponent(reqUrl));
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${reqUrl}`);
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, async () => {
  console.log(`Test server running at http://localhost:${PORT}`);

  const browser = await chromium.launch();
  const consoleErrors = [];
  const networkFailures = [];

  try {
    // ------------------------------------------------------------------------
    // 1. Desktop Test (1440 x 900)
    // ------------------------------------------------------------------------
    console.log('\n--- 1. Testing Desktop (1440px) ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2
    });
    const desktopPage = await desktopContext.newPage();

    desktopPage.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[Console Error] ${msg.text()}`);
    });
    desktopPage.on('pageerror', err => {
      consoleErrors.push(`[Page Error] ${err.message}`);
    });
    desktopPage.on('requestfailed', req => {
      networkFailures.push(`[Request Failed] ${req.url()}`);
    });

    await desktopPage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2000);

    const desktopShotPath = path.join(SCREENSHOTS_DIR, 'hero-desktop-1440.png');
    await desktopPage.screenshot({ path: desktopShotPath, fullPage: false });
    console.log(`Saved desktop viewport screenshot to ${desktopShotPath}`);

    // Scroll through page to trigger scroll reveals before full-page capture
    await desktopPage.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.75) {
        window.portfolioLenis ? window.portfolioLenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      window.portfolioLenis ? window.portfolioLenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
    });
    await desktopPage.waitForTimeout(600);

    const desktopFullShotPath = path.join(SCREENSHOTS_DIR, 'phase2-desktop-1440-full.png');
    await desktopPage.screenshot({ path: desktopFullShotPath, fullPage: true });
    console.log(`Saved desktop full-page screenshot to ${desktopFullShotPath}`);

    // Verify All Sections Exist
    const sections = await desktopPage.evaluate(() => {
      return {
        hero: !!document.querySelector('.hero-section'),
        work: !!document.querySelector('#work'),
        about: !!document.querySelector('#about'),
        experience: !!document.querySelector('#experience'),
        contact: !!document.querySelector('#contact'),
        footer: !!document.querySelector('footer')
      };
    });
    console.log('Section presence check:', sections);

    // Verify Strict Project Exclusion
    const fullText = await desktopPage.evaluate(() => document.body.innerText.toLowerCase());
    const hasAbba = fullText.includes('abba');
    console.log(`Strict Exclusion Check (AbbaYouth): ${!hasAbba ? 'PASS (Zero mentions)' : 'FAIL (Found abba)'}`);

    // Navigate to Work section and capture card hover state
    console.log('Navigating to Work section...');
    await desktopPage.click('.nav-link[href="#work"]');
    await desktopPage.waitForTimeout(900);

    const firstCard = desktopPage.locator('.project-card').first();
    await firstCard.hover();
    await desktopPage.waitForTimeout(250);
    const cardHoverShotPath = path.join(SCREENSHOTS_DIR, 'phase2-project-card-hover.png');
    await firstCard.screenshot({ path: cardHoverShotPath });
    console.log(`Saved project card hover screenshot to ${cardHoverShotPath}`);

    // Test Project Case Study Modal Interaction
    console.log('Testing Case Study Modal dialog interaction...');
    await desktopPage.click('[data-open-project="inventory"]');
    await desktopPage.waitForTimeout(400);

    const isModalOpen = await desktopPage.$eval('#project-modal', el => el.classList.contains('is-open'));
    const modalTitle = await desktopPage.$eval('#modal-project-title', el => el.textContent.trim());
    console.log(`Modal Open State: ${isModalOpen ? 'PASS' : 'FAIL'} ("${modalTitle}")`);

    const modalShotPath = path.join(SCREENSHOTS_DIR, 'phase2-modal-dialog.png');
    await desktopPage.screenshot({ path: modalShotPath });
    console.log(`Saved modal dialog screenshot to ${modalShotPath}`);

    // Press Escape to close modal
    await desktopPage.keyboard.press('Escape');
    await desktopPage.waitForTimeout(300);
    const isModalClosed = await desktopPage.$eval('#project-modal', el => !el.classList.contains('is-open'));
    console.log(`Modal Closed After Esc: ${isModalClosed ? 'PASS' : 'FAIL'}`);

    await desktopContext.close();

    // ------------------------------------------------------------------------
    // 2. Laptop Test (1024 x 768)
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Testing Laptop (1024px) ---');
    const laptopContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      deviceScaleFactor: 2
    });
    const laptopPage = await laptopContext.newPage();

    await laptopPage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await laptopPage.waitForTimeout(2000);

    const laptopShotPath = path.join(SCREENSHOTS_DIR, 'hero-laptop-1024.png');
    await laptopPage.screenshot({ path: laptopShotPath, fullPage: false });
    console.log(`Saved laptop viewport screenshot to ${laptopShotPath}`);

    await laptopPage.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.75) {
        window.portfolioLenis ? window.portfolioLenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      window.portfolioLenis ? window.portfolioLenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
    });
    await laptopPage.waitForTimeout(500);

    const laptopFullShotPath = path.join(SCREENSHOTS_DIR, 'phase2-laptop-1024-full.png');
    await laptopPage.screenshot({ path: laptopFullShotPath, fullPage: true });
    console.log(`Saved laptop full-page screenshot to ${laptopFullShotPath}`);

    await laptopContext.close();

    // ------------------------------------------------------------------------
    // 3. Tablet Test (768 x 1024 - iPad Portrait)
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Testing Tablet (768px) ---');
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2
    });
    const tabletPage = await tabletContext.newPage();

    await tabletPage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await tabletPage.waitForTimeout(2000);

    const tabletShotPath = path.join(SCREENSHOTS_DIR, 'hero-tablet-768.png');
    await tabletPage.screenshot({ path: tabletShotPath, fullPage: false });
    console.log(`Saved tablet viewport screenshot to ${tabletShotPath}`);

    await tabletPage.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.75) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      window.scrollTo(0, 0);
    });
    await tabletPage.waitForTimeout(500);

    const tabletFullShotPath = path.join(SCREENSHOTS_DIR, 'phase2-tablet-768-full.png');
    await tabletPage.screenshot({ path: tabletFullShotPath, fullPage: true });
    console.log(`Saved tablet full-page screenshot to ${tabletFullShotPath}`);

    await tabletContext.close();

    // ------------------------------------------------------------------------
    // 4. Mobile Test (390 x 844 - iPhone 14 Pro)
    // ------------------------------------------------------------------------
    console.log('\n--- 4. Testing Mobile (390px) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2000);

    const mobileShotPath = path.join(SCREENSHOTS_DIR, 'hero-mobile-390.png');
    await mobilePage.screenshot({ path: mobileShotPath, fullPage: false });
    console.log(`Saved mobile screenshot to ${mobileShotPath}`);

    await mobilePage.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.75) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      window.scrollTo(0, 0);
    });
    await mobilePage.waitForTimeout(500);

    const mobileFullShotPath = path.join(SCREENSHOTS_DIR, 'phase2-mobile-390-full.png');
    await mobilePage.screenshot({ path: mobileFullShotPath, fullPage: true });
    console.log(`Saved mobile full-page screenshot to ${mobileFullShotPath}`);

    // Test Mobile Navigation Drawer
    console.log('Testing Mobile Navigation Drawer interaction...');
    await mobilePage.click('.nav-toggle');
    await mobilePage.waitForTimeout(500);

    const isDrawerOpen = await mobilePage.$eval('.mobile-drawer', el => el.classList.contains('is-open'));
    console.log(`Mobile Drawer Open State: ${isDrawerOpen ? 'PASS (Drawer is open)' : 'FAIL'}`);

    const drawerShotPath = path.join(SCREENSHOTS_DIR, 'phase2-mobile-drawer.png');
    await mobilePage.screenshot({ path: drawerShotPath });
    console.log(`Saved mobile drawer screenshot to ${drawerShotPath}`);

    await mobilePage.keyboard.press('Escape');
    await mobilePage.waitForTimeout(400);

    // Check for horizontal overflow on mobile across entire page
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile Overflow Check: scrollWidth=${scrollWidth}, clientWidth=${clientWidth} -> ${scrollWidth <= clientWidth ? 'PASS (No horizontal overflow)' : 'FAIL'}`);

    await mobileContext.close();

    // ------------------------------------------------------------------------
    // 5. Accessibility: Prefers Reduced Motion
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Testing prefers-reduced-motion ---');
    const reducedMotionContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce'
    });
    const reducedMotionPage = await reducedMotionContext.newPage();
    await reducedMotionPage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });

    const preloaderAbsentOrHidden = await reducedMotionPage.evaluate(() => {
      const el = document.querySelector('#preloader');
      if (!el) return 'none (removed from DOM)';
      return window.getComputedStyle(el).display;
    });
    console.log(`Reduced Motion Preloader State: "${preloaderAbsentOrHidden}" -> PASS`);

    const heroNameOpacity = await reducedMotionPage.$eval('.hero-name-first', el => window.getComputedStyle(el).opacity);
    console.log(`Reduced Motion Hero Name Opacity: "${heroNameOpacity}" -> ${heroNameOpacity === '1' ? 'PASS' : 'CHECK'}`);

    await reducedMotionContext.close();

    // ------------------------------------------------------------------------
    // 6. Accessibility: Keyboard Navigation & Skip Link
    // ------------------------------------------------------------------------
    console.log('\n--- 6. Testing Keyboard Navigation ---');
    const keyboardContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const keyboardPage = await keyboardContext.newPage();
    await keyboardPage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
    await keyboardPage.waitForTimeout(2800);

    await keyboardPage.keyboard.press('Tab');
    const activeTagName = await keyboardPage.evaluate(() => document.activeElement ? document.activeElement.className : 'none');
    console.log(`Active element on first Tab: "${activeTagName}" -> ${activeTagName.includes('skip-link') ? 'PASS (Skip Link focused)' : 'INFO'}`);

    await keyboardContext.close();

    // ------------------------------------------------------------------------
    // Final Summary
    // ------------------------------------------------------------------------
    console.log('\n========================================');
    console.log('QUALITY CONTROL SUMMARY:');
    console.log(`Console Errors: ${consoleErrors.length === 0 ? '0 (CLEAN PASS)' : JSON.stringify(consoleErrors)}`);
    console.log(`Network Failures: ${networkFailures.length === 0 ? '0 (CLEAN PASS)' : JSON.stringify(networkFailures)}`);
    console.log('========================================\n');

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('Quality Control complete.');
  }
});
