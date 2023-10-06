const express = require('express');
const  payment = require('../../controller/user/payment')
const plans = require("../../controller/user/plans")
const user = require("../../controller/user/user")


const paymentRouter = express();

//customer
paymentRouter.post('/createPayment', payment.createPayment),
// paymentRouter.get('/Get/AllPayment', payment.GetAllPayments)
// paymentRouter.get('/Get/PaymentsById/:id', payment.GetAllPaymentsById)
// paymentRouter.get('/Get/GetAllPaymentsByEmployerId/:id', payment.GetAllPaymentsByEmployerId)
// paymentRouter.delete('/delete/deletePayment/:id', payment.deletePayment)


module.exports = paymentRouter;