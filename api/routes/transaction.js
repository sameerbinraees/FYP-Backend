const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction')
const Customer = require('../models/customer')
const Vendor = require('../models/vendor')
const { JWT_KEY } = require('../../keys')
const requireToken = require('../middleware/requireToken')

router.get("/", async (req, res, next) => {
    const id = req.params.id;
    try {
        await Transaction.find()
            //populating both customer's and vendor's email (name) to show on frontend
            .populate('customerID vendorID', 'email')  
            .exec()
            .then(result => {
                const response = {
                    count: result.length,
                    Transaction: result.map(doc => {
                        return {
                            id: doc._id,
                            amount: doc.amount,
                            customerID: doc.customerID,
                            vendorID: doc.vendorID,
                            createdAt: doc.createdAt,
                        }
                    })
                }
                //console.log(response)
                res.status(200).json(response)
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }

});

router.get("/customer/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
        await Transaction.find({ customerID: id })
            .populate('customerID vendorID', 'email')
            .exec()
            .then(result => {
                const response = {
                    count: result.length,
                    Transaction: result.map(doc => {
                        return {
                            id: doc._id,
                            amount: doc.amount,
                            customerID: doc.customerID,
                            vendorID: doc.vendorID,
                            createdAt: doc.createdAt
                        }
                    })
                }
                //console.log(response)
                res.status(200).json(response)
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }

});

router.get("/vendor/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
        await Transaction.find({ vendorID: id })
            .populate('customerID vendorID', 'email')
            .exec()
            .then(result => {
                const response = {
                    count: result.length,
                    Transaction: result.map(doc => {
                        return {
                            id: doc._id,
                            amount: doc.amount,
                            customerID: doc.customerID,
                            vendorID: doc.vendorID,
                            createdAt: doc.createdAt
                        }
                    })
                }
                //console.log(response)
                res.status(200).json(response)
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }

});

router.post("/", async (req, res, next) => {
    try {
        await Customer.findById({ _id: req.body.customerID })   //checking if customer exists
            .then(customer => {
                console.log(customer)
                if (!customer)
                    return res.status(404).json({ error: "Not a valid customer" }) //if not send error msg
                else {
                    Vendor.findById({ _id: req.body.vendorID }) //checking if vendor exists
                        .then(vendor => {
                            if (!vendor)
                                return res.status(404).json({ error: "Not a valid vendor" }) //if not send error msg
                            else {
                                const transaction = new Transaction({
                                    _id: new mongoose.Types.ObjectId(),
                                    amount: req.body.amount,
                                    customerID: req.body.customerID,
                                    vendorID: req.body.vendorID,
                                });
                                return transaction.save()
                                    .then(result => {
                                        //console.log(result);
                                        res.status(201).json({ result });
                                    })

                                    .catch(error => {
                                        console.log(error)
                                        res.status(500).json({ error })
                                    })
                            }
                        }).catch(error => {
                            res.status(500).json({ error })
                        })
                }
            }).catch(error => {
                res.status(500).json({ error })
            });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error123: err })
    }
});

router.delete("/:id", async (req, res, next) => {
    const id = req.params.id;

    try {
        await Transaction.remove({ _id: id })
            .then(result => {
                console.log(result)
                res.status(200).json({ message: "Transaction Deleted" })
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
});
module.exports = router;