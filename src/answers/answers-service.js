const xss = require('xss')

const AnswersService = {
    getById(db, id) {
        return db
            .from('askify_answers AS ans')
            .select(
                'ans.id',
                'ans.answer',
                'ans.date_created',
                'ans.question_id',
                'votes',
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
            'askify_users AS usr',
            'ans.user_id',
            'usr.id'
        )
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
                AnswersService.getById(db, answer.id)
            )
    },
    serializeAnswer(answer) {
        const { user } = answer 
        return {
            id: answer.id,
            answer: xss(answer.answer),
            question_id: answer.question_id,
            date_created: new Date(answer.date_created),
            votes: answer.votes,
            user: {
                id: user.id,
                user_name: user.user_name,
                full_name: user.full_name,
                date_created: new Date(user.date_created)
            }



        }
    }
}

module.exports = AnswersService