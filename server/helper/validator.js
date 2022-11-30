"use strict";

const { validator } = require("./utility");
const { respondError } = require("./response");
const logger = require("./utility");



const validatePhone = async (req, res, next) => {

    const validationRule = {
        "phone": "required|string"
    };
    await validator(req.body, validationRule, {}, (err, status) => {
        
        if (!status) {
            res.send({
                    ...respondError("validation_error", 422),
                    ...err
                });
        } else {
            next();
        }
    }).catch(err =>{ 
    
        logger.error(err)
    });
}



module.exports = {
    validatePhone
};