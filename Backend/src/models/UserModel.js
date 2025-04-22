const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({

    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    age:{
        type:Number
    },
    phone:{
        type:String
    },
    status:{
        type:String,
        enum: ['Active', 'Inactive', 'Pending', 'Rejected'],
        default: 'Pending'
    },
    statusReason:{
        type:String,
        default: ''
    },
    roleId:{
        type:Schema.Types.ObjectId,
         ref:"roles"
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String,
    }
   

}, { timestamps: true })

module.exports = mongoose.model("users",userSchema)