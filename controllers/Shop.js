const { ShopeeShop } = require('../scrape/shopee/shop');

module.exports = {
  async scrape(req, res) {
    const { url } = req.query;
    await ShopeeShop(url.replace(/['"]+/g, ''), res);
  },
};
