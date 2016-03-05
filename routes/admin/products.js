var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();
var Product = mongoose.model('products');


router.get('/', function(req, res) {
  Product.find(function(err, products){
	res.render(
	  'admin/products',
	  {title : 'Product API', products : products}
	);
  });
});

router.post('/save', function(req, res) {
	var product = {
		name : req.body.name, 
		title: req.body.title,
		category: req.body.category,
		price: req.body.price,
		price_discount: req.body.price_discount,
		//tags: req.body.tags,
		//images: req.body.images,
		description_short: req.body.description_short,
		description_full: req.body.description_full,
		//views_number: req.body.views_number,
	};

	new Product(product).save(function(err, product) {
		res.redirect('/admin/products');
	});
});

module.exports = router;