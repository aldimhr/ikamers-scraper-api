const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');

const getShopeeProduct = async (url, res) => {
  // user agent
  const userAgent = new UserAgent({
    deviceCategory: 'desktop',
    platform: 'Linux x86_64',
  });

  // puppeteer config
  const browser = await puppeteer.launch({
    defaultViewport: null,
    // headless: false,
    headless: true,
    // slowMo: 250,
    args: [
      `--user-agent=${userAgent}`,
      '--start-maximized',
      '--headless',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',

      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--incognito',
      '--single-process',
    ],
  });

  // item
  let item;

  try {
    // wait browser
    const [page] = await browser.pages();

    // get response body
    page.on('response', (response) => {
      if (response.url().includes('get?itemid=')) {
        response.text().then((textBody) => {
          item = textBody;
        });
      }
    });

    // goto url
    await page.goto(url);

    // wait
    await page.waitForXPath("//a[contains(text(), 'kunjungi toko')]");

    // check if cannot get response data
    if (item == null || item === undefined) {
      console.log('S - cannot get response data, refresh page');
      await page.reload();
      await page.waitForXPath("//a[contains(text(), 'kunjungi toko')]");
    }

    // parse body response
    const dataRes = (await JSON.parse(item)).data;

    // send response
    res.json({ status: 1, message: 'success', data: filterRes(dataRes) });
  } catch (err) {
    // send response
    res.json({ status: 0, message: 'error', data: { message: err.message } });
  } finally {
    // close browser
    await browser.close();
    return;
  }
};

// filter data response
function filterRes({
  name, models, description, images, categories,
}) {
  // filter images
  const img = images.map((image) => `https://cf.shopee.co.id/file/${image}`);

  // filter models
  const variants = [];
  models.forEach((el) => {
    let splitName;
    if (el.name.indexOf(',') > -1) {
      splitName = el.name.split(',');
      variants.push({
        name: splitName[0],
        name2: splitName[1],
        stock: el.stock,
        status: el.status,
        price: el.price / 100000,
      });
    } else {
      variants.push({
        name: el.name,
        stock: el.stock,
        status: el.status,
        price: el.price / 100000,
      });
    }
  });

  // categories
  const category = categories.map((el) => el.display_name).join(' - ');

  return {
    name,
    variants,
    description,
    images: img,
    category,
  };
}

// let url = 'https://shopee.co.id/Buket-Bunga-Hias-Plastik-Bunga-Mawar-MINI-Tanaman-Artificial-Buket-wisuda-Bunga-wisuda-i.93886339.5375016637';

// getShopeeProduct(url);
module.exports = { getShopeeProduct };
