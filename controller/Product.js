const { getShopeeData } = require('../scrape/shopee/product');

module.exports = {
   async scrape(req, res) {
      const { url } = req.query;
      await getShopeeData(url.replace(/['"]+/g, ''), res);
   },
};
