const xss = require('xss')

const QuestionsService = {
  getAllQuestions(db, activeUserId) {
    return db
      .from('askify_questions AS q')
      .select(
      'q.id AS question_id',
      'q.title AS question_title',
      'q.body AS question_body',
      'q.date_created AS date_created',
      'q.tags',
        db.raw(
          `count(DISTINCT ans) AS number_of_answers`
        ),
        db.raw(
          `count(DISTINCT usr_vote) AS number_of_votes`
        ),
        db.raw(
          `(SELECT sum(vote) FROM askify_question_vote WHERE question_id = q.id GROUP BY question_id) AS sum_of_votes`
         ),
         db.raw(
           `(SELECT vote FROM askify_question_vote WHERE question_id = q.id AND user_id = ${activeUserId}) AS active_user_vote`
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
        'askify_question_vote AS usr_vote',
        'q.id',
        'usr_vote.question_id'
      )
      .leftJoin(
        'askify_users AS usr',
        'q.user_id',
        'usr.id'
      )
      .groupBy('q.id', 'usr.id')
  },

  getById(db, id, activeUserId) {
    return QuestionsService.getAllQuestions(db, activeUserId)
      .where('q.id', id)
      .first()
  },

  getAnswersForQuestion(db, question_id, activeUserId) {
    return db
      .from('askify_answers AS ans')
      .select(
        'ans.id',
        'ans.answer',
        'ans.date_created',
        db.raw(
          `count(DISTINCT ans_vote) AS number_of_votes`
          ),
          db.raw(
          `(SELECT sum(vote) FROM askify_answer_vote WHERE answer_id = ans.id GROUP BY answer_id) AS sum_of_votes`
          ),
          db.raw(
              `(SELECT vote FROM askify_answer_vote WHERE answer_id = ans.id AND user_id = ${activeUserId}) AS active_user_vote`
          ),
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
        'askify_answer_vote AS ans_vote',
        'ans.id',
        'ans_vote.answer_id'
      )
      .leftJoin(
        'askify_users AS usr',
        'ans.user_id',
        'usr.id'
      )
      .groupBy('ans.id', 'usr.id')
  },
  insertQuestion(db, newQuestion, user_id) {
    return db
      .insert(newQuestion)
      .into('askify_questions')
      .returning('*')
      .then(([question]) => question)
      .then(question => 
        QuestionsService.getById(db, question.id, question.user_id)
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
      number_of_votes: Number(question.number_of_votes) || 0,
      sum_of_votes: Number(question.sum_of_votes) || 0,
      active_user_vote: Number(question.active_user_vote) || 0,
      tags: xss(question.tags),
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        full_name: user.full_name,
        user_vote: user.user_vote,
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
      number_of_votes: Number(answer.number_of_votes) || 0,
      sum_of_votes: Number(answer.sum_of_votes) || 0,
      active_user_vote: Number(answer.active_user_vote) || 0,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        full_name: user.full_name,
        date_created: new Date(user.date_created),
      },
    }
  },
}

module.exports = QuestionsService