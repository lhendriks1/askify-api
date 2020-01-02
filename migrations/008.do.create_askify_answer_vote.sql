DROP TABLE IF EXISTS askify_answer_vote;

CREATE TABLE askify_answer_vote (
    answer_id INT NOT NULL REFERENCES askify_answers(id),
    user_id INT NOT NULL REFERENCES askify_users(id),
    vote SMALLINT CHECK (vote = 1 OR vote = -1),
    PRIMARY KEY (answer_id, user_id)
)
