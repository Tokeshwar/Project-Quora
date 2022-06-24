const userModel = require('../models/userModel');
const validateBody = require('../validators/validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;


//----------------------FIRST API CREATE USER....///
const userRegistration = async (req, res) => {
    try {
        const requestBody = req.body
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        const { fname, lname, email, phone, password,creditScore } = requestBody;


       
        if (!validateBody.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide fname or fname field" });
        }
        if (!validateBody.alphabetTestOfString(fname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in fname" });
        }
        if (!validateBody.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide lname or lname field" });
        }
        if (!validateBody.alphabetTestOfString(lname)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in lname" });
        }
        if (!validateBody.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
        }
        if (!validateBody.isValidSyntaxOfEmail(email)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Email Id" });
        }
        const DuplicateEmail = await userModel.findOne({ email });
        if (DuplicateEmail) {
            return res.status(400).send({ status: false, message: "This email Id already exists with another user" });
        }

        if (!validateBody.isString(phone)) {
            return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
        }
        if (phone) {
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test) {
                return res.status(400).send({ status: false, message: `Phone number should be a  valid indian number` });
            }
        }
        const duplicatePhone = await userModel.findOne({ phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
        }
        if (!validateBody.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        if (!(password.trim().length >= 8 && password.trim().length <= 15)) {
            return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" });;
        }

        if (!validateBody.isValid(creditScore)) {
            return res.status(400).send({ status: false, message: "Please provide creditScore or creditScore field" });;
        }
        if (isNaN(creditScore)) {
            return res.status(400).send({ status: false, message: "You can't use special character or alphabet in CreditScore" });
        }
        if ( creditScore < 0) {
            return res.status(400).send({ status: false, message: "You can't Insert negative values in CreditScore" });
        }

        //-----------SAVE USER PASSWORD WITH LOOK LIKE HASHED PASSWORD STORED IN THE DATABASE
        const hash = bcrypt.hashSync(password, saltRounds);
        let userRegister = { fname, lname, email, phone, password: hash,creditScore }
        const userData = await userModel.create(userRegister);
        return res.status(201).send({ status: true, message: 'Success', data: userData });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//-----------------SECOND API USER LOGIN
const userLogin = async (req, res) => {
    try {
        const requestBody = req.body
        const { email, password } = requestBody
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful login" });
        }
        if (!validateBody.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
        }
        if (!validateBody.isValidSyntaxOfEmail(email)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Email Id" });
        }
        if (!validateBody.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        if (!(password.trim().length >= 8 && password.trim().length <= 15)) {
            return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" });;
        }
        let user = await userModel.findOne({ email: email });
        if (user) {
            //-----------CHECK USER PASSWORD WITH HASHED PASSWORD STORED IN THE DATABASE
            const validPassword = await bcrypt.compareSync(requestBody.password, user.password);
            console.log(validPassword)
            if (validPassword) {
                //-----------JWT GENERATE WITH EXPIRY TIME AND PRIVATE KEY
                const generatedToken = jwt.sign({
                    userId: user._id,
                }, 'tokeshwar')

                return res.status(200).send({"status": true,Message: " user loggedIn Succesfully",data: {userId: user._id, token: generatedToken,}});
            } else {
                res.status(401).send({ error: "User does not exist with that password" });
            }
        } else {
            return res.status(400).send({ status: false, message: "Oops...Invalid credentials" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


//-----------------THIRD API GET USER DETAILS
const getUserList = async (req, res) => {
    try {
        const userId = req.params.userId
        console.log(userId)
        const tokenId = req.userId
        console.log(tokenId)
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "Not a valid userId or tokenId" });;
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }


        let user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(400).send({ status: false, message: "user not found" })
        }
        return res.status(200).send({ status: true, message: 'User profile details', data: user });



    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
}
//-----------------Fourth API UPDATE USER DETAILS

const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId
        const tokenId = req.userId
        if (!(validateBody.isValidObjectId(userId) && validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "Not a valid userId or tokenId" });;
        }

        let updateBody = req.body
        if (!validateBody.isValidRequestBody(updateBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to proceed your update request" });
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, message: "User does not exist with this userid" })
        }

        const { fname, lname, email, phone } = updateBody
        if (fname || lname || email || phone) {

            if (!validateBody.validString(fname)) {
                return res.status(400).send({ status: false, message: "fname is missing ! Please provide the fname details to update." })
            }
            if (!validateBody.validString(lname)) {
                return res.status(400).send({ status: false, message: "lname is missing ! Please provide the lname details to update." })
            }
            if (!validateBody.validString(email)) {
                return res.status(400).send({ status: false, message: "email is missing ! Please provide the email details to update." })
            }
            if (email) {
                if (!validateBody.isValidSyntaxOfEmail(email)) {
                    return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
                }
            }

            const duplicateEmail = await userModel.findOne({ email: email });
            if (duplicateEmail) {
                return res.status(400).send({ status: false, message: "This user email is already exists with another user" });
            }
        }
        if (!validateBody.validString(phone)) {
            return res.status(400).send({ status: false, message: "phone number is missing ! Please provide the phone number to update." })
        }
        if (phone) {
            const duplicatephone = await userModel.findOne({ phone: phone })
            if (duplicatephone) {
                return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
            }

            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Phone number should be a  valid indian number` });
            }
             

        }



        let updateProfile = await userModel.findOneAndUpdate({ _id: userId }, { fname: fname, lname: lname, email: email, phone: phone }, { new: true });
        res.status(200).send({ status: true, message: "user profile updated successfully", data: updateProfile, });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
    };
}



//-----------------Fourth API UPDATE USER DETAILS


module.exports = {
    userRegistration,
    userLogin,
    getUserList,
    updateUser
}






