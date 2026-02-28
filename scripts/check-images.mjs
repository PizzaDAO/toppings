import { chromium } from 'playwright';

const url = 'https://pizzadao.github.io/toppings/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Track failed image requests
  const failedImages = [];
  const loadedImages = [];

  page.on('response', (response) => {
    const reqUrl = response.url();
    if (reqUrl.match(/\.(webp|png|jpg|svg)$/)) {
      if (response.status() >= 400) {
        failedImages.push({ url: reqUrl, status: response.status() });
      } else {
        loadedImages.push({ url: reqUrl, status: response.status() });
      }
    }
  });

  console.log(`Loading: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for images to attempt loading
  await page.waitForTimeout(3000);

  // Get all img elements and their src
  const imgData = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      alt: img.alt,
      displayed: img.offsetWidth > 0 && img.offsetHeight > 0,
    }));
  });

  // Check for pizza emoji fallbacks (broken images)
  const fallbacks = await page.evaluate(() => {
    const els = document.querySelectorAll('div');
    let count = 0;
    els.forEach(el => {
      if (el.textContent?.trim() === '🍕' && el.children.length === 0) count++;
    });
    return count;
  });

  console.log(`\n=== Page: ${url} ===`);
  console.log(`Total <img> elements: ${imgData.length}`);
  console.log(`Images loaded (naturalWidth > 0): ${imgData.filter(i => i.naturalWidth > 0).length}`);
  console.log(`Images broken (naturalWidth === 0): ${imgData.filter(i => i.naturalWidth === 0).length}`);
  console.log(`Pizza emoji fallbacks: ${fallbacks}`);

  console.log(`\n=== Network: Image requests ===`);
  console.log(`Successful: ${loadedImages.length}`);
  console.log(`Failed: ${failedImages.length}`);

  if (failedImages.length > 0) {
    console.log(`\nFailed image URLs:`);
    failedImages.slice(0, 10).forEach(f => console.log(`  ${f.status} ${f.url}`));
  }

  if (loadedImages.length > 0) {
    console.log(`\nSample successful image URLs:`);
    loadedImages.slice(0, 5).forEach(f => console.log(`  ${f.status} ${f.url}`));
  }

  console.log(`\nSample <img> src attributes:`);
  imgData.slice(0, 10).forEach(i => console.log(`  src=${i.src} | ${i.naturalWidth}x${i.naturalHeight} | complete=${i.complete}`));

  // Take screenshot
  await page.screenshot({ path: 'scripts/screenshot-home.png', fullPage: false });
  console.log(`\nScreenshot saved to scripts/screenshot-home.png`);

  await browser.close();
})();
