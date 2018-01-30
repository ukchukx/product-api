const ObjectID          = require('mongodb').ObjectID;
const fetch             = require('node-fetch');
const { accessKey }     = require('../../config');


const totalCostAndProfit = (product) => {
	const cost = Number(product.cost) || 0,
			price = Number(product.price) || 0,
			stock = Number(product.stock) || 0,
			total_cost = cost * stock,
			total_sales = price * stock,
			total_profit = (price - cost) * stock;

	return Object.assign(product, { total_profit, total_cost, total_sales });
}

const totalStats = (products) => {
	const total_products = products.length;
	const totals = 
		products
		.reduce((totals, { total_sales, total_cost, total_profit }) => {
			total_sales += totals.total_sales || 0;
			total_cost += totals.total_cost || 0;
			total_profit += totals.total_profit || 0;
			return { total_sales, total_cost, total_profit };
		}, {});

	return Object.assign(totals, { total_products });
}

const fetchCurrencyRate = (currency) =>
	fetch(`http://apilayer.net/api/live?access_key=${accessKey}&currencies=USD,${currency}&format=1`)
	.then((resp) => resp.json())
	.then(({ quotes }) => quotes[`USD${currency}`] || 1);

const convertAmounts = (product, multiplier) => {
	if (multiplier === 1) return product;

	product.cost = product.cost * multiplier;
	product.price = product.price * multiplier;
	product.total_cost = product.total_cost * multiplier;
	product.total_sales = product.total_sales * multiplier;
	product.total_profit = product.total_profit * multiplier;

	return product;
}


module.exports = (app, db) => {
	const base = '/api/products',
			collection = 'products';

	app.get(base, (req, res) => {
		const { currency = 'USD' } = req.query;

    db.collection(collection).find({}).toArray((err, results) => {
    	if (err) {
    		res.send({ 'error': 'An error has occurred' });
    	} else if (currency === 'USD') {
    		res.send(results);
    	} else {
    		fetchCurrencyRate(currency)
				.then((rate) => {
					results = results.map(product => convertAmounts(product, rate));
					res.send(results);	
				});
    	}
    });		
  });

	app.get(`${base}/stats`, (req, res) => {
		const { currency = 'USD' } = req.query;

    db.collection(collection).find({}).toArray((err, results) => {
    	if (err) {
    		res.send({ 'error': 'An error has occurred' });
    	} else if (currency === 'USD') {
    		res.send(results);
    	} else {
    		fetchCurrencyRate(currency)
				.then((rate) => {
					results = totalStats(results.map(product => convertAmounts(product, rate)));
					res.send(results);	
				});
    	}
    });
  });

  app.post(base, (req, res) => {
  	let { description, name, cost, price, stock } = req.body;

    let product = { 
    	description,
    	name, 
    	cost: Number(cost) || 0 ,
    	price: Number(price) || 0 ,
    	stock: Number(stock) || 0 
    };
    product = totalCostAndProfit(product);

    db.collection(collection).insert(product, (err, result) => {
    	const response = err ? { 'error': 'An error has occurred' } : result.ops[0];
      res.send(response);
    });
  });

  app.get(`${base}/:id`, (req, res) => {
		const { currency = 'USD' } = req.query;
    const id = req.params.id;
    
    db.collection(collection).findOne({ '_id': new ObjectID(id) }, (err, item) => {
    	if (err) {
    		res.send({ 'error': 'An error has occurred' });
    	} else if (currency === 'USD') {
    		res.send(item);
    	} else {
    		fetchCurrencyRate(currency)
				.then((rate) => {
					res.send(convertAmounts(item, rate));	
				});
    	}
    });
  });

  app.put(`${base}/:id`, (req, res) => {
    const { id } = req.params;
    let { description, name, cost, price, stock } = req.body;

    let product = { 
    	description,
    	name, 
    	cost: Number(cost) || 0,
    	price: Number(price) || 0,
    	stock: Number(stock) || 0 
    };
    product = totalCostAndProfit(product);

    db.collection(collection).findOneAndUpdate({ '_id': new ObjectID(id) }, product, (err, { value }) => {
      const response = err ? {'error':'An error has occurred'} : value;
      res.send(response);
    });
  });

  app.delete(`${base}/:id`, (req, res) => {
    const { id } = req.params;
    db.collection(collection).remove({ '_id': new ObjectID(id) }, (err, item) => {
    	const response = err ? {'error':'An error has occurred'} : {'deleted': true};
      res.send(response);
    });
  });
};
