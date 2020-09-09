const fs = require('fs')
const Sequelize = require("sequelize");
// sqlite db if database-service is down
const force = false // set back to false to not lose data on restart
const db_dir = "./sqlite_db"
const db = 'search.db'
const get_sqlite_dir = () => {
    if (!fs.existsSync(db_dir))
        fs.mkdirSync(db_dir)
    return db_dir;
}
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${get_sqlite_dir()}/${db}`
});

const Question = sequelize.define('question', {
        question: {type: Sequelize.STRING},
        link: {type: Sequelize.STRING, unique: true },
    },{
        freezeTableName: true
    }
);
const Answer = sequelize.define('answer',{
    answer: { type: Sequelize.STRING },
    link: { type: Sequelize.STRING, unique: true },
    emoji_count:{
        type: Sequelize.INTEGER,
        default: 0
    }
})
Question.hasMany(Answer, { foreignKey: 'questionId' })
Answer.belongsTo(Question)
Question.sync({force: force}).then(value => console.log("Question Table created"))
Answer.sync({force: force}).then(value => console.log("Answer Table created"))

/**
 * A question looks like this
 * {
        "question": "testing",
        "link": "blah",
        "answers": [
            {
                "answer": "answer",
                "link": "blahblah",
                "emoji_count": 10,
            }
        ]
    }
 *  However an answer to a question is allowed
 *  only if you include the questionId
 *  {
 *      "questionId": "32",
        "answer": "answer",
        "link": "blahblah"
 *
 *  }
 * @param question
 */
module.exports.addQuestionAndAnswers = (question) =>{
    return new Promise((resolve, reject) => {
        if (question.hasOwnProperty('question'))
            Question.create({
                question: question.question,
                link: question.link
            }).then(q => {
                if (question.hasOwnProperty('answers')) {
                    let answers = question.answers;
                    if (!question.answers instanceof Array)
                        answers = [question.answers]
                    answers.forEach(answer => {
                        _addAnswer(answer, q.id)
                    })
                }
                resolve(q)
            }).catch(reason => reject(reason))
        else if (question.hasOwnProperty('answer')) {
            if (question.hasOwnProperty('questionId'))
                resolve(_addAnswer(question, question.questionId))
        }else
            reject(undefined)
    })
}
module.exports.getAnswerByQuestionId = (questionId) => Answer.findAll({where: {questionId: questionId}})
module.exports.getAllQuestions = () => Question.findAll()

module.exports.getAllQuestionsBy = (key, value) =>{
    const where={}
    where[key]=value
    return Question.findAll({where: where})
}

module.exports.getQuestionByLink = (link) =>{
    return Question.findAll({where:{link: link}})
}

const _addAnswer = (answer, questionId) =>{
    Answer.create({
        answer: answer.answer,
        link: answer.link,
        questionId: questionId
    }).then(a => { return a; })
}
module.exports.addAnswer = _addAnswer;

