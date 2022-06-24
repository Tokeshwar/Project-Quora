const mongoose = require("mongoose");


const answerSchema = new mongoose.Schema({

answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true },
text: { type: String, required:true },
questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'questionModel', required: true },
isDeleted:{type:Boolean,default:false},
deletedAt:Date

} , { timestamps: true })
module.exports = mongoose.model('answerModel', answerSchema)