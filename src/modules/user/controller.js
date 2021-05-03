let authHelper = require('./helper')

module.exports.login = async (req,res, next)=>{
    try {
        let {username, password} = req.body;
        let checking =await authHelper.loginHelper(username,password);
        //do some cheing
        res.send({success:true})
    } catch (error) {
       next(error)
    }
   
}