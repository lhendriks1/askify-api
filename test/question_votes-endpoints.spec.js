const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Question_votes Endpoints', function() {
    let db 

    const {
        testUsers,
        testQuestions,
        testQuestionVotes,
        testAnswers
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

    describe('/GET api/qvotes', () => {
        context('given no questions', () => {
            beforeEach('insert questions', () =>
            helpers.seedQuestionsTable(
                db,
                testUsers
            )
        )
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                  .get('/api/qvotes')
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
                    testQuestionVotes,
                    testAnswers
                )
            )
            
            it('responds with 200 and the entire vote history of the active user', () => {
                const testUser = testUsers[0]
                const expectedVoteObj = testQuestionVotes.filter(v => v.user_id == testUser.id)

                return supertest(app)
                    .get('/api/qvotes')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedVoteObj)
            })
        })
    })

    describe('/GET /api/qvotes/:question_id', () => {

        context('Given no votes for specified question', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers
                )
            )
            const testUser = testUsers[0]

            it('responds with an empty array', () => {
                const questionId = 1
                return supertest(app)
                    .get(`/api/qvotes/${questionId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404)
            })
        })
    })

    describe('/PATCH /api/qvotes/:question_id', () => {

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
                .delete(`/api/qvotes/${questionId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(404, {error: `Question does not exist`})
            })
        })

        context('Given the user has previously voted on the question', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testQuestionVotes,
                    testAnswers
                )
            )

            it('responds with 204 and updates the question', () => {
                // seed data user 1 voted 1 on question 3
                const questionIdToUpdate = 3
                const testUser = testUsers[0]
                const updateVote = {
                    vote: -1,
                }

                return supertest(app)
                    .patch(`/api/qvotes/${questionIdToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(updateVote)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/questions/${questionIdToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(res => {
                                expect(res.body.active_user_vote).to.eql(updateVote.vote)
                            })
                    )
            })
        })

        context('Given the user has never voted on the question', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testQuestionVotes,
                    testAnswers
                )
            )

            it('responds with 204 and updates the question', () => {
                //in seed data user 1 has never voted on question 1
                const questionIdToUpdate = 1
                const testUser = testUsers[0]
                const updateVote = {
                    vote: -1,
                }

                return supertest(app)
                    .patch(`/api/qvotes/${questionIdToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(updateVote)
                    .expect(201)
                    .then(res =>
                        supertest(app)
                            .get(`/api/questions/${questionIdToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(res => {
                                expect(res.body.active_user_vote).to.eql(updateVote.vote)
                            })
                    )
            })
        })
    })
})