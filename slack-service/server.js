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

// curl -X GET -H 'Authorization: Bearer xoxb-1338166611318-1344916244226-Zs3rMm9sfX2npXwvSEqsPKI7'
const token = "xoxb-1338166611318-1344916244226-Zs3rMm9sfX2npXwvSEqsPKI7"
axios.get('https://slack.com/api/conversations.list', {
    headers: {
        Authorization: 'Bearer ' + token //the token is a variable which holds the token
    }
})
    .then(value => res.end(JSON.stringify(value.data)))
    .catch(reason => res.end(JSON.stringify(reason)))

app.post('/aPost',(req, res) => {})

app.get("/aGet", (req, res) => {})

const server = app.listen(2020, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});