const productRoutes = require('./products');

module.exports = function(app, db) {
  productRoutes(app, db);
};
