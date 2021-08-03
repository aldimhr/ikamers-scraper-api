const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const productRouter = require('./routing/product');
const puppeteer = require('puppeteer');

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
   res.json({
      info: 'API for scraping',
      endpoint: {
         '/v1/shopee/product?url=""': 'Scrape by product',
      },
   });
});

app.use(productRouter);

app.listen(port, () => {
   console.log(`server running on http://localhost:${port}`);
});
