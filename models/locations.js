const mongoose  = require('mongoose');
const locSchema = new mongoose.Schema({
    name :String,
    userId : String,
    isInfected : Boolean,
    location :Object
}); 
const Location = mongoose.model('Location',locSchema);
module.exports=Location;