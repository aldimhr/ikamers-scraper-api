const express = require('express');

const router = express.Router();
const shopController = require('../controller/Shop');

router.get('/api/v1/shopee/shop', shopController.scrape);

module.exports = router;
