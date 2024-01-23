const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminValidator = (req, res, next) => {
    const token = req.headers.authorization
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.secretKey);
            if (decoded) {
                console.log(decoded);
                if (decoded.role === "admin") {
                    next();
                } else {
                    res.send({ "msg": "Only Admins are allowed on this page" })
                }


            } else {
                res.send({ "msg": "Please Login!!!" })
            }
        }
        catch (err) {
            res.send({ "err": err.message })
        }
    } else {
        res.send({ "msg": "Please Login!!" })
    }
}
module.exports = {
    adminValidator
}