CREATE TABLE askify_question_vote (
    question_id INT NOT NULL REFERENCES askify_questions(id),
    user_id INT NOT NULL REFERENCES askify_users(id),
    vote SMALLINT CHECK (vote = 1 OR vote = -1 OR vote = 0),
    PRIMARY KEY (question_id, user_id)
);


CREATE TABLE askify_answer_vote (
    answer_id INT NOT NULL REFERENCES askify_answers(id),
    user_id INT NOT NULL REFERENCES askify_users(id),
    vote SMALLINT CHECK (vote = 1 OR vote = -1 OR vote = 0),
    PRIMARY KEY (answer_id, user_id)
);
