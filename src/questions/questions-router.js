const express = require('express')
const QuestionsService = require('./questions-service')
const { requireAuth } = require('../middleware/jwt-auth')

const questionsRouter = express.Router()

//TODO: add routes