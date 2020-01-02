ALTER TABLE askify_questions
    DROP COLUMN IF EXISTS user_id;

DROP TABLE IF EXISTS askify_users;