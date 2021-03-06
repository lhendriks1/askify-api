const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
          id: 1,
          user_name: 'test-user-1',
          full_name: 'Test user 1',
          password: 'Password1!',
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          date_modified: new Date('2019-02-22T16:28:32.615Z'),
        },
        {
          id: 2,
          user_name: 'test-user-2',
          full_name: 'Test user 2',
          password: 'password',
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          date_modified: null,
        },
        {
          id: 3,
          user_name: 'test-user-3',
          full_name: 'Test user 3',
          password: 'password',
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          date_modified: null,
        },
        {
          id: 4,
          user_name: 'test-user-4',
          full_name: 'Test user 4',
          password: 'password',
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          date_modified: null,
        },
      ]
}

function makeQuestionsArray(users) {
    return [
        {
          id: 1,
          title: 'First test question!',
          user_id: users[0].id,
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: '{"tag1", "tag2"}',
        },
        {
          id: 2,
          title: 'Second test question!',
          user_id: users[1].id,
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: '{"tag1", "tag2"}',
        },
        {
          id: 3,
          title: 'Third test question!',
          user_id: users[2].id,
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: '{"tag3", "tag2"}',
        },
        {
          id: 4,
          title: 'Fourth test question!',
          user_id: users[3].id,
          date_created: new Date('2019-01-22T16:28:32.615Z'),
          body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
          tags: '{}',
        },
      ]
}

function makeAnswersArray(users, questions) {
  return [
    {
      id: 1,
      answer: 'First test answer!',
      question_id: questions[0].id,
      user_id: users[0].id,
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      answer: 'Second test answer!',
      question_id: questions[0].id,
      user_id: users[1].id,
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      answer: 'Third test answer!',
      question_id: questions[0].id,
      user_id: users[2].id,
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      answer: 'Fourth test answer!',
      question_id: questions[0].id,
      user_id: users[3].id,
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      answer: 'Fifth test answer!',
      question_id: questions[questions.length - 1].id,
      user_id: users[0].id,
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      id: 6,
      answer: 'Sixth test answer!',
      question_id: questions[questions.length - 1].id,
      user_id: users[2].id,
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      id: 7,
      answer: 'Seventh test answer!',
      question_id: questions[3].id,
      user_id: users[0].id,
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
  ];
}

function makeQuestionVotesArray(users, questions) {
  return [
    {
      question_id: questions[2].id,
      user_id: users[1].id,
      vote: -1
    },
    {
      question_id: questions[2].id,
      user_id: users[0].id,
      vote: 1
    },
    {
      question_id: questions[2].id,
      user_id: users[3].id,
      vote: -1
    },
    {
      question_id: questions[1].id,
      user_id: users[0].id,
      vote: -1
    },
    {
      question_id: questions[1].id,
      user_id: users[3].id,
      vote: -1
    },
    {
      question_id: questions[3].id,
      user_id: users[2].id,
      vote: 1
    }
  ]
}


function makeAnswerVotesArray(users, answers) {
  return [
    {
      answer_id: answers[0].id,
      user_id: users[0].id,
      vote: -1
    },
    {
      answer_id: answers[0].id,
      user_id: users[1].id,
      vote: 1
    },
    {
      answer_id: answers[0].id,
      user_id: users[2].id,
      vote: 1
    },
    {
      answer_id: answers[0].id,
      user_id: users[3].id,
      vote: 1
    },
    {
      answer_id: answers[1].id,
      user_id: users[1].id,
      vote: 1
    },
    {
      answer_id: answers[1].id,
      user_id: users[2].id,
      vote: 1
    }
  ]
}

function makeExpectedQuestion(users, question, votes=[], answers=[]) {
    const user = users
      .find(user => user.id === question.user_id)
  
    const number_of_answers = answers
      .filter(ans => ans.question_id == question.id)
      .length
      .toString()

    const number_of_votes = votes
      .filter(v => v.question_id == question.id)
      .length
      .toString()
  
    const sum_of_votes = () => {
      if (!number_of_votes.length) 
        return [null];
      else {
      return votes
        .filter(v => v.question_id == question.id)
        .reduce((acc, curr) => acc + curr.vote, 0)
      }
    }

    const active_user_vote = () => {
      const voteObj = votes.filter(v => v.question_id == question.id && v.user_id == users[0].id)

      if (voteObj.length) {
        return voteObj[0]['vote']
      } else {
        return 0
      }
    }
    
    return {
      id: Number(question.id),
      question_title: question.title,
      question_body: question.body,
      date_created: question.date_created.toISOString(),
      tags: String(question.tags).replace(/[{]|[}]|[\\"]|[ ]/g, ""),
      number_of_answers: Number(number_of_answers),
      number_of_votes: Number(number_of_votes),
      sum_of_votes: sum_of_votes(),
      active_user_vote: active_user_vote(),
      user: {
        user_id: user.id,
        user_name: user.user_name,
        full_name: user.full_name,
        date_created: new Date(user.date_created).toISOString() //.slice(0, -1) + "+00:00",
      }
    }
  }

  function makeExpectedQuestionAnswers(users, questionId, answers, votes=[], ) {
    const expectedAnswers = answers
      .filter(ans => ans.question_id == questionId)
        
    return expectedAnswers.map(ans => {
      const answerUser = users.find(user => user.id === ans.user_id)

      const number_of_votes = votes
        .filter(v => v.answer_id == ans.id)
        .length
        .toString()

      const sum_of_votes = () => {
        if (!number_of_votes.length) 
          return [null];
        else {
        return votes
          .filter(v => v.answer_id == ans.id)
          .reduce((acc, curr) => acc + curr.vote, 0)
        }
      }

      const active_user_vote = () => {
        const voteObj = votes.filter(v => v.answer_id == ans.id && v.user_id == users[0].id)
  
        if (voteObj.length) {
          return voteObj[0]['vote']
        } else {
          return 0
        }
      }

      return {
        id: ans.id,
        answer: ans.answer,
        date_created: ans.date_created.toISOString(),
        number_of_votes: Number(number_of_votes),
        sum_of_votes: sum_of_votes(),
        active_user_vote: active_user_vote(),
        user: {
          user_id: answerUser.id,
          user_name: answerUser.user_name,
          full_name: answerUser.full_name,
          date_created: answerUser.date_created.toISOString(),
        }
      }
    })
  }
  
  function makeMaliciousQuestion(user) {
    const maliciousQuestion = {
      id: 911,
      date_created: new Date(),
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      user_id: user.id,
      body: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      // votes: 0,
    }

    const expectedQuestion = {
      ...makeExpectedQuestion([{...user}], maliciousQuestion),
      question_title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      question_body: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
      maliciousQuestion,
      expectedQuestion,
    }
  }

  function makeQuestionsFixtures() {
    const testUsers = makeUsersArray()
    const testQuestions = makeQuestionsArray(testUsers)
    const testQuestionVotes = makeQuestionVotesArray(testUsers, testQuestions)
    const testAnswers = makeAnswersArray(testUsers, testQuestions)
    const testAnswerVotes = makeAnswerVotesArray(testUsers, testAnswers)
    return { testUsers, testQuestions, testQuestionVotes, testAnswers, testAnswerVotes }
  }

  function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
          askify_answer_vote,
          askify_question_vote,
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

  function seedQuestionsTable(db, users, questions=[], questionVotes=[], answers=[], answerVotes=[]) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
      await seedUsers(trx, users)
      // only insert questions if there are some, also update the sequence counter
      if (questions.length) {
        await trx.into('askify_questions').insert(questions)
        // update the auto sequence to match the forced id values
        await trx.raw(
          `SELECT setval('askify_questions_id_seq', ?)`,
          [questions[questions.length - 1].id],
        )
      }
      //only insert QuestionVotes if there are some - does not use sequence count PK is user_id, question_id
      if (questionVotes.length) {
        await trx.into('askify_question_vote').insert(questionVotes)
      }
      // only insert answers if there are some, also update the sequence counter
      if (answers.length) {
        await trx.into('askify_answers').insert(answers)
        await trx.raw(
          `SELECT setval('askify_answers_id_seq', ?)`,
          [answers[answers.length - 1].id],
        )
      }

      //only insert AnswerVotes if there are some - does not use sequence count PK is user_id, answer_id
      if (answerVotes.length) {
        await trx.into('askify_answer_vote').insert(answerVotes)
      }
    })
  }


  function seedMaliciousQuestion(db, user, question) {
    return seedUsers(db, [user])
      .then(() =>
        db
          .into('askify_questions')
          .insert([question])
      )
  }

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.user_name,
      algorithm: 'HS256'
    })
    return `Bearer ${token}`
  }

  module.exports = {
    makeUsersArray,
    makeQuestionsArray,
    makeQuestionVotesArray,
    makeExpectedQuestion,
    makeExpectedQuestionAnswers,
    makeMaliciousQuestion,
    makeAnswersArray,
    makeAnswerVotesArray,
  
    makeQuestionsFixtures,
    cleanTables,
    seedQuestionsTable,
    seedMaliciousQuestion,
    makeAuthHeader,
    seedUsers,
  }


