const express = require('express')
const path = require('path')
const AnswersService = require('./answers-service')
const { requireAuth } = require('../middleware/jwt-auth')

const answersRouter = express.Router()
const jsonBodyParser = express.json()

answersRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { question_id, answer } = req.body
        const newAnswer = { question_id, answer}

        for (const [key, value] of Object.entries(newAnswer))
        if (value == null)
          return res.status(400).json({
            error: `Missing '${key}' in request body`
          })

        newAnswer.user_id = req.user.id

        AnswersService.insertAnswer(
            req.app.get('db'),
            newAnswer
        )
            .then(answer => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${answer.id}`))
                    .json(AnswersService.serializeAnswer(answer))
            })
            .catch(next)
    })

module.exports = answersRouter