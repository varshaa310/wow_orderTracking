"use strict";
const { tracking , orderWebhook ,getOrders, getAllOrders, deleteOrder, checkWebhooks}  = require ('../controller/orderController')
const { validatePhone} = require ('../helper/validator')
const { Router } = require("express");

const Route = Router();

Route.post('/tracking', validatePhone , tracking)

Route.post('/getOrders', getAllOrders )

Route.post('/orderCreate', orderWebhook)

Route.post('/orderUpdate', orderWebhook)

Route.post('/orderDelete', deleteOrder)

Route.post('/checkWebhooks',checkWebhooks)

module.exports = Route;