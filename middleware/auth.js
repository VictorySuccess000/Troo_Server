const jwt=require('jsonwebtoken');
const config=require('config');
module.exports=function(req,res,next){
    const token=req.header('x-auth-token');
    if(!token){
        return res.status(401).send('Notoken');
    }
    try{
        jwt.verify(token,config.get('jwtSecret'),(err,decoded)=>{
            if(err){
                return res.status(401).send('InvalidToken');
            } else {
                req.user=decoded.user;
                next();
            }
        });
        console.log("success auth middleware");
    } catch (err){
        res.status(500).send("Server Error");
    }
}