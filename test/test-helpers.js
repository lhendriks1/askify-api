const bcrypt = require('bcryptjs')

function makeUsersArray() {
    return [
        {
          id: 1,
          user_name: 'test-user-1',
          full_name: 'Test user 1',
          password: 'password',
          date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
          id: 2,
          user_name: 'test-user-2',
          full_name: 'Test user 2',
          password: 'password',
          date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
          id: 3,
          user_name: 'test-user-3',
          full_name: 'Test user 3',
          password: 'password',
          date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
          id: 4,
          user_name: 'test-user-4',
          full_name: 'Test user 4',
          password: 'password',
          date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
      ]
}

function makeQuestionsArray(users) {
    return [
        {
          id: 1,
          q_title: 'First test post!',
          author_id: users[0].id,
          date_created: new Date('2029-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: ['tag 1', 'tag2']
        },
        {
          id: 2,
          q_title: 'Second test post!',
          author_id: users[1].id,
          date_created: new Date('2029-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: ['tag2', 'tag1']
        },
        {
          id: 3,
          q_title: 'Third test post!',
          author_id: users[2].id,
          date_created: new Date('2029-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: ['tag2', 'tag1']
        },
        {
          id: 4,
          q_title: 'Fourth test post!',
          author_id: users[3].id,
          date_created: new Date('2029-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: []
        },
      ]

      function makeAnswerssArray(users, questions) {
        return [
          {
            id: 1,
            text: 'First test answer!',
            question_id: questions[0].id,
            user_id: users[0].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            votes: 3,
          },
          {
            id: 2,
            text: 'Second test answer!',
            question_id: questions[0].id,
            user_id: users[1].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            votes: 2,
          },
          {
            id: 3,
            text: 'Third test answer!',
            question_id: questions[0].id,
            user_id: users[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            votes: 0,
          },
          {
            id: 4,
            text: 'Fourth test answer!',
            question_id: questions[0].id,
            user_id: users[3].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            votes: 1,
          },
          {
            id: 5,
            text: 'Fifth test answer!',
            question_id: questions[questions.length - 1].id,
            user_id: users[0].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            votes: 2,
          },
          {
            id: 6,
            text: 'Sixth test answer!',
            questions_id: questions[questions.length - 1].id,
            user_id: users[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            votes: 4
          },
          {
            id: 7,
            text: 'Seventh test answer!',
            question_id: questions[3].id,
            user_id: users[0].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            votes: 0,
          },
        ];
      }

}

function makeExpectedQuestion(users, question, answers=[]) {
    const author = users
      .find(user => user.id === question.author_id)
  
    const number_of_answers = answers
      .filter(ans => ans.question_id === question.id)
      .length
  
    return {
      id: question.id,
      title: question.title,
      body: question.body,
      date_created: question.date_created.toISOString(),
      number_of_answers,
      author: {
        id: author.id,
        user_name: author.user_name,
        full_name: author.full_name,
        date_created: author.date_created.toISOString(),
        date_modified: author.date_modified || null,
      },
    }
  }

  function makeExpectedQuestionAnswers(users, questionId, answers) {
    const expectedAnswers = answers
      .filter(ans => ans.question_id === questionId)
  
    return expectedAnswers.map(ans => {
      const answerUser = users.find(user => user.id === ans.user_id)
      return {
        id: ans.id,
        text: ans.text,
        date_created: answer.date_created.toISOString(),
        user: {
          id: answerUser.id,
          user_name: answerUser.user_name,
          full_name: answerUser.full_name,
          date_created: answerUser.date_created.toISOString(),
          date_modified: answerUser.date_modified || null,
        }
      }
    })
  }
  
  function makeMaliciousQuestion(user) {
    const maliciousQuestion = {
      id: 911,
      date_created: new Date(),
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      author_id: user.id,
      body: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedQuestion = {
      ...makeExpectedQuestion([user], maliciousQuestion),
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      body: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
      maliciousQuestion,
      expectedQuestion,
    }
  }

  function makeQuestionsFixtures() {
    const testUsers = makeUsersArray()
    const testQuestions = makeQuestionsArray(testUsers)
    const testAnswers = makeAnswersArray(testUsers, testQuestions)
    return { testUsers, testQuestions, testAnswers }
  }

  function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
          askify_questions,
          askify_users,
          askify_answers
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE askify_questions_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE askify_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE askify_answers_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('askify_questions_id_seq', 0)`),
          trx.raw(`SELECT setval('askify_users_id_seq', 0)`),
          trx.raw(`SELECT setval('askify_answers_id_seq', 0)`),
        ])
      )
    )
  }

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('askify_users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('askify_users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
  }

  function seedQuestionsTables(db, users, questions, answers[]) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('askify_questions').insert(questions)
      // update the auto sequence to match the forced id values
      await trx.raw(
        `SELECT setval('askify_questions_id_seq', ?)`,
        [questions[questions.length - 1].id],
      )
      // only insert answers if there are some, also update the sequence counter
      if (answers.length) {
        await trx.into('askifyl_answers').insert(answers)
        await trx.raw(
          `SELECT setval('askify_answers_id_seq', ?)`,
          [answers[answers.length - 1].id],
        )
      }
    })
  }


  function seedMaliciousQuestion(db, user, question) {
    return seedUsers(db, [user])
      .then(() =>
        db
          .into('askify_questions')
          .insert([questions])
      )
  }

  function makeAuthHeader(user) {
    const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
    return `Basic ${token}`
  }

  module.exports = {
    makeUsersArray,
    makeQuestionsArray,
    makeExpectedQuestion,
    makeExpectedQuestionAnswers,
    makeMaliciousQuestion,
    makeAnswersArray,
  
    makeQuestionsFixtures,
    cleanTables,
    seedQuestionsTables,
    seedMaliciousQuestion,
    makeAuthHeader,
    seedUsers,
  }


