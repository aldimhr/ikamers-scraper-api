const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const productRouter = require('./routing/product');

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
   res.json({
      info: 'API for scraping',
      endpoint: {
         shopee: {
            '/v1/shopee/product?url=<URL>': 'Scrape by product',
         },
      },
   });
});

app.use(productRouter);

app.listen(port, () => {
   console.log(`server running on http://localhost:${port}`);
});
