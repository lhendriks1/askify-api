ALTER TABLE askify_questions
    DROP COLUMN IF EXISTS author_id;

DROP TABLE IF EXISTS askify_users;