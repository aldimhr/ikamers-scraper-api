const express = require('express');
const router = express.Router();
const productController = require('../controller/Product');

router.get('/v1/shopee/product', productController.scrape);

module.exports = router;
