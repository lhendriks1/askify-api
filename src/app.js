require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {NODE_ENV} = require('./config')
const questionsRouter = require('./questions/questions-router')
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')
const answersRouter = require('./answers/answers-router')
const questionVotesRouter = require('./question_votes/question_votes-router')
const answerVotesRouter = require('./answer_votes/answer_votes-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())

app.use('/api/questions', questionsRouter)
app.use('/api/answers', answersRouter)
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/qvotes', questionVotesRouter)
app.use('/api/avotes', answerVotesRouter)

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        response = {message: error.message, error}
    }
    res.status(500).json(response)
})

module.exports = app