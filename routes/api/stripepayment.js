var express = require('express');
var router = express.Router();
const stripe = require("stripe")("sk_test_51Jk1xaLniJHlv8HxZvQZnMdmn0gJpxc2xLv57BoxtuVtAzrocdLXyz5fIN9Lo5zJs5ftkEhCU9j4JQYVgPbrEVVw00UJYIecxm");
const calculateOrderAmount = items => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 50;
  };
router.post('/', async (req, res)=> { 
    const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    payment_method_types: [
      "card"
    ],
  });
  console.log("clientsecret",paymentIntent.client_secret);
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
module.exports = router;