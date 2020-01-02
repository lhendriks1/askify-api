const express = require('express')
const QuestionsService = require('../questions/questions-service')
const QuestionVotesService = require('./question_votes-service')
const { requireAuth } = require('../middleware/jwt-auth')

const questionVotesRouter = express.Router()
const jsonBodyParser = express.json()

questionVotesRouter
    .route('/:question_id')
    .all(requireAuth)
    .all(checkQuestionExists)
    .get((req, res, next) => {
        QuestionVotesService.getQuestionVote(
            req.app.get('db'),
            req.params.question_id,
            req.user.id
        ).then(voteObj => {
            res.json(voteObj)
        })
        .catch(next)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { vote } = req.body
        const voteToUpdate = { vote }

        const numberOfValues = Object.values(voteToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain'vote'`
                }
            })

        //Check if user has previously voted on this question
        QuestionVotesService.getQuestionVote(
            req.app.get('db'),
            req.params.question_id,
            req.user.id
        ).then(voteObj => {
            let voteHistory = !!voteObj
        
            // If the active user previously voted on the current question, then update the vote in the askify_question_vote table
            if (voteHistory) {
                QuestionVotesService.updateQuestionVote(
                    req.app.get('db'),
                    req.params.question_id,
                    req.user.id,
                    voteToUpdate.vote
                )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
            // If the active user has never voted on the current question post a new database entry to the askify_question_vote table
            } else {
                let newVote = {
                    question_id: Number(req.params.question_id),
                    user_id: Number(req.user.id),
                    vote: Number(voteToUpdate.vote)
                }

                QuestionVotesService.postQuestionVote(
                    req.app.get('db'),
                    newVote
                )
                .then(vote => {
                    res.status(201).json(vote)
                })
                .catch(next)
            }
        })

 
})

questionVotesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const activeUserId = req.user.id
        QuestionVotesService.getAllVoteHistory(req.app.get('db'), activeUserId)
        .then(voteHistory => {
            res.json(voteHistory)
        })
        .catch(next)
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

module.exports = questionVotesRouter 