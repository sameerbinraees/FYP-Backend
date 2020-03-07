const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
//const User = mongoose.model('User');
const { JWT_KEY } = require('../../keys')

module.exports=(req,res,next)=>{

    const {authorization} = req.headers;

    if(!authorization){
        res.status(401).send({error:'You must be logged in'});
    }
    const token = authorization.replace("Bearer ","");
    //console.log(token);
    jwt.verify(token, JWT_KEY, async(err,payload)=>{
        if(err){
            res.status(401).send({error:'You must be logged in 2'});
        }
        //console.log(payload);
        //const {userId} = payload;
        //const user = await User.findById(userId);
        //req.user = user;
        next();
    });

}