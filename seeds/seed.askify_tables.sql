BEGIN;

TRUNCATE
    askify_answers,
    askify_questions,
    askify_users
    RESTART IDENTITY CASCADE;

INSERT INTO askify_users (full_name, user_name, password, date_created, date_modified)
VALUES
    ('Test user 1', 'test-user-1', 'Password1!', '2019-06-22T16:28:32.615Z', '2019-06-22T16:28:32.615Z'),
    ('Test user 2', 'test-user-2', 'Password1!', '2019-08-22T16:28:32.615Z', null),
    ('Test user 3', 'test-user-3', 'Password1!', '2019-10-22T16:28:32.615Z', null),
    ('Test user 4', 'test-user-4', 'Password1!', '2019-12-22T16:28:32.615Z', '2019-07-22T16:28:32.615Z');

INSERT INTO askify_questions (title, body, tags, date_created, votes, user_id)
VALUES
    ('First test question!', 
     'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag1', 'tag2'], '2019-01-20T16:28:32.615Z', 2, 1),
    ('Second test question!',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag1', 'tag3'], '2019-01-22T16:28:32.615Z', 0, 1),
    ('Third test question!',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag2'], '2019-02-18T16:28:32.615Z', 5, 3),
    ('Fourth test question!',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag5'], '2019-05-09T16:28:32.615Z', 8, 2),
    ('Fifth test question!',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag3'], '2019-02-12T16:28:32.615Z', 1, 2),
    ('Sixth test question!',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag3'], '2019-08-01T16:28:32.615Z', 0, 4),
    ('Seventh test question!',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag3'], '2019-02-21T16:28:32.615Z', 2, 4),
    ('Eigth test question!',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      ARRAY ['tag2'], '2019-04-20T16:28:32.615Z', 3, 1);

INSERT INTO askify_answers (answer, date_created, question_id, user_id, votes)
VALUES
    ('First test answer', '2019-01-21T16:28:32.615Z', 1, 2, 5),
    ('Second test answer', '2019-01-22T16:28:32.615Z', 1, 3, 2),
    ('Third test answer', '2019-01-23T16:28:32.615Z', 1, 1, 0),
    ('Fourth test answer', '2019-01-23T16:28:32.615Z', 2, 1, 2),
    ('Fifth test answer', '2019-01-24T16:28:32.615Z', 2, 4, 8),
    ('Sixth test answer', '2019-02-19T16:28:32.615Z', 3, 4, 8),
    ('Seventh test answer', '2019-03-21T12:28:32.615Z', 3, 4, 1),
    ('Eigth test answer', '2019-05-09T18:28:32.615Z', 4, 2, 3),
    ('Ninth test answer', '2019-02-13T16:28:32.615Z', 5, 2, 3),
    ('Tenth test answer', '2019-08-02T16:28:32.615Z', 6, 2, 3),
    ('Eleventh test answer', '2019-04-20T12:28:32.615Z', 7, 2, 3),
    ('Twelfth test answer', '2019-02-23T16:28:32.615Z', 7, 1, 3),
    ('Thirteenth test answer', '2019-02-28T16:28:32.615Z', 7, 1, 3),
    ('Fourteenth test answer', '2019-04-22T12:28:32.615Z', 8, 1, 3);

INSERT INTO askify_question_vote (question_id, user_id, vote)
VALUES
(2, 1, 1),
(2, 3, 1),
(1, 2, -1),
(1, 3, -1), 
(1, 4, -1),
(3, 1, -1),
(3, 2, 1), 
(3, 4, 1), 
(4, 1, -1);

COMMIT;












