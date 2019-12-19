const xss = require('xss')

const QuestionsService = {
  getAllQuestions(db) {
    return db
      .from('askify_questions AS q')
      .select(
        'q.id AS question_id',
        'q.title AS question_title',
        'q.body AS question_body',
        'q.date_created AS date_created',
        'q.tags',
        'q.votes',
        db.raw(
          `count(DISTINCT ans) AS number_of_answers`
        ),
        db.raw(
          `json_strip_nulls(
            json_build_object(
              'user_id', usr.id,
              'user_name', usr.user_name,
              'full_name', usr.full_name,
              'date_created', usr.date_created
            )
          ) AS "user"`
        )
      )
      .leftJoin(
        'askify_answers AS ans',
        'q.id',
        'ans.question_id'
      )
      .leftJoin(
        'askify_users AS usr',
        'q.user_id',
        'usr.id'
      )
      .groupBy('q.id', 'usr.id')
  },

  getById(db, id) {
    return QuestionsService.getAllQuestions(db)
      .where('q.id', id)
      .first()
  },

  getAnswersForQuestion(db, question_id) {
    return db
      .from('askify_answers AS ans')
      .select(
        'ans.id',
        'ans.answer',
        'ans.date_created',
        'ans.votes',
        db.raw(
          `json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  usr.id AS user_id,
                  usr.user_name,
                  usr.full_name,
                  usr.date_created
              ) tmp)
            )
          ) AS "user"`
        )
      )
      .where('ans.question_id', question_id)
      .leftJoin(
        'askify_users AS usr',
        'ans.user_id',
        'usr.id'
      )
      .groupBy('ans.id', 'usr.id')
  },
  insertQuestion(db, newQuestion) {
    return db
      .insert(newQuestion)
      .into('askify_questions')
      .returning('*')
      .then(([question]) => question)
      .then(question => 
          QuestionsService.getById(db, question.id)
      )
  },
  //TODO: TEST DELETE
  deleteQuestion(db, id) {
    return db('askify_questions')
    .where({id})
    .delete()
  },
  updateQuestion(db, id, newQuestionFields) {
    return db('askify_questions')
      .where({id})
      .update(newQuestionFields)
  },
  serializeQuestion(question) {
    const { user } = question
    return {
      id: question.question_id,
      question_title: xss(question.question_title),
      question_body: xss(question.question_body),
      date_created: new Date(question.date_created),
      number_of_answers: Number(question.number_of_answers) || 0,
      votes: question.votes,
      tags: xss(question.tags),
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        full_name: user.full_name,
        date_created: new Date(user.date_created)
      },
    }
  },

  serializeQuestionAnswer(answer) {
    const { user } = answer
    return {
      id: answer.id,
      question_id: answer.question_id,
      answer: xss(answer.answer),
      date_created: new Date(answer.date_created),
      votes: answer.votes,
      user: {
        id: user.id,
        user_name: user.user_name,
        full_name: user.full_name,
        date_created: new Date(user.date_created),
        date_modified: new Date(user.date_modified) || null
      },
    }
  },
}

module.exports = QuestionsService