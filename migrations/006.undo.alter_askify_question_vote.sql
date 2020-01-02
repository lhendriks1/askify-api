ALTER TABLE askify_question_vote
    DROP COLUMN vote;

ALTER TABLE askify_question_vote
    ADD COLUMN vote SMALLINT NOT NULL CHECK (vote = 1 OR vote = -1),
