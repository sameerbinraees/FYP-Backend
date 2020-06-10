const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Promotion = require('../models/promotion')

router.get("/", async (req, res, next) => {
    try {
        await Promotion.find()
            .exec()
            .then(result => {
                const response = {
                    count: result.length,
                    Promotions: result.map(doc => {
                        return {
                            id: doc._id,
                            description: doc.description,
                            image: doc.image,
                            expired: doc.expired,
                        }
                    })
                }
                //console.log("here")
                res.status(200).json(response)
            })
            .catch(err => {
                res.status(422).send({ "Error": err.message });
            });
    } catch (err) {
        console.log(err)
        res.status(500).json({ Error: err })
    }

});


router.post('/', async (req, res, next) => {
    try {
        const promotion = new Promotion({
            _id: new mongoose.Types.ObjectId(),
            description: req.body.description,
            image: req.body.image,
            expired: req.body.expired,
        });

        await promotion.save()
            .then(result => {
                //console.log(result)
                res.status(201).json({
                    message: "Successfully Created a promotion",
                    CreatedPromotion: response = {
                        _id: result._id,
                        description: result.description,
                        image: result.image,
                        expired: result.expired,
                    }
                })
            })
            .catch(err => {
                res.status(422).send({ "Error": err.message });
            })
    }
    catch (err) {
        res.status(422).send({ "Error": err.message });
    }
});

router.delete("/:id", async (req, res, next) => {
    const id = req.params.id;
    await Promotion.findById({ _id: id })
        .exec()
        .then(async (result) => {
            if (!result)
                res.status(422).send({ "Error": "No record found" });
            else {
                try {
                    await Promotion.findByIdAndDelete({ _id: id })
                        .then(result => {
                            //console.log(result)
                            res.status(200).json({ message: "Promotion Deleted" })
                        })
                        .catch(err => {
                            res.status(422).send({ "Error": err.message });
                        })
                } catch (err) {
                    //console.log(err)
                    res.status(500).json({ "Error": err })
                }
            }
        })
        .catch(err => {
            res.status(500).json({ "Error": err })
        })
});


router.patch('/:id', async (req, res) => {
    var id = req.params.id;
    var updateObject = req.body; // {last_name : "smith", age: 44}

    await Promotion.findById({ _id: id })
        .exec()
        .then(async (result) => {
            if (!result)
                res.status(422).send({ "Error": "No record found" });
            else {
                try {
                    await Promotion.findByIdAndUpdate({ _id: id }, { $set: updateObject })
                        .then(result => {
                            res.status(200).send(result)
                        })
                        .catch(err => {
                            res.status(422).send({ "Error": "No record found" });
                        });
                }
                catch (err) {
                    res.status(500).json({ "Error": err })
                }
            }
        })
        .catch(err => {
            res.status(500).json({ "Error": err })
        })

});

module.exports = router;