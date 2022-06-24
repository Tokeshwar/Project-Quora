const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')

const middleware = require('../middlewares/authMiddleware')

//-----------------FEATURE I - USER API
//-----------------FIRST API CREATE USER
router.post('/user', userController.userRegistration)
//-----------------SECOND API USER LOGIN
 router.post('/login', userController.userLogin)
// //-----------------THIRD API GET USER DETAILS
 router.get('/user/:userId/profile',middleware.getUserDetails,userController.getUserList)
// //-----------------THIRD API UPDATE USER DETAILS
 router.put('/user/:userId/profile',middleware.getUserDetails,userController.updateUser)

// //-----------------FEATURE II - Question API

router.post('/question',middleware.getUserDetails,questionController.createQuestion)
router.get('/question',questionController.getQuestions)
router.get('/questions/:questionId',questionController.getQuestionById)
router.put('/questions/:questionId',middleware.getUserDetails,questionController.updateQuestion)
router.delete('/questions/:questionId',middleware.getUserDetails,questionController.deleteQuestion)
// //-----------------FOURTH API UPDATE PRODUCT DETAIL
// router.put('/products/:productId',productController.updateProduct)


router.post('/answer',middleware.getUserDetails,answerController.createAnswer)
router.get('/questions/:questionId/answer',answerController.getAnswers)
router.put('/answer/:answerId',middleware.getUserDetails,answerController.updateAnswer)
router.delete('/answers/:answerId',middleware.getUserDetails,answerController.deleteAnswer)



module.exports = router;