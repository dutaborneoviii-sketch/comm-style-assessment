const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen for console events in the browser
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  
  await page.waitForSelector('input[name="npp"]');
  await page.type('input[name="npp"]', '10030');
  await page.type('input[name="password"]', '123456');
  
  await page.click('button[type="submit"]');
  
  try {
    await page.waitForNavigation({ timeout: 5000 });
  } catch (e) {
    console.log("Navigation timeout");
  }
  
  const content = await page.content();
  if (content.includes('Terjadi kesalahan')) {
    console.log("Found error text on page");
  } else if (content.includes('Kredensial tidak valid')) {
    console.log("Found invalid credentials text");
  } else {
    console.log("Login seems successful, url:", page.url());
  }
  
  await browser.close();
})();
