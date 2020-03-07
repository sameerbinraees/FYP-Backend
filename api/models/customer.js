const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const customerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

//customerSchema.pre('save',function(next){
//    const customer = this;
//    if(!customer.isModified('password')){
//        return next();
//    }
//    bcrypt.genSalt(10,(err,salt)=>{
//        if(err){
//            return next(err);
//        }
//        bcrypt.hash(customer.password,salt,(err,hash)=>{
//            if(err){
//                return next(err);
//            }
//            customer.password=hash;
//            next();
//        })
//    })
//})
//
//customerSchema.methods.comparePassword = function(password){
//    const customer = this;
//    return new Promise((resolve,reject)=>{
//        bcrypt.compare(password,customer.password,(err,isMatch)=>{
//            if(err){
//                return reject(err);
//            }
//            if(!isMatch){
//                return reject(err);
//            }
//            resolve(true);
//        })
//    })
//}
module.exports = mongoose.model("Customer", customerSchema)
