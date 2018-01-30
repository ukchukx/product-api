Getting Started
---------------
```sh
# clone repo
git clone git@github.com:ukchukx/product-api.git
cd product-api

# Install dependencies
npm install

# Start development server
npm run dev
```


Product Schema
--------
```
{
	name,
	description,
	stock,
	cost,
	price,
	total_sales,
	total_cost,
	total_profit	
}
```
Endpoints
-------
```
GET http://localhost:<port>/api/products
POST http://localhost:<port>/api/products
GET http://localhost:<port>/api/products/<id>
PUT http://localhost:<port>/api/products/<id>
DELETE http://localhost:<port>/api/products/<id>
GET http://localhost:<port>/api/products/stats
```
Default currency is USD
To get results in a different currency, append 3-letter currency code to GET requests as a query param:
eg `GET http://localhost:<port>/api/products?currency=GBP`


License
-------

MIT
