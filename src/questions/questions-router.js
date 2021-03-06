const express = require('express')
const path = require('path')
const QuestionsService = require('./questions-service')
const AnswersService = require('../answers/answers-service')
const { requireAuth } = require('../middleware/jwt-auth')

const questionsRouter = express.Router()
const jsonBodyParser = express.json()

questionsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const active_user_id = req.user.id
        QuestionsService.getAllQuestions(req.app.get('db'), active_user_id)
        .then(questions => {
            res.json(questions.map(QuestionsService.serializeQuestion))
        })
        .catch(next)
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { title, body, tags } = req.body
        const newQuestion = { title, body}

        for (const [key, value] of Object.entries(newQuestion))
        if (value.length === 0)
          return res.status(400).json({
            error: `Missing '${key}' in request body`
          })
        newQuestion.tags = tags
        newQuestion.user_id = req.user.id

        QuestionsService.insertQuestion(req.app.get('db'), newQuestion)
        .then(question => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${question.question_id}`))
                .json(QuestionsService.serializeQuestion(question))
        })
        .catch(next)
    })

questionsRouter
    .route('/:question_id')
    .all(requireAuth)
    .all(checkQuestionExists)
    .get((req, res) => {
        res.json(QuestionsService.serializeQuestion(res.question))
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { title, body, tags, votes } = req.body
        const questionToUpdate = { title, body, tags, votes }

        const numberOfValues = Object.values(questionToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'title', 'body', 'tags', or 'votes'`
                }
            })

            QuestionsService.updateQuestion(
                req.app.get('db'),
                req.params.question_id,
                questionToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                    .catch(next)
        
    })
    
questionsRouter.route('/:question_id/answers/')    
    .all(requireAuth)
    .all(checkQuestionExists)
    .get((req, res) => {
        QuestionsService.getAnswersForQuestion(
            req.app.get('db'),
            req.params.question_id,
            req.user.id
        )
    .then(answers => {
        res.json(answers.map(QuestionsService.serializeQuestionAnswer))
    })    
    })


async function checkQuestionExists(req, res, next) {
    try {
        const question = await QuestionsService.getById(
            req.app.get('db'),
            req.params.question_id,
            req.user.id
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