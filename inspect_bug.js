const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  await page.waitForSelector('.marquee-content');
  
  const data = await page.evaluate(() => {
    const tracks = document.querySelectorAll('.marquee-track');
    const result = [];
    for(let t of tracks) {
       const contents = t.querySelectorAll('.marquee-content');
       if(contents.length > 0) {
          const content = contents[0];
          const title = t.parentElement.querySelector('.marquee-row-title');
          result.push({
             title: title ? title.innerText : 'No Title',
             trackWidth: t.getBoundingClientRect().width,
             contentWidth: content.getBoundingClientRect().width,
             childCount: content.children.length,
             firstFewClasses: Array.from(content.children).slice(0, 5).map(c => c.className).join(', '),
             transform: window.getComputedStyle(content).transform
          });
       }
    }
    return result;
  });
  
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
