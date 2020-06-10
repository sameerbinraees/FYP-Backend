const mongoose = require('mongoose')
const promotionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    expired: {
        type: Boolean,
        required: true
    },
})

module.exports = mongoose.model("Promotion", promotionSchema)
