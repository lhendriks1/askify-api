const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Answers endpoints', function() {
    let db 

    const {
        testQuestions,
        testQuestionVotes,
        testUsers,
        testAnswers,
        testAnswerVotes
    } = helpers.makeQuestionsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    before('cleanup', () => helpers.cleanTables(db))
    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('POST /api/answers', () => {
        beforeEach('insert questions', () => 
            helpers.seedQuestionsTable(
                db,
                testUsers,
                testQuestions
            )
        )
        
        it('creates an answer, responding with 201 and the new answer', () => {
            this.retries(3)
            const testQuestion = testQuestions[0]
            const testUser = testUsers[0]
            const newAnswer = {
                answer: 'Test new answer',
                question_id: testQuestion.id
            }
            return supertest(app)
                .post('/api/answers')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newAnswer)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.answer).to.eql(newAnswer.answer)
                    expect(res.body.question_id).to.eql(newAnswer.question_id)
                    expect(res.body.user.user_id).to.eql(testUser.id)
                    expect(res.headers.location).to.eql(`/api/answers/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res => 
                    db
                        .from('askify_answers')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.answer).to.eql(newAnswer.answer)
                            expect(row.question_id).to.eql(newAnswer.question_id)
                            expect(row.user_id).to.eql(testUser.id)
                            const expectedDate = new Date().toLocaleString('en', {timezone: 'UTC' })
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })

        const requiredFields = ['answer', 'question_id']

        requiredFields.forEach(field => {
            const testQuestion = testQuestions[0]
            const testUser = testUsers[0]
            const newAnswer = {
                answer: 'Test new answer',
                question_id: testQuestion.id
            }

            it(`responds with 400 and an error message when the ${field} is missing`, () => {
                delete newAnswer[field]

                return supertest(app)
                    .post('/api/answers')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(newAnswer)
                    .expect(400, {
                        error: `Missing '${field}' in request body`
                    })
            })
        })
    })

    describe('PATCH /api/answers/:answer_id', () => {

        context('Given there are questions in the database', () => {
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
                const idToUpdate = 2
                const testUser = testUsers[1]
                const updateAnswer = {
                    answer: 'updated answer',
                }
                const expectedAnswer = {
                    ...testAnswers[idToUpdate-1],
                    ...updateAnswer
                }

                return supertest(app)
                    .patch(`/api/answers/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(updateAnswer)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/answers/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(res => {
                                expect(res.body.answer).to.eql(expectedAnswer.answer)
                                expect(res.body.user.user_id).to.eql(testUser.id)
                            })
                    )
            })
        })
     })
})