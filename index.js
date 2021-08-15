const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const productRouter = require('./routing/product');
const shopRouter = require('./routing/shop');

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
   res.json({
      path: {
         shopee: {
            '/api/v1/shopee/product?url=<URL>': 'Scrape product',
            '/api/v1/shopee/shop?url=<URL>': 'Scrape shop',
         },
      },
   });
});

app.use(productRouter);
app.use(shopRouter);

let server = app.listen(port, () => {
   console.log(`server running on http://localhost:${port}`);
});

server.timeout = 1000 * 60 * 10;
