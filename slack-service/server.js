'use strict';
require('dotenv').config()
const axios = require("axios")
const slack = require("./slack")
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const caller = (method, res) => {
    method
        .then(value => res.end(JSON.stringify(value.data)))
        .catch(reason => {
            try{
                res.end(JSON.stringify(reason))
            }catch (err){
                res.end(JSON.stringify(reason.info))
            }
        })
}

const decode = Buffer.from(process.env.SLACK_TOKEN, 'base64').toString('ascii').trim()

const slacker = (api,channel,timestamp,text)=>{
    axios.post('https://slack.com/api/'+api, {
        channel: channel,
        thread_ts: timestamp,
        text: text
    },{
        headers: {
            Authorization: `Bearer ${decode}`  //the token is a variable which holds the token
        }
    })
        .then(value => console.log(JSON.stringify(value.data)))
        .catch(reason => console.log(JSON.stringify(reason)))
}
const message1=`
Slack Overflow thinks the best answer is:
If you verified you have mvn installed in the ~/blt/tools/maven directory then you problem is the PATH is not set, so run this command in terminal any directory : alias mvn='~/blt/tools/maven/apache-maven-3.5.4/bin/mvn'
If this does not work, you will want to add the PATH to your environment by adding the following to your ~/.bash_profile
export M2_HOME=~/blt/tools/maven/apache-maven-3.5.4
export MAVEN_HOME=$M2_HOME
export M2=$M2_HOME/bin
export MAVEN_OPTS="-Xms256m -Xmx512m"
export PATH=$M2:$PATH
Run source .bash_profile* *to make the changes take effect.
QUIP DOC: https://salesforce.quip.com/C9NEAh1NwqRS#UCVACA7bgZB
SLACK THREAD: https://communityclou-xg57906.slack.com/archives/C01AP6EQ3U1/p1599693559012700?thread_ts=1599675195.003100&cid=C01AP6EQ3U1
`
const message=`
Slack Overflow can't find an answer to your question :sob:
But it's been posted to the quip! 
https://quip.com/QetTA2aiF3St/Questions#MENACAYjGqC
`
slacker("chat.postMessage","C01AP6EQ3U1","1599696939.017500", message)



app.post('/postMessage', (req, res) => {
    const data = req.body
    if (!data)
        res.end("Invalid body"); //invalid body
    caller(slack.postMessage(data.channel,data.text,data.timestamp),res)
})

app.get("/conversationHistory/:channel", (req, res) => {
    caller(slack.conversationHistory(req.params.channel),res)
})

app.get("/conversationReplies/:channel/:timestamp", (req, res) => {
    caller(slack.conversationsReplies(req.params.channel,req.params.timestamp),res)
})

const server = app.listen(2020, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});

// setTimeout(()=>{
//
// })