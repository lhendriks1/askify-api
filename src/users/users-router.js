const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const AuthService = require('../auth/auth-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter.post('/', jsonBodyParser, (req, res, next) => {
    const { password, user_name, full_name } = req.body

    for (const field of ['password', 'full_name', 'user_name'])
        if (!req.body[field])
            return res.status(400).json({
                error: `Missing ${field} in request body`
            })

    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
            return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithUserName(
        req.app.get('db'),
        user_name
    )
        .then(hasUserWithUserName => {
            if(hasUserWithUserName)
                return res.status(400).json({ error: 'Username already taken' })

            return UsersService.hashPassword(password)
                .then(hashedPassword => {
                    const newUser = {
                        user_name,
                        full_name,
                        password: hashedPassword,
                        date_created: 'now()'
                    }

                    return UsersService.insertUser(
                        req.app.get('db'),
                        newUser
                    )
                        .then(user => {
                            const serializedUser = UsersService.serializeUser(user)
                            const { user_name, user_id } = serializedUser
                            const sub = user_name
                            const payload = {user_id: user_id}

                            res
                                .status(201)
                                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                .send({
                                    authToken: AuthService.createJwt(sub, payload),
                                    user: serializedUser
                                })
                        })
                })
        })
        .catch(next)

})

module.exports = usersRouter