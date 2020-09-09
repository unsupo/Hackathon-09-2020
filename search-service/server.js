'use strict';
const express = require('express');
const app = express();
const search = require('./search')
const check_connection = require("./check-connection")
const db = require("./db")
const bodyParser = require('body-parser');
const axios = require("axios")

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const subCaller = (method, res) =>
    method
        .then(value => res.end(JSON.stringify(value)))
        .catch(reason => res.end(JSON.stringify(reason)))

const axioSubCaller = (path, data,res) =>
    axios.post('http://localhost:3030/'+path,data)
        .then(value => res.end(JSON.stringify(value.data)))
        .catch(reason => res.end(JSON.stringify(reason)))

const caller = (method, res) => {
    check_connection.checkConnection('localhost','3030')
        .then(()=>{
            // forward request to db service
            // and upload all sqlite stored objects to db service
            console.log('server up')
            res.end()
        }, err =>{
            // save to local sqlite
            // console.log('server down')
            subCaller(method,res)
        })
}

/**
 * expects in the query parameters
 * /search?q=something
 */
app.get('/search', (req, res) => {
    check_connection.checkConnection('localhost','3030')
        .then(()=>{
            axios.get('http://localhost:3030/'+'questions', {params: req.query})
                .then(value => res.end(JSON.stringify(value.data)))
                .catch(reason => res.end(JSON.stringify(reason)))
        }, err => {
            // save to local sqlite
            // console.log('server down')
            db.getAllQuestions().then(data => res.send(search.search(data, ['question'], req.query.q)))
        })
})
/** expects in the body
 * {
 *     question: ''
 *     link: ''
 *     answers: [{
 *         answer: '',
 *         emoji_count: '',
 *         answer_link: ''
 *     }]
 * }
 * if db service is down then it'll save it as a local
 * sqlite db and bulk insert it into the db service when it comes up
 */
app.post('/store',(req, res) => {
    const data = req.body
    if(!data)
        res.end("Invalid body"); //invalid body
    // caller(db.addQuestionAndAnswers(data),res)
    check_connection.checkConnection('localhost','3030')
        .then(()=>{
            // forward request to db service
            // and upload all sqlite stored objects to db service
            axioSubCaller('store',data,res)
        }, err =>{
            // save to local sqlite
            // console.log('server down')
            subCaller(db.addQuestionAndAnswers(data),res)
        })
})

app.get("/question", (req, res) => {
    // caller(new Promise((resolve, reject) => {
    //     if(req.query.hasOwnProperty('id'))
    //         resolve(subCaller(db.getAllQuestionsBy('id',req.query.id),res))
    //     else if(req.query.hasOwnProperty('link'))
    //         resolve(subCaller(db.getQuestionByLink(req.query.link),res))
    //     else
    //         reject("No id or link in query params")
    // }),res)
    check_connection.checkConnection('localhost', '3030')
        .then(()=>{
            // forward request to db service
            // and upload all sqlite stored objects to db service
            axios.get('http://localhost:3030/'+'question', {params: req.query})
                .then(value => res.end(JSON.stringify(value.data)))
                .catch(reason => res.end(JSON.stringify(reason)))
        }, err =>{
            // save to local sqlite
            // console.log('server down')
            if(req.query.hasOwnProperty('id'))
                subCaller(db.getAllQuestionsBy('id',req.query.id),res)
            else if(req.query.hasOwnProperty('link'))
                subCaller(db.getQuestionByLink(req.query.link),res)
            else
                res.end("No link or id in query params")
        })
})
app.get("/answer", (req, res) => {
    // caller(new Promise((resolve, reject) => {
    //     if(req.query.hasOwnProperty('questionId'))
    //         resolve(subCaller(db.getAnswerByQuestionId(req.query.link),res))
    //
    // }),res)
    check_connection.checkConnection('localhost', '3030')
        .then(()=>{
            // forward request to db service
            // and upload all sqlite stored objects to db service
            axios.get('http://localhost:3030/'+'answer', {params: req.query})
                .then(value => res.end(JSON.stringify(value.data)))
                .catch(reason => res.end(JSON.stringify(reason)))
        }, err =>{
            // save to local sqlite
            // console.log('server down')
            if(req.query.hasOwnProperty('questionId'))
                subCaller(db.getAnswerByQuestionId(req.query.link),res)
            else
                res.end("No questionId in query params")
        })
})

const server = app.listen(8081, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});