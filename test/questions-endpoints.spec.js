const knex = require('knex')
const app = require('../src/app')
//const testHelpers = require('./test-helpers')

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
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disonnect from db', () => db.destroy())
    before('cleanup', () => helpers.cleanTables(db))
    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('/GET api/questions', () => {
        context('given no questions', () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                  .get('/api/questions')
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
                        question,
                        testAnswers
                    )
                )

                return supertest(app)
                    .get('/api/questions')
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
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].q_title).to.eql(expectedQuestion.title)
                        expect(res.body[0].q_body).to.eql(expectedQuestion.body)
                    })
            })
        })
    })

    describe('/GET /api/questons/:question_id', () => {
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
                    .get(`/api/questions/{questionId}`)
                    //.set('Authorization': helpers.makeAuthHeader(testUser[0]))
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
                const questionId = 2
                const expectedQuestion = helpers.makeExpectedQuestion(
                    testUsers,
                    testQuestions[questionId - 1],
                    testAnswers
                )

                return supertest(app)
                    .get(`/api/questions/${questionId}`)
                    //.set('Authorization': helpers.makeAuthHeader(testUsers[0]))
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
                helpers.seedMaliciousQuestion(
                    db,
                    testUser,
                    maliciousQuestion
                )
            })

            return supertest(app)
                .get(`/api/question/${maliciousQuestion.id}`)
                //.set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200)
                .expect(res => {
                    expect(res.body.q_title).to.eql(expectedQuestion.title)
                    expect(res.body.q_body).to.eql(expectedQuestion.body)
                })
        })
    })

    describe('/GET /api/questions/:question_id/answers', () => {
        context('given no questions', () => {
            beforeEach(() => 
                helpers.seedUsers(db, testUsers)
            )

            it('responds with 404', () => {
                const questionId = 12345
                return supertest(app)
                    .get(`/api/questions/${questionId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: 'Question does not exist'})
            })
        })

        context('given there are answers for the question', () => {
            beforeEach('insert questions', () => {
               helpers.seedQuestionsTables(
                   db,
                   testUsers,
                   testQuestions,
                   testAnswers
               )
            })

            it('responds with 200 and the specified answers', () => {
                const questionId = 2
                const expectedAnswers = helpers.makeExpectedQuestionAnswers(
                    testUsers,
                    questionId,
                    testAnswers
                )

                return supertest(app)
                    .get(`/api/questions/${questionId}/answers`)
                    //.set('Authorization': helpers.makeAuthHeaders(testUsers[0]))
                    .expect(200, expectedAnswers)
            })

        })
    })

})