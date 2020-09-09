'use strict';
require('dotenv').config()
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/newDocument',(req, res) =>
    // caller(quip.newDocument(req.body.title, req.body.content),res)
    caller(quip.newDocument(req.body.title),res)
)

app.get("/question", (req, res) => {
    // if(req.query.hasOwnProperty('id'))

    axios.get('http://localhost:3030/'+'questions', {params: req.query})
        .then(value => res.end(JSON.stringify(value.data)))
        .catch(reason => res.end(JSON.stringify(reason)))
})

const server = app.listen(3030, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});