const express = require('express')
const QuestionsService = require('./questions-service')
const { requireAuth } = require('../middleware/jwt-auth')

const questionsRouter = express.Router()

questionsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        QuestionsService.getAllQuestions(req.app.get('db'))
        .then(questions => {
            res.json(questions.map(QuestionsService.serializeQuestion))
        })
        .catch(next)
    })

questionsRouter.route('/:question_id')
    .all(requireAuth)
    .all(checkQuestionExists)
    .get((req, res) => {
        res.json(QuestionsService.serializeQuestion(res.question))
    })
    
questionsRouter.route('/:question_id/answers/')    
    .all(requireAuth)
    .all(checkQuestionExists)
    .get((req, res) => {
        QuestionsService.getAnswersForQuestion(
            req.app.get('db'),
            req.params.question_id
        )
    .then(answers => res.status(200).json(answers))    
})


async function checkQuestionExists(req, res, next) {
    try {
        const question = await QuestionsService.getById(
            req.app.get('db'),
            req.params.question_id
        )

        if (!question)
            return res.status(404).json({
                error: 'Question does not exist'
            })
        res.question = question
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = questionsRouter