const mongoose = require('mongoose')
const transactionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    amount: {
        type: Number,
        required: true,
    },
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    vendorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
},
    {
        timestamps: true
    })

module.exports = mongoose.model("Transaction", transactionSchema)
