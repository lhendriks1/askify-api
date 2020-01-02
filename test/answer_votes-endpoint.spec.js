const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Answer_votes Endpoints', function() {
    let db 

    const {
        testUsers,
        testQuestions,
        testQuestionVotes,
        testAnswers,
        testAnswerVotes
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

    describe('/GET api/avotes', () => {
        context('given no answers', () => {
            beforeEach('insert users', () =>
            helpers.seedQuestionsTable(
                db,
                testUsers
            )
        )
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                  .get('/api/avotes')
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .expect(200, [])
            })
        })

        context('given there are answers', () => {

            beforeEach('insert answers', () =>
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testQuestionVotes,
                    testAnswers,
                    testAnswerVotes
                )
            )
            
            it('responds with 200 and the entire vote history of the active user', () => {
                const testUser = testUsers[1]
                const expectedVoteObj = testAnswerVotes.filter(v => v.user_id == testUser.id)

                return supertest(app)
                    .get('/api/avotes')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedVoteObj)
            })
        })
    })

    describe('/GET /api/avotes/:answer_id', () => {

        context('Given no votes for specified answer', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers
                )
            )
            const testUser = testUsers[0]

            it('responds with an empty array', () => {
                const AnswerId = 1
                return supertest(app)
                    .get(`/api/avotes/${AnswerId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404)
            })
        })
    })

    describe('/PATCH /api/avotes/:answer_id', () => {

        context('Given no answers', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                )
            )
            const testUser = testUsers[0]

            it('responds with 404', () => {
                const answerId = 12345
                return supertest(app)
                .delete(`/api/avotes/${answerId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(404, {error: `Answer does not exist`})
            })
        })

        context('Given the user has previously voted on the answer', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testQuestionVotes,
                    testAnswers,
                    testAnswerVotes
                )
            )

            it('responds with 204 and updates the answer vote count', () => {
                // seed data user 1 voted 1 on answer 1
                const answerIdToUpdate = 1
                const testUser = testUsers[0]
                const updateVote = {
                    vote: -1,
                }

                return supertest(app)
                    .patch(`/api/avotes/${answerIdToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(updateVote)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/answers/${answerIdToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(res => {
                                expect(res.body.active_user_vote).to.eql(updateVote.vote)
                            })
                    )
            })
        })

        context('Given the user has never voted on the answer', () => {
            beforeEach(() => 
                helpers.seedQuestionsTable(
                    db,
                    testUsers,
                    testQuestions,
                    testQuestionVotes,
                    testAnswers,
                    testAnswerVotes
                )
            )

            it('responds with 204 and updates the answer', () => {
                //in seed data user 1 has never voted on answer 3
                const answerIdToUpdate = 3
                const testUser = testUsers[0]
                const updateVote = {
                    vote: -1,
                }

                return supertest(app)
                    .patch(`/api/avotes/${answerIdToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(updateVote)
                    .expect(201)
                    .then(res =>
                        supertest(app)
                            .get(`/api/avotes/${answerIdToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(res => {
                                expect(res.body.vote).to.eql(updateVote.vote)
                            })
                    )
            })
        })
    })
})