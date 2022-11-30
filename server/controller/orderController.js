const {Order} = require ('../model/orderModel')
const request = require('request-promise');
const Shopify = require('shopify-api-node');


var tracking = (req, res) => {
  console.log("-----------in order tracking--------------");
  var phone = Order.findOne({"orderDetails.shipping_address.phone" : req.body.phone} , async (err, result) => {
    if (result){
      console.log(result.orderDetails)
      // console.log (result)
      console.log("-----------result found--------------",result.orderDetails.cancel_reason)
      if (result.orderDetails.cancel_reason == null) {
    
          console.log(result.orderDetails.fulfillment_status)
          if (result.orderDetails.fulfillment_status == "fulfilled"){
              console.log("------------order is fulfilled----------")
              var result = await  getId(result.orderDetails, res)
              console.log("-------way bill and cp_id---------", result)
              var waybill = result.waybill
              var cp_id = result.cp_id
              request ({
                method : "GET",
                headers : {
                  "Content-type" : "application/json"
                },
                url : `https://api.clickpost.in/api/v2/track-order/?username=${process.env.USERNAME}&key=${process.env.API_KEY}&waybill=${waybill}&cp_id=${cp_id}`
              })
              .then((result) => {
               var details = JSON.parse(result)
               var result = details.result
               console.log(result)
               if (details.meta.status == 200){
                return res.json({
                  success: true,
                  message : result
             })
               }
               return res.send({
                success : "false",
                details : "INTERNAL SERVER ERROR"
               })
              })
              .catch ((err) => {
                console.log(err)
              })
            
            }
            else if (result.orderDetails.fulfillment_status == "partially fulfilled"){
            console.log("-------order is partially fulfilled----------");
              res.send({
                success : "false",
                message : "Order is partially fulfillied" })
            }
            
          else{
            res.send({
              success : "false",
              message : "Order is not fulfillied" })
          }
        } 
  
  else {
    res.send({
      success : "false",
      message : "Order is cancelled"
    })  
  }
}


 else{
      res.send({
        success : "false",
        message : "No order found on this phone number" })
    }

  
  })
}

const getId = (data,res) => {
  var orderId = data.name
  console.log(orderId)
  console.log("-------finding courier partner id---------")
  return request({
    method : "GET",
    url : `https://buywow.clickpost.in/api/v1/track-order?&order_id=${orderId}`,
    headers : {
      "Content-type" : "application/json"
    }
  })
  .then ((result) =>{
    var details = JSON.parse(result)
    var shipments = details.result.shipments
    var waybill = shipments[0].waybill
    var cp_id = shipments[0].config.cp_id
    console.log(waybill , cp_id)
    return ({"waybill" : waybill,
              "cp_id" :  cp_id})
  })

  .catch ((err) => {
    console.log(err)
    return (err)
  })
  
}


const orderStore = async(data, res) => {
  // console.log("orderData", data)
  var orderDetails = data.orderDetails
  var orderData =  await Order.findOneAndUpdate({"orderDetails.id" : data.orderId}, data.orderDetails , {new : true})
  .then(result => {
    console.log("updating the orders");
    console.log("----------------found the order------------")
    // console.log("updated order id" ,id);
    if (result == null){
      console.log("recent updated older order")
      console.log(orderDetails.id)
      Order.create({"orderDetails" : orderDetails})
      .then(result => {
        console.log("-----------------------------------------------storing order---------------------------------------------------------",result)
      })
      .catch (err => {
        console.log(err)
      })
    }
  
  })
  .catch(error => {
    console.log(error)
  });
}

const  getAllOrders = async  (res) => {
  console.log("--------get all orders------------");
  var AccessToken = process.env.ACCESS_TOKEN
  var since_id = 4767414255729
  console.log(AccessToken)
  console.log(since_id)

   request({
    method:"GET", 
    headers: {
      "X-Shopify-Access-Token": `${AccessToken}`
    },
    url: `https://buy-wow-health.myshopify.com/admin/api/2022-04/orders.json?since_id=4698841317489`
    }).then(async function (result) {
    console.log("--------fetching All Orders--------");
    var detail = JSON.parse(result)
    var orders = detail.orders
    // console.log(orders)
    var orderLength = orders.length
    console.log("-----------length----------------------",orderLength)
    for(i=0 ; i<orderLength; i++){
      var orderData = {
        orderId :orders[i].id,
        orderDetails : orders[i]
      }
      
    
      var result = await orderStore(orderData,res)
      var orderId = orders[orderLength-1].id
      console.log("---------------------------------order id--------------------------------", orderId)
      
    }
    var nextOrders = await getAllNextOrders(orderId, res)
    return ("orders saved to DB")


    }).catch( (err) => {
    console.log("error",err)
});  
}

const  getAllNextOrders = async  (data,res) => {
  console.log("--------get all orders------------");
  var AccessToken = process.env.ACCESS_TOKEN
  var orderId = data
   request({
    method:"GET", 
    headers: {
      "X-Shopify-Access-Token": `${AccessToken}`,
    },
    url: `https://buy-wow-health.myshopify.com/admin/api/2022-04/orders.json?since_id=${orderId}`
    }).then(async function (result) {
    console.log("--------fetching All Orders--------");
    var detail = JSON.parse(result)
    var orders = detail.orders
    console.log(orders)
    var orderLength = orders.length
    console.log("-----------length----------------------",orderLength)
    for(i=0 ; i<orderLength; i++){
      var orderData = {
        orderId :orders[i].id,
        orderDetails : orders[i]
      }
      
    
      var result = await orderStore(orderData,res)
      var orderId = orders[orderLength-1].id
      console.log("---------------------------------order id--------------------------------", orderId)
      
    }
    // if (orderId != 4763715403889 ){
      var nextOrders = await getAllNextOrders(orderId, res)
    // }
    // else{
      return ("orders saved to DB")

    // }

    }).catch( (err) => {
    console.log("error",err)
});  
}  

const orderWebhook= async(req, res) => {
  var details = { 
                  "orderId" : req.body.id,
                  "orderDetails" : req.body
                }
  orderStore(details, res)
  return res.sendStatus(200);
}


const deleteOrder = () => {
    var now = Date.now();
    console.log(now)
    var date = (new Date(now).toISOString())
    console.log("today",date)
    var today = new Date();
    var priorDate = new Date(new Date().setDate(today.getDate() - 30));
    console.log("30 days before" , priorDate)
    Order.deleteMany({"orderDetails.created_at":{$lt: `${priorDate}`}})
    .then(result => {
      console.log(result)
    })
    .catch(err => {
      console.log(err)
    })
}

var checkWebhooks = () => {

  let AccessToken = process.env.ACCESS_TOKEN;

  request({
    method:"GET", 
    headers: {
      "X-Shopify-Access-Token": `${AccessToken}`,
    },
    url: `https://${process.env.STORE}.myshopify.com/admin/api/${process.env.API_VERSION}/webhooks.json?`
    }).then(async function (result) {
    console.log("--------fetching webhooks--------")
    var result =JSON.parse(result)
    console.log("-------Available webhooks---------",result)
    console.log(result.webhooks.length)
    var webhooks = result.webhooks

    const check = webhooks.find((item)=>item.topic ==='orders/update')
    console.log("checking webhooks",check)
    if(check == undefined) {
      console.log("------order update webhook not found ----")
      request({
        method : "POST",
        headers: {
          "X-Shopify-Access-Token": `${AccessToken}`
        },
        data : {webhook:{"topic" :"orders/create",
                          "address": "https://2a11-43-224-156-234.ngrok.io/order/orderCreate"
                          }
               },

        url: "https://buy-wow-health.myshopify.com/admin/api/2022-10/webhooks.json"
      })
      .then((result)=> {
        console.log(result)
      })
      .catch((err) => {
        console.log(err)
      })

    }
    else{
      console.log("-------webhook working fine--------")
    }
    const check1 = webhooks.find((item)=>item.topic==='orders/create')
    console.log(check1)
    if (check1 == undefined) {
      console.log("---------order create webhook not found----------")
      return ({
        method : "GET",
        headers: {
          "X-Shopify-Access-Token": `${AccessToken}`
        },
        url : "https://buy-wow-health.myshopify.com/admin/api/2022-04/webhooks.json"
        
      })
      .then((result) => {
        console.log(result)
      })
      .catch((err) => {
        console.log(err
          
          )
      })
    }
    else{
      console.log("-------webhook working fine--------")
    }

    // var length = result.webhooks.length
    // var webhook;
    // if (result.webhooks.length < 5){
    //   console.log(webhooks.length)
    //   for (i=0 ; i<length ; i++){
    //     console.log(webhooks[i].topic)
        
    //   }
    // }
    }).catch( (err) => {
      console.log("error" ,err)
    });  
}

module.exports = {
    tracking,
    deleteOrder,
    orderWebhook,
    checkWebhooks,
    getAllOrders,
}