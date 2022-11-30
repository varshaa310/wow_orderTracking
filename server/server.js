require("dotenv").config()
const express = require ('express');
const mongoose = require ('mongoose');
const Route = require ('./router/orderRoute')
const cron = require("node-cron");
const { deleteOrder , checkWebhooks } = require("./controller/orderController");
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.send('buyWOW ordering Tracking')
})

app.use('/order', Route )

cron.schedule('0 1 * * *', () => {
    console.log('Deleting at 1 AM');
    deleteOrder();
  });

//   cron.schedule('*/1 * * * *', () => {
//     console.log('Checking for webhooks');
//     checkWebhooks();
//   });  

//  cron.schedule('0 */6 * * *', () =>{
//     console.log("checking for webhooks every 6 hours")
//  })
mongoose.connect("mongodb://localhost:27017/" + process.env.DB)
.then(()=>{
    console.log("Database Connected")
})
.catch(() => {
    console.log("Database not connected !")
})


app.listen(3000 , (error) =>{
    if (!error) {
        console.log("Server is running  in at " ,process.env.PORT)
    }
    else {
        console.log("Error occured , server cannot start", error)
    }
})