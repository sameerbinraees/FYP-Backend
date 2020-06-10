const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction')
const Customer = require('../models/customer')
const Vendor = require('../models/vendor')
const { JWT_KEY, accountSid, authToken } = require('../../keys')
const requireToken = require('../middleware/requireToken')

const client = require('twilio')(accountSid, authToken);


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

router.get("/customer/:id", paginatedResults(Customer), async (req, res, next) => {
    /*const id = req.params.id;
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
    }*/

    res.json(res.paginatedResults)


});

router.get("/vendor/:id", paginatedResults(Vendor), async (req, res, next) => {
    /*const id = req.params.id;
    try {
        await Transaction.find({ vendorID: id })
            .populate('customerID vendorID', 'name')
            .exec()
            .then(result => {
                const response = {
                    count: result.length,
                    Transaction: result.map(doc => {
                        return {
                            id: doc._id,
                            amount: doc.amount,
                            customer: doc.customerID,
                            vendor: doc.vendorID,
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
    }*/
    res.json(res.paginatedResults)

});

router.post("/", async (req, res, next) => {
    try {
        await Customer.findById({ _id: req.body.customerID })   //checking if customer exists
            .then(customer => {
                //console.log(customer)
                if (!customer)
                    return res.status(404).json({ Error: "Not a valid customer" }) //if not send error msg
                else {
                    Vendor.findById({ _id: req.body.vendorID }) //checking if vendor exists
                        .then(vendor => {
                            if (!vendor)
                                return res.status(404).json({ Error: "Not a valid vendor" }) //if not send error msg
                            else {
                                const number = req.body.number
                                const amount = req.body.amount
                                //console.log(number)
                                const transaction = new Transaction({
                                    _id: new mongoose.Types.ObjectId(),
                                    amount: req.body.amount,
                                    customerID: req.body.customerID,
                                    vendorID: req.body.vendorID,
                                });
                                //console.log(`The transaction of ammount ${amount} has been recorded successfully.`);
                                //console.log('+92' + number)
                                return transaction.save()
                                    .then(result => {
                                        console.log(result);
                                        client.messages.create({
                                            body: `The transaction of amount ${amount} has been recorded successfully.`,
                                            from: '+12015797091',
                                            to: '+92' + number
                                        }).then((message) => {
                                            //console.log(message.sid)
                                            res.status(201).json({ result });
                                        }).catch(Error => {
                                            res.status(500).json({ Error })
                                        })
                                    })

                                    .catch(Error => {
                                        console.log(Error)
                                        res.status(500).json({ Error })
                                    })
                            }
                        }).catch(Error => {
                            res.status(500).json({ Error })
                        })
                }
            }).catch(Error => {
                res.status(500).json({ Error })
            });
    } catch (err) {
        console.log(err)
        res.status(500).json({ Error: err })
    }
});


router.delete("/:id", async (req, res, next) => {
    const id = req.params.id;

    try {
        await Transaction.remove({ _id: id })
            .then(result => {
                //console.log(result)
                res.status(200).json({ message: "Transaction Deleted" })
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
});



function paginatedResults(model) {
    return async (req, res, next) => {
        const id = req.params.id;
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        if (model === Vendor) {

            if (endIndex < await Transaction.find({ vendorID: id }).countDocuments().exec()) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }
            try {

                await Transaction.find({ vendorID: id }).limit(limit).sort('-createdAt').skip(startIndex)
                    .populate('customerID vendorID', 'name')
                    .exec()
                    .then(result => {
                        results.result = {
                            count: result.length,
                            Transaction: result.map(doc => {
                                return {
                                    id: doc._id,
                                    amount: doc.amount,
                                    customer: doc.customerID,
                                    vendor: doc.vendorID,
                                    createdAt: doc.createdAt
                                }
                            })
                        }
                        //console.log(response)
                        res.paginatedResults = results
                        //res.status(200).json(response)
                    })

                next()
            } catch (e) {
                res.status(500).json({ message: e.message })
            }
        }

        else if (model === Customer) {

            if (endIndex < await Transaction.find({ customerID: id }).countDocuments().exec()) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }
            try {

                await Transaction.find({ customerID: id }).sort('-createdAt').limit(limit).skip(startIndex)
                    .populate('customerID vendorID', 'name')
                    .exec()
                    .then(result => {
                        results.result = {
                            count: result.length,
                            Transaction: result.map(doc => {
                                return {
                                    id: doc._id,
                                    amount: doc.amount,
                                    customer: doc.customerID,
                                    vendor: doc.vendorID,
                                    createdAt: doc.createdAt
                                }
                            })
                        }
                        //console.log(results)
                        res.paginatedResults = results
                        //res.status(200).json(response)
                    })

                next()
            } catch (e) {
                res.status(500).json({ message: e.message })
            }
        }
    }
}

module.exports = router;