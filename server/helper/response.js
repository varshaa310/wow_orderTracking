"use strict";
const errorMsg = {
    // Internal server error
    "500": "There seems to be some problem with our servers. You can retry after a few seconds or reach out to admin for assistance.",
    // unauthorized
    "401": "Your credentials are not sufficient to authorized you. Please retry with the right credentials.",
    

    "409" : "Customer already exists",
    
    "300" : "multiple Response"
}

/**
 * Default response format
 * 
 * @param status 
 * @param msg 
 * @param code 
 * @returns {json} 
 */
const respond = (status = true, msg, code) => {

    return {
        "success": status,
        "message": msg,
        "code": code
    }
}

/**
 * return response for the newly created instance 
 * 
 * @param msg 
 * @returns {json}
 */
const respondCreated = (msg) => {

    return respond(true, msg, 201);
}

/**
 * return success response
 * @param msg 
 * @returns {json}
 */
const respondSuccess = (msg) => {

    return respond(true, msg, 200);
}

/**
 * return success response with data
 * 
 * @param msg 
 * @param code 
 * @param data 
 * @returns {json}
 */
const respondWithData = (msg = "", code = 200, data) => {

    return {
        ...respond(true, msg, code),
        "data": data,
    }
}

/**
 * Return error response
 * 
 * @param msg 
 * @param code 
 * @returns {json}
 */
const respondError = (msg, code) => {

    return respond(false, msg, code);
}

/**
 * Return unauthorized error
 * 
 * @returns {json}
 */
const respondUnauthorized = (msg, data , code = 401) => {

    return {
        ...respond(false, msg, code),
        "data": data,
    }
}



const respondNotAcceptable = (msg, code = 406) => {

    return {
        ...respond(false, msg, code)
    }
}

/**
 * Return multipleResponse error
 * 
 * @returns {json}
 */
 const multipleResponse = (msg = "", code= 300 ,data) => {

    return {
        ...respond(false, msg, code),
        "data": data,
    }
}

/**
 * Return Forbidden response
 * 
 * @returns {json}
 */
const respondForbidden = (msg) => {

    return respond(false, msg, 403);
}

/**
 * return route not found error
 * 
 * @param {string} msg 
 * @returns {json}
 */
const respondNotFound = (msg) => {
    return respond(false, msg, 404);
}

/**
 * Return Internal server Error
 * 
 * @returns {json}
 */
const respondInternalServerError = () => {

    return respond(false, errorMsg["500"], 500);
}

module.exports = {
    respondInternalServerError,
    respondNotFound,
    respondForbidden,
    respondUnauthorized,
    respondCreated,
    respondSuccess,
    respondWithData,
    respondError,
    multipleResponse,
    respondNotAcceptable,
    errorMsg
}