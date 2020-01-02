const xss = require('xss')

const AnswersService = {
    getById(db, id, activeUserId) {
        return db
            .from('askify_answers AS ans')
            .select(
                'ans.id',
                'ans.answer',
                'ans.date_created',
                'ans.question_id',
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
                                    usr.id,
                                    usr.user_name,
                                    usr.full_name,
                                    usr.date_created
                            ) tmp)
                        )
                ) AS "user"`
            )
        )
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
        .where('ans.id', id)
        .first()
    },
    insertAnswer(db, newAnswer) {
        return db
            .insert(newAnswer)
            .into('askify_answers')
            .returning('*')
            .then(([answer]) => answer)
            .then(answer => 
                AnswersService.getById(db, answer.id, answer.user_id)
            )
    },
    updateAnswer(db, id, newAnswerFields) {
        return db('askify_answers')
          .where({id})
          .update(newAnswerFields)
      },
    serializeAnswer(answer) {
        const { user } = answer 
        return {
            id: answer.id,
            answer: xss(answer.answer),
            question_id: answer.question_id,
            date_created: new Date(answer.date_created),
            number_of_votes: Number(answer.number_of_votes),
            sum_of_votes: Number(answer.sum_of_votes),
            active_user_vote: Number(answer.active_user_vote),
            user: {
                user_id: user.id,
                user_name: user.user_name,
                full_name: user.full_name,
                date_created: new Date(user.date_created)
            }



        }
    }
}

module.exports = AnswersService