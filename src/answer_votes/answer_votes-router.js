const express = require('express')
const AnswersService = require('../answers/answers-service')
const AnswerVotesService = require('./answer_votes-service')
const { requireAuth } = require('../middleware/jwt-auth')

const answerVotesRouter = express.Router()
const jsonBodyParser = express.json()

answerVotesRouter
    .route('/:answer_id')
    .all(requireAuth)
    .all(checkAnswerExists)
    .get((req, res, next) => {
        AnswerVotesService.getAnswerVote(
            req.app.get('db'),
            req.params.answer_id,
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

        //check if user has previously voted on this answer
        
        AnswerVotesService.getAnswerVote(
            req.app.get('db'),
            req.params.answer_id,
            req.user.id
        ).then(voteObj => {
            let voteHistory = !!voteObj
        
            // If the active user previously voted on the current answer, then update the vote in the askify_answer_vote table
            if (voteHistory) {
                AnswerVotesService.updateAnswerVote(
                    req.app.get('db'),
                    req.params.answer_id,
                    req.user.id,
                    voteToUpdate.vote
                )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
            // If the active user has never voted on the current answer post a new database entry to the askify_answer_vote table
            } else {
                let newVote = {
                    answer_id: Number(req.params.answer_id),
                    user_id: Number(req.user.id),
                    vote: Number(voteToUpdate.vote)
                }

                AnswerVotesService.postAnswerVote(
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

answerVotesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const activeUserId = req.user.id
        AnswerVotesService.getAllVoteHistory(req.app.get('db'), activeUserId)
        .then(voteHistory => {
            res.json(voteHistory)
        })
        .catch(next)
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

module.exports = answerVotesRouter 