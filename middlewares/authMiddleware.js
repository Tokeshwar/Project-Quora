const jwt = require("jsonwebtoken")

//-----------------------------------------------------------------------------//

const getUserDetails = async function (req, res, next) {
  try {
    const token = req.header('Authorization') //setting token in the request header.
    if (!token) {
      return res.status(403).send({ status: false, message: `Missing authentication token in request` })
    }
    tokenNew = token.split(' ')
    let requiredToken = tokenNew[1]
    const decoded = jwt.verify(requiredToken, 'tokeshwar'); //decoding authentication token
    if (!decoded) {
      return res.status(400).send({ status: false, message: "Invalid authentication token in request headers." })
    }

    req.userId = decoded.userId; //matching userId for which token generated by the userId provided in the request.
    next()

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


//-----------------------------------------------------------------------------//
module.exports.getUserDetails = getUserDetails;
//-----------------------------------------------------------------------------//
