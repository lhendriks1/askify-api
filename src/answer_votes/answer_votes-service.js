const AnswerVotesService = {
    getAllVoteHistory(db, active_user_id) {
        return db
            .from('askify_answer_vote AS a')
            .select(
                'a.answer_id',
                'a.user_id',
                'a.vote'
            )
            .where('a.user_id', active_user_id)
    },

    getAnswerVote(db, answer_id, active_user_id) {
        return AnswerVotesService.getAllVoteHistory(db, active_user_id)
        .where('a.answer_id', answer_id)
        .first()
    },

    postAnswerVote(db, newVote) {
        return db('askify_answer_vote')
            .insert(newVote)
            .returning('*')
            .then(vote =>
                AnswerVotesService.getAnswerVote(db, vote[0].answer_id, vote[0].user_id)
            )
    },

    updateAnswerVote(db, answer_id, user_id, vote) {
        return db('askify_answer_vote')
            .where({answer_id})
            .andWhere({user_id})
            .update({vote})
    }
}

module.exports = AnswerVotesService