var express = require('express');
var router = express.Router();
const jwt =require('jsonwebtoken');
const config=require('config');
const chkToken = (req,res,next)=>{
    const token =  req.body.token ||req.headers['x-auth-token'];
    if(!token){
        res.status(401).send('Unauthorised');
    }else{
        jwt.verify(token,config.get('jwtSecret'),(err,success)=>{
            if(err){
                res.status(401).send('Unauthorised');
            }else{
                next();
            }
        })
    }
}
router.post('/', chkToken, async (req, res)=> {
    res.sendStatus(200);
});
module.exports = router;