const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer')
const { JWT_KEY } = require('../../keys')
const requireToken = require('../middleware/requireToken')

router.get('/token/', requireToken, (req, res) => {
    //console.log(req.user)
    res.status(200).json(req.user);
})

router.get("/", async (req, res, next) => {

    try {
        await Customer.find()
            .then(result => {
                const response = {
                    count: result.length,
                    customers: result.map(doc => {
                        return {
                            id: doc._id,
                            email: doc.email,
                            password: doc.password,
                            name: doc.name,
                            phone: doc.phone,
                            cnic: doc.cnic,
                        }
                    })
                }
                //console.log(response)
                res.status(200).json(response)
            })
            .catch(err => {
                res.status(422).send({ "Error": err.message });
            });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }

});

router.post('/signup/', (req, res, next) => {

    //const {email,password} = req.body;
    try {
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
                return res.status(500).json({
                    error: err
                });
            } else {
                const customer = new Customer({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash,
                    name: req.body.name,
                    phone: req.body.phone,
                    cnic: req.body.cnic,
                });

                await customer.save()
                    .then(result => {
                        //console.log(result)
                        res.status(201).json({
                            message: "Successfully Created a customer",
                            CreatedCustomer: response = {
                                _id: result._id,
                                email: result.email,
                                password: result.password,
                                name: result.name,
                                phone: result.phone,
                                cnic: result.cnic,
                            }
                        })
                    })
                    .catch(err => {
                        res.status(422).send({ "Error": err.message });
                    })
            }
        });
        //const token = jwt.sign({userId:customer._id},jwtKey);
        //res.status(200).json(response);
    }
    catch (err) {
        res.status(422).send({ "Error": err.message });
    }
    //res.send("Hey There 11")

});

router.post('/login/', async (req, res, next) => {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) {
        return res.status(422).send({ "Error": "Email or password is incorrect" });
    }
    try {
        bcrypt.compare(password, customer.password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            if (result) {
                const token = jwt.sign(
                    {
                        email: customer.email,
                        userId: customer._id
                    },
                    JWT_KEY
                );
                return res.status(200).json({
                    message: "Auth successful",
                    token: token
                });
            }
            res.status(401).json({
                message: "Auth failed"
            });
        });
    }
    catch{
        return res.status(422).send({ "Error": "Email or password is incorrect" });
    }
});

router.delete("/:id", async (req, res, next) => {
    const id = req.params.id;

    try {
        await Customer.remove({ _id: id })
            .then(result => {
                //console.log(result)
                res.status(200).json({ message: "Customer Deleted" })
            })
            .catch(err => {
                res.status(422).send({ "Error": err.message });
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
});
module.exports = router;