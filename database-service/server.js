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
        .catch(reason => res.end(JSON.stringify(reason)))
}

app.post('/newDocument',(req, res) =>
    // caller(quip.newDocument(req.body.title, req.body.content),res)
    caller(quip.newDocument(req.body.title, req.body.content),res)
)

app.post('/store',(req, res) => {
    const data = req.body
    if (!data || Object.keys(data).length === 0)
        res.end("Invalid body"); //invalid body
    caller(db.addQuestionAndAnswers(data),res)
});
app.get("/question", (req, res) => {
    if(req.query.hasOwnProperty('id'))
        caller(db.getAllQuestionsBy('id',req.query.id),res)
    else if(req.query.hasOwnProperty('link'))
        caller(db.getQuestionByLink(req.query.link),res)
    else
        res.end("No link or id in query params")
})

app.get("/answer", (req, res) => {
    if(req.query.hasOwnProperty('questionId'))
        caller(db.getAnswerByQuestionId(req.query.link),res)
    else
        res.end("No questionId in query params")
})

const server = app.listen(3030, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});