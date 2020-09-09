'use strict';
require('dotenv').config()
const axios = require("axios")
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

axios.get('https://slack.com/api/conversations.list', {
    headers: {
        Authorization: 'Bearer ' + process.env.SLACK_TOKEN //the token is a variable which holds the token
    }
})
    .then(value => console.log(JSON.stringify(value.data)))
    .catch(reason => console.log(JSON.stringify(reason)))

app.post('/aPost',(req, res) => {})

app.get("/aGet", (req, res) => {})

const server = app.listen(2020, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});