var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
});
 //add packages and methods to userschema
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("user",userSchema);