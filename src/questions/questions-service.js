const xss = require('xss')

const QuestionsService = {
  getAllQuestions(db) {
    return db
      .from('askify_questions AS q')
      .select(
        'q.id',
        'q.title',
        'q.date_created',
        'q.body',
        'q.tags',
        db.raw(
          `count(DISTINCT ans) AS number_of_answers`
        ),
        db.raw(
          `json_strip_nulls(
            json_build_object(
              'id', usr.id,
              'user_name', usr.user_name,
              'full_name', usr.full_name,
              'date_created', usr.date_created,
              'date_modified', usr.date_modified
            )
          ) AS "author"`
        ),
      )
      .leftJoin(
        'askify_answers AS ans',
        'q.id',
        'ans.question_id',
      )
      .leftJoin(
        'askify_users AS usr',
        'q.author_id',
        'usr.id',
      )
      .groupBy('q.id', 'usr.id')
  },

  getById(db, id) {
    return QuestionsService.getAllQuestions(db)
      .where('q.id', id)
      .first()
  },

  getAnswersForAQuestion(db, question_id) {
    return db
      .from('askify_answers AS ans')
      .select(
        'ans.id',
        'ans.text',
        'ans.date_created',
        db.raw(
          `json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  usr.id,
                  usr.user_name,
                  usr.full_name,
                  usr.date_created,
                  usr.date_modified
              ) tmp)
            )
          ) AS "user"`
        )
      )
      .where('ans.question_id', question_id)
      .leftJoin(
        'askify_users AS usr',
        'ans.user_id',
        'usr.id',
      )
      .groupBy('ans.id', 'usr.id')
  },

  serializeQuestion(question) {
    const { author } = question
    return {
      id: question.id,
      title: xss(question.title),
      content: xss(question.body),
      date_created: new Date(question.date_created),
      number_of_answers: Number(question.number_of_answers) || 0,
      author: {
        id: author.id,
        user_name: author.user_name,
        full_name: author.full_name,
        date_created: new Date(author.date_created),
        date_modified: new Date(author.date_modified) || null
      },
    }
  },

  serializeQuestionAnswer(answer) {
    const { user } = answer
    return {
      id: answer.id,
      question_id: answer.question_id,
      text: xss(answer.text),
      date_created: new Date(answer.date_created),
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