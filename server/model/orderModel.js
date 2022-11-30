const mongoose = require('mongoose');
  Types = mongoose.Schema.Types;

const modelName = "Order";

const OrderSchema = new mongoose.Schema({},
  {strict:false }
);

Order = mongoose.model('Order', OrderSchema);
module.exports = { Order };
