
const fs = require('fs')
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
// sqlite db if database-service is down
const force = false // set back to false to not lose data on restart
const db_dir = "./sqlite_db"
const db = 'search.db'
const get_sqlite_dir = () => {
    if (!fs.existsSync(db_dir))
        fs.mkdirSync(db_dir)
    return db_dir;
}
const sqlite_options = {
    dialect: 'sqlite',
    storage: `${get_sqlite_dir()}/${db}`
}
const get_sequelize_options = () =>{
    if(process.env.DB === 'sqlite')
        return sqlite_options
}
const sequelize = new Sequelize(get_sequelize_options());

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
const QUIP_DATA = sequelize.define('quip_data',{
    doc_name: { type: Sequelize.STRING, unique: true },
    doc_id: { type: Sequelize.STRING, unique: true },
    doc_link: { type: Sequelize.STRING, unique: true },
    html: { type: Sequelize.STRING },
})

Question.hasMany(Answer, { foreignKey: 'questionId' })
Answer.belongsTo(Question)
Question.sync({force: force}).then(value => console.log("Question Table created"))
Answer.sync({force: force}).then(value => console.log("Answer Table created"))
QUIP_DATA.sync({force: force}).then(value => console.log("QUIP_DATA Table created"))
module.exports.addQuipDoc = (title, id, link, html) =>
    QUIP_DATA.create({
        doc_name: title,
        doc_id: id,
        doc_link: link,
        html: html
    })

module.exports.getQuipDocById = (id) => QUIP_DATA.findOne({where:{[Op.or]:[{doc_link: id},{doc_id: id}]}})
module.exports.getAllQuipDocsByTitle = (title) => QUIP_DATA.findAll({where: {doc_name: title}})
module.exports.QUIP_DATA = QUIP_DATA
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
 *  An answer to a question is allowed
 *  only if you include the questionId
 *  {
 *      "questionId": "32",
        "answer": "answer",
        "link": "blahblah"
 *
 *  }
 * @param question
 */
module.exports.addQuestionAndAnswers = (question) => {
    let questions = question;
    if (!questions instanceof Array)
        questions = [questions]
    const qs = []
    questions.forEach(q=>qs.push(createQuestionAndAnswer(q)))
    return Promise.all(qs)
}
const createQuestionAndAnswer = (question) => new Promise((resolve, reject) => {
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
    } else
        reject(undefined)
})
module.exports.getAnswerByQuestionId = (questionId) => Answer.findAll({where: {questionId: questionId}})
module.exports.getAllQuestions = () => Question.findAll({
    include:[
        {
            model: Answer
        }
    ]
})

module.exports.getAllQuestionsBy = (key, value) =>{
    const where={}
    where[key]=value
    return Question.findAll({where: where, include:[
            {
                model: Answer
            }
        ]})
}

module.exports.getQuestionByLink = (link) =>{
    return Question.findAll({where:{link: link}, include:[
            {
                model: Answer
            }
        ]})
}

const _addAnswer = (answer, questionId) =>
    Answer.create({
        answer: answer.answer,
        link: answer.link,
        emoji_count: answer.emoji_count | 0,
        questionId: questionId
    })
module.exports.addAnswers = (answer, questionId) => {
    let answers = answer;
    if (!answers instanceof Array)
        answers = [answers]
    const qs = []
    answers.forEach(q=>qs.push(_addAnswer(q, questionId)))
    return Promise.all(qs)
}

