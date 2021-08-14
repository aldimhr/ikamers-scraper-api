const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const productRouter = require('./routing/product');

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(productRouter);

app.get('/*', (req, res) => {
   res.json({
      path: {
         shopee: {
            '/api/v1/shopee/product?url=<URL>': 'Scrape product',
         },
      },
   });
});

app.listen(port, () => {
   console.log(`server running on http://localhost:${port}`);
});
