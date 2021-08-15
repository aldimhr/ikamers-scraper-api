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
      // defaultViewport: null,
      // headless: false,
      headless: true,
      // slowMo: 50,
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
   let product;

   try {
      // wait browser
      const [page] = await browser.pages();

      await page.setRequestInterception(true);
      page.on('request', async (request) => {
         if (request.resourceType() == 'image') {
            await request.abort();
         } else {
            await request.continue();
         }
      });

      // get response body
      page.on('response', async (response) => {
         if (response.url().includes('get_shop_detail?username')) {
            try {
               await response.text().then(function (textBody) {
                  shop = textBody;
               });
            } catch (err) {
               console.log(err);
            }
         }
         if (response.url().includes('search_items?by=pop') && response.url().includes('newest=0') && !response.url().includes('only_soldout')) {
            try {
               await response.text().then(function (textBody) {
                  product = textBody;
               });
            } catch (err) {
               console.log(err);
            }
         }
      });

      // goto url
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // WAIT RESPONSE
      await page.waitForResponse((response) => {
         return response.url().includes('get_shop_detail?username');
      });
      await page.waitForResponse((response) => {
         return response.url().includes('search_items?by=pop') && response.url().includes('newest=0') && !response.url().includes('only_soldout');
      });

      // WAIT SELECTOR
      await page.waitForSelector('.shop-search-result-view');

      // parse body response
      let {
         name,
         shopid,
         userid,
         place,
         is_shopee_verified,
         rating_bad,
         rating_good,
         rating_normal,
         description,
         cancellation_rate,
         item_count,
         follower_count,
         account: { following_count },
         rating_star,
         shop_location,
      } = (await JSON.parse(shop)).data;

      let shopInfo = {
         name,
         shopid,
         userid,
         place,
         shop_location,
         description,
         is_shopee_verified,
         cancellation_rate,
         total_product: item_count,
         rating: rating_star,
         followers: follower_count,
         following: following_count,
         rating: {
            bad: rating_bad,
            good: rating_good,
            normal: rating_normal,
         },
         products: [],
      };

      let shopproduct = (await JSON.parse(product)).items.map(({ item_basic: { itemid, name, images, stock, historical_sold: sold, liked_count: likes, view_count: views, price, item_rating } }) => ({
         link: `https://shopee.co.id/${name.split(' ')[0]}-i.${shopInfo.shopid}.${itemid}`,
         itemid,
         name,
         images: images.map((image) => 'https://cf.shopee.co.id/file/' + image),
         stock,
         sold,
         likes,
         views,
         price: price / 100000,
         item_rating,
      }));

      // GET TOTAL PAGES
      let pages = await page.$eval('.shopee-mini-page-controller__total', (el) => el.innerText);

      if (pages > 1) {
         for (let i = 1; i <= pages; i++) {
            if (i == 1) {
               shopInfo.products.push(shopproduct);
               continue;
            }
            // get response body
            page.on('response', async (response) => {
               if (response.url().includes('search_items?by=pop') && response.url().includes(`newest=${30 * (i - 1)}`) && !response.url().includes('only_soldout')) {
                  try {
                     await response.text().then(function (textBody) {
                        product = textBody;
                     });
                  } catch (err) {
                     console.log(err);
                  }
               }
            });

            // CLICK NEXT PAGE
            await page.click(
               '#main > div > div._193wCc > div > div.shop-page > div > div.container > div.shop-page__all-products-section > div.shop-all-product-view > div.shopee-sort-bar > div.shopee-mini-page-controller > button.shopee-button-outline.shopee-mini-page-controller__next-btn'
            );

            // FILTER RESPONSE BODY
            shopproduct = (await JSON.parse(product)).items.map(
               ({ item_basic: { itemid, name, images, stock, historical_sold: sold, liked_count: likes, view_count: views, price, item_rating } }) => ({
                  link: `https://shopee.co.id/${name.split(' ')[0]}-i.${shopInfo.shopid}.${itemid}`,
                  itemid,
                  name,
                  images: images.map((image) => 'https://cf.shopee.co.id/file/' + image),
                  stock,
                  sold,
                  likes,
                  views,
                  price: price / 100000,
                  item_rating,
               })
            );

            shopInfo.products.push(shopproduct);
         }
      } else {
         shopInfo.products.push(shopproduct);
      }

      shopInfo.products = [].concat.apply([], shopInfo.products);

      // send response
      res.json({ status: 1, message: 'success', data: shopInfo });
   } catch (err) {
      // send response
      res.json({ status: 0, message: 'error', data: { message: err.message } });
   } finally {
      // close browser
      await browser.close();
      return;
   }
};

// let url = 'https://shopee.co.id/onetrush_store?categoryId=100011&itemId=8979682687';
// let url = 'https://shopee.co.id/qtakasimura?categoryId=100017&itemId=8966368216';
// ShopeeShop(url);
module.exports = { ShopeeShop };
