const answerModel = require("../models/answerModel");
const userModel = require("../models/userModel");
const questionModel = require("../models/questionModel");
const validateBody = require("../validators/validator");

const createAnswer = async function (req, res) {
  try {
    const requestBody = req.body;
    const userId = req.body.answeredBy;
    const questionId = req.body.questionId;
    const tokenId = req.userId;

    if (!validateBody.isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Please provide data for successful Answer create for Particular Question",
        });
    }
    if (!validateBody.isValid(userId)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide answeredBy or answeredBy field",
        });
    }
    if (!validateBody.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, msg: "answeredBy UserId is not valid" });
    }
    if (!validateBody.isValid(questionId)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide QuestionId or QuestionId field",
        });
    }
    if (!validateBody.isValidObjectId(questionId)) {
      return res
        .status(404)
        .send({ status: false, message: "questionId is not valid" });
    }
    if (!(userId == tokenId.toString())) {
      return res
        .status(401)
        .send({
          status: false,
          message: `Unauthorized access! Owner info doesn't match`,
        });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      res
        .status(404)
        .send({ status: false, msg: "AnswerBy User Id not found in DB" });
    }
    const questiondetail = await questionModel.findOne({
      _id: questionId,
      isDeleted: false,
    });
    if (!questiondetail) {
      return res
        .status(404)
        .send({
          status: false,
          message: "question don't exist or it's deleted",
        });
    }
    let { text } = requestBody;
    if (!validateBody.isValid(text)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide text detail to create answer ",
        });
    }
    let userScoredata = await questionModel.findOne({ _id: questionId });
    if (!(req.body.answeredBy == userScoredata.askedBy)) {
      let increaseScore = await userModel.findOneAndUpdate(
        { _id: userId },
        { $inc: { creditScore: +200 } },
        { new: true }
      );
      const data = { answeredBy: userId, text, questionId };
      const answerData = await answerModel.create(data);
      let totalData = { answerData, increaseScore };
      return res
        .status(201)
        .send({
          status: false,
          message: "User Credit Score updated ",
          data: totalData,
        });
    } else {
      return res
        .status(400)
        .send({
          status: true,
          message: "Sorry , You cannot Answer Your Own Question",
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const getAnswers = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    if (!validateBody.isValidObjectId(questionId)) {
      return res
        .status(400)
        .send({ status: false, message: `${questionId} is not a valid id` });
    }
    const questionFound = await questionModel.findOne({
      _id: questionId,
      isDeleted: false,
    });
    if (!questionFound) {
      return res
        .status(404)
        .send({ status: false, msg: "question does not exist" });
    }
    const answerFound = await answerModel.find({
      questionId: questionId,
      isDeleted: false,
    });
    if (!answerFound) {
      return res
        .status(404)
        .send({ status: false, msg: "answer does not exist" });
    }
    const data = questionFound.toObject();
    data["answer"] = answerFound;
    return res
      .status(200)
      .send({ status: true, msg: "Successfully found data", data: data });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const requestBody = req.body;
    if (!validateBody.isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid request parameters" });
    }
    const answerId = req.params.answerId;
    const tokenId = req.userId;
    if (
      !(
        validateBody.isValidObjectId(answerId) &&
        validateBody.isValidObjectId(tokenId)
      )
    ) {
      return res
        .status(400)
        .send({
          status: false,
          message: `${answerId}  or ${tokenId} is not a valid id`,
        });
    }

    const answer = await answerModel.findOne({
      _id: answerId,
      isDeleted: false,
    });
    if (!answer) {
      return res
        .status(400)
        .send({ status: false, message: "answer not found" });
    }

    if (!(answer.answeredBy == tokenId.toString())) {
      return res
        .status(401)
        .send({
          status: false,
          message: `Unauthorized access! Owner info doesn't match`,
        });
    }

    let { text } = requestBody;
    if (!validateBody.validString(text)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "text is missing ! Please provide the text to update.",
        });
    }

    const updateAnswer = await answerModel.findOneAndUpdate(
      { _id: answerId },
      { text: text },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Answer is updated", data: updateAnswer });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, msg: err.message });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const answerId = req.params.answerId;
    const tokenId = req.userId;

    if (
      !(
        validateBody.isValidObjectId(answerId) &&
        validateBody.isValidObjectId(tokenId)
      )
    ) {
      return res
        .status(400)
        .send({
          status: false,
          message: `${answerId}  or ${tokenId} is not a valid id`,
        });
    }

    const requestBody = req.body;
    if (!validateBody.isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid request parameters" });
    }
    let { userId, questionId } = requestBody;
    if (!validateBody.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "userId is not given" });
    }
    if (!validateBody.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} is not a valid id` });
    }
    if (!validateBody.isValid(questionId)) {
      return res
        .status(400)
        .send({ status: false, message: `questionid is not given` });
    }
    if (!validateBody.isValidObjectId(questionId)) {
      return res
        .status(400)
        .send({ status: false, message: `${questionId} is not a valid id` });
    }

    if (!(userId == tokenId.toString())) {
      return res
        .status(401)
        .send({
          status: false,
          message: `Unauthorized access! Owner info doesn't match`,
        });
    }

    const answer = await answerModel.findOne({
      _id: answerId,
      isDeleted: false,
    });
    //console.log(answer)
    if (!answer) {
      return res
        .status(400)
        .send({
          status: false,
          message: "answer not found or it has been already deleted",
        });
    }

    const deleteAnswer = await answerModel.findOneAndUpdate(
      { _id: answerId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: `answer deleted successfully`,
        data: deleteAnswer,
      });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

module.exports.createAnswer = createAnswer;
module.exports.getAnswers = getAnswers;
module.exports.updateAnswer = updateAnswer;
module.exports.deleteAnswer = deleteAnswer;
