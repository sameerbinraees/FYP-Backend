const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const Customer = require('../models/customer')
const Vendor = require('../models/vendor')
const { JWT_KEY } = require('../../keys')

module.exports = (req, res, next) => {

    const { authorization } = req.headers;
    const { type } = req.headers;
    let user = null;

    //console.log(req.headers)

    if (!authorization && !type) {
        res.status(401).send({ error: 'You must be logged in' });
    }
    const token = authorization.replace("Bearer ", "");
    //console.log(token);
    jwt.verify(token, JWT_KEY, async (err, payload) => {
        if (err) {
            res.status(401).send({ error: 'You must be logged in 2' });
        }
        console.log(payload);
        const { userId } = payload;
        if (type == "Customer")
            user = await Customer.findById(userId);
        if (type == "Vendor")
            user = await Vendor.findById(userId);
        req.user = user;
        next();
    });

}