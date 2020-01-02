DROP TABLE IF EXISTS askify_question_vote;

CREATE TABLE askify_question_vote (
    question_id INT NOT NULL REFERENCES askify_questions(id),
    user_id INT NOT NULL REFERENCES askify_users(id),
    vote SMALLINT NOT NULL CHECK (vote = 1 OR vote = -1),
    PRIMARY KEY (question_id, user_id)
)
