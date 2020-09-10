'use strict';
require('dotenv').config()
const express = require('express');
const app = express();
const quip = require('./db/quip')
const db = require('./db/db')

const bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const caller = (method, res) => {
    method
        .then(value => res.end(JSON.stringify(value)))
        .catch(reason => {
            try{
                res.end(JSON.stringify(reason))
            }catch (err){
                res.end(JSON.stringify(reason.info))
            }
        })
}
// test for quip
app.post('/document',(req, res) => {
    caller(quip.document(req.body.title,req.body.content),res)
})

// test for quip
app.get("/thread",(req, res) => {
    caller(quip.getThread(req.query.id),res)
})
/**
 * Add a question to the database
 * POST /question
 [{
        "question": "q1",
        "link": "lq1",
        "answers": [
            {
                "answer": "a11",
                "link": "la11",
                "emoji_count": 10
            },
            {
                "answer": "a12",
                "link": "la12"
            }
        ]
    },{
        "question": "q2",
        "link": "lq2",
        "answers": [
            {
                "answer": "a21",
                "link": "la21",
                "emoji_count": 10
            },
            {
                "answer": "a22",
                "link": "la22"
            }
        ]
    }
 ]
 */
app.post('/question',(req, res) => {
    const data = req.body
    if (!data || Object.keys(data).length === 0)
        res.end("Invalid body"); //invalid body
    caller(db.addQuestionAndAnswers(data),res)
});
/**
 * Get a question by id or link
 * GET /question?{id=:id,link=:link}
 */
app.get("/question", (req, res) => {
    if(req.query.hasOwnProperty('id'))
        caller(db.getAllQuestionsBy('id',req.query.id),res)
    else if(req.query.hasOwnProperty('link'))
        caller(db.getQuestionByLink(req.query.link),res)
    else
        caller(db.getAllQuestions(),res)
})
/**
 * Get all answers based off a questionId (use /question endpoint to get the questionId)
 * GET /answer/:questionId
 */
app.get("/answer/:questionId", (req, res) => {
   caller(db.getAnswerByQuestionId(req.params.questionId),res)
})
/**
 * Add a question to the database
 * POST /answer/:questionId
 * [
 *      {
            "answer": "a21",
            "link": "la21",
            "emoji_count": 10
        },
        {
            "answer": "a22",
            "link": "la22"
        }
 * ]
 */
app.post("/answer/:questionId",(req, res) => {
    const data = req.body
    if (!data || Object.keys(data).length === 0)
        res.end("Invalid body"); //invalid body
    caller(db.addAnswers(data, req.params.questionId),res)
})

const server = app.listen(3030, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});