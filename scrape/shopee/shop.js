'use strict';
const express = require('express');
const app = express();

const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');

let ShopeeShop = async (url, res) => {
   // user agent
   const userAgent = new UserAgent({
      deviceCategory: 'desktop',
      platform: 'Linux x86_64',
   });

   // puppeteer config
   let browser = await puppeteer.launch({
      defaultViewport: null,
      // headless: false,
      headless: true,
      // slowMo: 250,
      args: [
         '--user-agent=' + userAgent + '',
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

   // shop
   let shop;

   try {
      // wait browser
      const [page] = await browser.pages();

      // get response body
      page.on('response', (response) => {
         if (response.url().includes('get_shop_info?shopid=')) {
            response.text().then(function (textBody) {
               shop = textBody;
            });
         }
      });

      // goto url
      await page.goto(url);

      // wait
      await page.waitForXPath("//span[contains(text(), 'Semua Produk')]");

      // check if cannot get response data
      if (shop == null || shop == undefined) {
         console.log('S - cannot get response data, refresh page');
         await page.reload();
         await page.waitForXPath("//span[contains(text(), 'Semua Produk')]");
      }

      // parse body response
      let shopdata = await JSON.parse(shop);
      let { name, shopid, place, is_shopee_verified, item_count, rating_star, follower_count, rating_bad, rating_good, rating_normal, shop_location } = shopdata.data;

      let shopInfo = {
         name,
         shopid,
         place,
         shop_location,
         is_shopee_verified,
         total_product: item_count,
         rating: rating_star,
         followers: follower_count,
         rating: {
            bad: rating_bad,
            good: rating_good,
            normal: rating_normal,
         },
         products: [],
      };

      // CLICK 'SEMUA PRODUK'
      const [semuaproduk] = await page.$x('//span[contains(text(), "Semua Produk")]');
      await semuaproduk.click();

      // WAIT
      await page.waitForXPath("//div[contains(text(), 'Populer')]");

      await autoScroll(page);

      // GET TOTAL PAGES
      let pages = await page.$eval('.shopee-mini-page-controller__total', (el) => el.innerText);

      if (pages > 1) {
         for (let i = 1; i < pages; i++) {
            // GET ALL LINK PRODUCTS
            let hrefs = await page.evaluate(() => {
               const links = Array.from(document.querySelectorAll('a[data-sqe="link"]'));
               return links.map((link) => link.href);
            });

            //  PUSH TO PRODUCTS
            shopInfo.products.push(hrefs);

            // CLICK NEXT PAGE
            const [nextpage] = await page.$x(`//button[contains(text(), "${i + 1}")]`);
            await nextpage.click();

            // SCROLL
            await autoScroll(page);
         }
      } else {
         // GET ALL LINK PRODUCTS
         let hrefs = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[data-sqe="link"]'));
            return links.map((link) => link.href);
         });

         //  PUSH TO PRODUCTS
         shopInfo.products.push(hrefs);
      }

      shopInfo.products = [].concat.apply([], shopInfo.products);

      // send response
      res.json({ status: 1, message: 'success', data: shopInfo });
   } catch (err) {
      // send response
      res.json({ status: 0, message: 'error', data: { message: err } });
   } finally {
      // close browser
      await browser.close();
      return;
   }
};

// auto scroll
async function autoScroll(page) {
   await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
         var totalHeight = 0;
         var distance = 100;
         var timer = setInterval(() => {
            var scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
               clearInterval(timer);
               resolve();
            }
         }, 150);
      });
   });
}

// let url = 'https://shopee.co.id/qtakasimura?categoryId=100011&itemId=3892481906';
// ShopeeShop(url);
module.exports = { ShopeeShop };
