# Ikamers Scraper API

Get product and shop details

## API Reference

##### Get product details

```http
  GET /api/v1/shopee/product?url=<URL>
```

##### Get shop details

```http
  GET /api/v1/shopee/shop?url=<URL>
```

| Parameter | Type     | Description  |
| :-------- | :------- | :----------- |
| `URL`     | `string` | **Required** |

## Usage

1. clone

   ```bash
   git clone https://github.com/aldimhr/ikamers-scraper-api.git
   ```

2. Install dependencies `npm install`
3. `npm start` to run local dev

## Roadmap

-  [x] Add shopee shop scraper
-  [ ] Add tokopedia product scraper
-  [ ] Add tokopedia shop scraper
-  [ ] Add other e-commerce scraper

## License

[MIT](https://choosealicense.com/licenses/mit/)
