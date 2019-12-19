const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Questions Endpoints', function() {
    let db 

    const {
        testUsers,
        testQuestions,
        testAnswers,
    } = helpers.makeQuestionsFixtures()


    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        })
        app.set('db', db)
    })

    after('disonnect from db', () => db.destroy())
    before('cleanup', () => helpers.cleanTables(db))
    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('/GET api/questions', () => {
        context('given no questions', () => {
            beforeEach('insert questions', () =>
            helpers.seedQuestionsTable(
                db,
                testUsers
            )
        )
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                  .get('/api/questions')
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .expect(200, [])
            })
        })

        context('given there are questions', () => {
            beforeEach('insert questions', () =>
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testAnswers
                )
            )
            
            it('responds with 200 and all the questions', () => {
                const expectedQuestions = testQuestions.map(q =>
                    helpers.makeExpectedQuestion(
                        testUsers,
                        q,
                        testAnswers
                    )
                )

                return supertest(app)
                    .get('/api/questions')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedQuestions)
            })
        })

        context('given an XSS question attack', () => {
            const testUser = helpers.makeUsersArray()[1]
            const {maliciousQuestion, expectedQuestion } = 
            helpers.makeMaliciousQuestion(testUser)

            beforeEach('insert malicious question', () => {
                return helpers.seedMaliciousQuestion(
                    db,
                    testUser,
                    maliciousQuestion
                )
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/questions')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].question_title).to.eql(expectedQuestion.question_title)
                        expect(res.body[0].question_body).to.eql(expectedQuestion.question_body)
                    })
            })
        })
     })

     describe('/POST /api/questions', () => {
        beforeEach('insert questions', () =>
            helpers.seedQuestionsTable(
                db,
                testUsers,
                testQuestions,
                testAnswers
            )
        )

        it('creates a question, responding with 201 and the new question', () => {
            this.retries(3)
            const newQuestion =  {
                title: "test question",
                body: "test question body",
                tags: ['tag1', 'tag2']
            }
            const testUser = testUsers[0]

            return supertest(app)
                .post('/api/questions')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newQuestion)
                .expect(201)
                .expect(res => {
                    expect(res.body.user.user_id).to.eql(testUser.id)
                    expect(res.body.question_title).to.eql(newQuestion.title)
                    expect(res.body.question_body).to.eql(newQuestion.body)
                    expect(res.body.tags).to.eql(new String(newQuestion.tags).replace(/\s/g, ""))
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })

        })
     })

    describe('/GET /api/questions/:question_id', () => {
        context('given no questions', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                )
            )

            it('responds with 404', () => {
                const questionId = 12345
                return supertest(app)
                    .get(`/api/questions/${questionId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: 'Question does not exist'})
            })
        })

        context('given there are questions', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testAnswers
                )
            )

            it('responds with 200 and the specified question', () => {
                const questionId = 1
                const expectedQuestion = helpers.makeExpectedQuestion(
                    testUsers,
                    testQuestions[questionId - 1],
                    testAnswers
                )

                return supertest(app)
                    .get(`/api/questions/${questionId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedQuestion)
             })  
         })

        context('given XSS question attack', () => {
            const testUser = helpers.makeUsersArray()[1]
            const {
                maliciousQuestion,
                expectedQuestion
            } = helpers.makeMaliciousQuestion(testUser)

            beforeEach('insert malicious question', () => {
                return helpers.seedMaliciousQuestion(
                    db,
                    testUser,
                    maliciousQuestion
                )
            })

            it('removes XSS attack content', () => {
            return supertest(app)
                .get(`/api/questions/${maliciousQuestion.id}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200)
                .expect(res => {
                    expect(res.body.question_title).to.eql(expectedQuestion.question_title)
                    expect(res.body.question_body).to.eql(expectedQuestion.question_body)
                })
            })
        })
     })

     describe.only('/PATCH /api/questions/:question_id', () => {

        context('Given no questions', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                )
            )
            const testUser = testUsers[0]

            it('responds with 404', () => {
                const questionId = 12345
                return supertest(app)
                .delete(`/api/questions/${questionId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(404, {error: `Question does not exist`})
            })
        })

        context('Given there are questions in the database', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testAnswers
                )
            )

            it('responds with 204 and updates the article', () => {
                const idToUpdate = 2
                const testUser = testUsers[1]
                const updateQuestion = {
                    title: 'updated question title',
                    body: 'updated question body',
                    votes: 10,
                }
                const expectedQuestion = {
                    ...testQuestions[idToUpdate-1],
                    ...updateQuestion
                }

                return supertest(app)
                    .patch(`/api/questions/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(updateQuestion)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/questions/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(res => {
                                expect(res.body.question_title).to.eql(expectedQuestion.title)
                                expect(res.body.question_body).to.eql(expectedQuestion.body)
                                expect(res.body.votes).to.eql(expectedQuestion.votes)
                                expect(res.body.user.user_id).to.eql(expectedQuestion.user_id)
                            })
                    )
            })
        })
     })

    describe('/GET /api/questions/:question_id/answers/', () => {
        context('given no questions', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                )
            )

            it('responds with 404', () => {
                const questionId = 12345
                return supertest(app)
                    .get(`/api/questions/${questionId}/answers`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: 'Question does not exist'})
            })
        })

        context('given there are answers for the question', () => {
            beforeEach('insert questions', () => {
               return helpers.seedQuestionsTable(
                   db,
                   testUsers,
                   testQuestions,
                   testAnswers
               )
            })

            it('responds with 200 and the specified answer', () => {
                const questionId = 1
                const expectedAnswers = helpers.makeExpectedQuestionAnswers(
                    testUsers,
                    questionId,
                    testAnswers
                )

                return supertest(app)
                    .get(`/api/questions/${questionId}/answers`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedAnswers)
            })

        })
    })
})