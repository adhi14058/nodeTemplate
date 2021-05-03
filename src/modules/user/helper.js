let User = require('./model')

module.exports.loginHelper = async(username,password)=>{
    //do checking for
    let users = await User.find()//User.find()
    return true
}