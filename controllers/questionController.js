
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');
const userModel = require('../models/userModel');
const validateBody = require('../validators/validator');


const createQuestion = async (req, res) => {
    try {
        const requestBody = req.body
        const userId = req.body.askedBy
        const tokenId = req.userId
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        const { description, tag, askedBy } = requestBody
        if (!validateBody.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide description or description field" });
        }
        if (!validateBody.isValid(tag)) {
            return res.status(400).send({ status: false, message: "Please provide tag or tag field" });
        }
        if (!validateBody.isValid(askedBy)) {
            return res.status(400).send({ status: false, message: "Please provide askedBy or askedBy field" });
        }
        if (!(validateBody.isValidObjectId(askedBy))) {
            return res.status(400).send({ status: false, message: "Not a valid userId" });;
        }

        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(400).send({ status: false, message: "user not found with this userId" })
        }
        if (user.creditScore < 100) {
            return res.status(400).send({ status: false, Message: "You don't have enough credit score to post a question" })
        }
        requestBody.tag = tag.split(",")
        const createQuestion = await questionModel.create(requestBody)
        await userModel.findOneAndUpdate({ _id: userId }, { $inc: { creditScore: -100 } })
        return res.status(201).send({ status: true, message: "Question created Successfully", data: createQuestion })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


const getQuestions = async (req, res) => {
    try {
        let filterQuery = req.query;
        let { tag, sort } = filterQuery;

        let query = { isDeleted: false }
        if (validateBody.isValid(tag)) {
            const tagArr = tag.split(',')
            query['tag'] = { $all: tagArr }
        }


        //The $all operator selects the documents where the value of a field is an 
        //array that contains all the specified elements.
        if (sort) {
            if (sort == "ascending") {
                var data = await questionModel.find(query).lean().sort({ createdAt: 1 })
            }
            if (sort == "descending") {
                var data = await questionModel.find(query).lean().sort({ createdAt: -1 })
            }
        }
        if (!sort) {
            var data = await questionModel.find(query).lean()  //toObject()
        }
        const questionsCount = data.length
        if (!(questionsCount > 0)) {
            return res.status(404).send({ status: false, msg: "No question found" })
        }
        for (let i = 0; i < data.length; i++) {
            let answer = await answerModel.find({ questionId: data[i]._id })
            data[i].answers = answer
        }

        return res.status(200).send({ status: true, message: `${questionsCount} Successfully Question Answer Found`, data: data });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const getQuestionById = async (req, res) => {
    try {
        const questionId = req.params.questionId
        if (!(validateBody.isValidObjectId(questionId))) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid id` });
        }
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!question) {
            return res.status(404).send({ status: false, msg: "question does not exist" })
        }
        let answer = await answerModel.find({ questionId: questionId })
        const data = question.toObject()
        data['answer'] = answer
        return res.status(200).send({ status: true, msg: "Successfully found data", data: data })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



const updateQuestion = async (req, res) => {

    try {
        const requestBody = req.body
        const questionId = req.params.questionId
        const tokenId = req.userId

        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        if (!(validateBody.isValidObjectId(questionId))) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid id` });
        }
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!question) {
            return res.status(404).send({ status: false, msg: "question does not exist" })
        }
        if (!(question.askedBy == tokenId)) {

            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }



        let { description, tag } = requestBody
        if (!validateBody.validString(description)) {
            return res.status(400).send({ status: false, message: "description is missing ! Please provide the description to update." })
        }
        if (!validateBody.validString(tag)) {
            return res.status(400).send({ status: false, message: "tags is missing ! Please provide the tags to update." })
        }
        if (tag) {
            tag = tag.split(",")
        }
        const updateQuestion = await questionModel.findOneAndUpdate({ _id: questionId }, { description: description, tag: tag }, { new: true })
        return res.status(200).send({ status: true, message: "Question is updated", data: updateQuestion })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }

}





const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const tokenId = req.userId
        if (!validateBody.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid question id` })
        }
        if (!(validateBody.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "Not a valid userId or tokenId" });;
        }

        const questionFind = await questionModel.findOne({ _id: questionId })
        if (!questionFind) {
            return res.status(404).send({ status: false, message: `Question Details not found with given questionId` })
        }

        if (questionFind.isDeleted == true) {
            return res.status(404).send({ status: false, message: "This Question is already deleted" });
        }
        if (!(questionFind.askedBy.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }

        const deleteQuestion = await questionModel.findOneAndUpdate({ _id: questionId }, { isDeleted: true, deletedAt: new Date() },{new:true})
        return res.status(200).send({ status: true, message: `Question deleted successfully`, data: deleteQuestion })
    }
    catch (err) {
        return res.status(500).send({ message: err.message });
    }
}









module.exports.createQuestion = createQuestion
module.exports.getQuestions = getQuestions
module.exports.getQuestionById = getQuestionById
module.exports.deleteQuestion = deleteQuestion
module.exports.updateQuestion = updateQuestion
