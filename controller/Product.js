const { getShopeeProduct } = require('../scrape/shopee/product');

module.exports = {
   async scrape(req, res) {
      const { url } = req.query;
      await getShopeeProduct(url.replace(/['"]+/g, ''), res);
   },
};
