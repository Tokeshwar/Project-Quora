const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    fname: { type: String, required: true, trim: true },

    lname: { type: String, required: true, trim: true },

    email: { type: String,required:true,  lowercase: true, unique: true, trim: true },

   phone: { type: String, trim: true,unique:true, valid: 'valid Indian mobile number' },

    password: { type:String, required: true, trim: true },

    creditScore:{type:Number,required:true,trim:true}
    
}, { timestamps: true })

module.exports = mongoose.model('userModel', userSchema)