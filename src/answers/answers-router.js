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

answersRouter
    .route('/:answer_id')
    .all(requireAuth)
    .all(checkAnswerExists)
    .get((req, res, next) => {
      AnswersService.getById(
        req.app.get('db'),
        req.params.answer_id,
        req.user.id
      )
        .then(answer => 
            res
              .status(200)
              .json(AnswersService.serializeAnswer(answer)))
    })
    .patch(jsonBodyParser, (req, res, next) => {
      const { answer, votes } = req.body
      const answerToUpdate = { answer, votes }

      const numberOfValues = Object.values(answerToUpdate).filter(Boolean).length
      if (numberOfValues === 0)
          return res.status(400).json({
              error: {
                  message: `Request body must contain either 'answer', or 'votes'`
              }
          })

          AnswersService.updateAnswer(
            req.app.get('db'),
            req.params.answer_id,
            answerToUpdate
          )
            .then(numRowsAffected => {
              res.status(204).end()
            })
    })


    async function checkAnswerExists(req, res, next) {
      try {
          const answer = await AnswersService.getById(
              req.app.get('db'),
              req.params.answer_id,
              req.user.id
          )
  
          if (!answer)
              return res.status(404).json({
                  error: 'Answer does not exist'
              })
          res.answer = answer
          next()
      } catch (error) {
          next(error)
      }
  }

module.exports = answersRouter