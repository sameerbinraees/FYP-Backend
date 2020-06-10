const express = require('express');
const app = express();
const morgan = require("morgan");
const bodyParser = require('body-parser')

const vendorRoutes = require('./api/routes/vendor')
const customerRoutes = require('./api/routes/customer')
const tranactionRoutes = require('./api/routes/transaction')
const promotionRoutes = require('./api/routes/promotion')


const mongoose = require('mongoose')
const { mongoUrl } = require('./keys')

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {           //CORS
    res.header("Access-Control-Allow-Origin", '*');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header(
            "Access-Control-Allow-Methods",
            "PUT, POST, PATCH, GET, DELETE"
        );
        return req.status(200).json({});
    }
    next();
});

app.use('/vendors', vendorRoutes);
app.use('/customers', customerRoutes);
app.use('/transactions', tranactionRoutes);
app.use('/promotions', promotionRoutes);

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
})

mongoose.connection.on('connected', () => {
    console.log('Connection successful')
})
mongoose.connection.on('error', (err) => {
    console.log('Error while Connecting', err)
})

app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status,
        message: error.message,
    })
})

module.exports = app;