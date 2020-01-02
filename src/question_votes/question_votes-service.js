const QuestionVotesService = {
    getAllVoteHistory(db, active_user_id) {
        return db
            .from('askify_question_vote AS v')
            .select(
                'v.question_id',
                'v.user_id',
                'v.vote'
            )
            .where('v.user_id', active_user_id)
    },

    getQuestionVote(db, question_id, active_user_id) {
        return QuestionVotesService.getAllVoteHistory(db, active_user_id)
        .where('v.question_id', question_id)
        .first()
    },

    postQuestionVote(db, newVote) {
        return db('askify_question_vote')
            .insert(newVote)
            .returning('*')
            .then(vote =>
                QuestionVotesService.getQuestionVote(db, vote[0].question_id, vote[0].user_id)
            )
    },

    updateQuestionVote(db, question_id, user_id, vote) {
        return db('askify_question_vote')
            .where({question_id})
            .andWhere({user_id})
            .update({vote})
    }
}

module.exports = QuestionVotesService