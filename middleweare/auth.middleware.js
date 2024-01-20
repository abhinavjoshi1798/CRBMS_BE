const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth=(req,res,next)=>{
    const token = req.headers.authorization
    if(token){
        try{
            const decoded =  jwt.verify(token, process.env.secretKey);   
            if(decoded){
                console.log(decoded);
                // req.body.authorID = decoded.authorID;
                // req.body.author=decoded.author;
                next();
            }  else{
                res.send({"msg":"Please Login!!"})
            }
        }
       catch(err){
        res.send({"err":err.message})
       }
    }else{
        res.send({"msg":"Please Login!!"})
    }
}
module.exports={
    auth
}