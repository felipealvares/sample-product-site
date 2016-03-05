var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Product = new Schema({
	name: String,
	title: String,
	category: String,
	price: String,
	price_discount: String,
	//tags: [{ tag: String }],
	//images: [{ image: String }],
	description_short: String,
	description_full: String,
	//views_number: Number,
});

mongoose.model('products', Product);

mongoose.connect('mongodb://localhost/db-cosmeticos');

