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
        .then(value => res.end(JSON.stringify(value.hasOwnProperty("data") ? value.data : value)))
        .catch(reason => {
            try{
                res.end(JSON.stringify(reason))
            }catch (err){
                res.end(JSON.stringify(reason.info))
            }
        })
}

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

app.get("/conversationsAndReplies/:channel", (req, res) => {
    caller(slack.getAllMessages(req.params.channel),res)
})



// const server = app.listen(2020, function () {
//     const host = server.address().address;
//     const port = server.address().port;
//     console.log("Example app listening at http://%s:%s", host, port)
// });

// setTimeout(()=>{
//     slack.getAllMessages("C01AP6EQ3U1").then(value =>
//         axios.post('http://localhost:3030/question',value)
//             .then(value1 => console.log("posting data"))
//     )
// }, 1000)
const noAnswersMessage = `Slack Overflow can't find an answer to your question :sob:
But it's been posted to the quip!`
const yesAnswerMessage = "Slack Overflow found this answer:\n\n{A}\n\nSLACK LINK: {S}"
setInterval(()=>{
    console.log('answering')
    slack.conversationHistory("C01AP6EQ3U1").then(value => {
        const lastMessage = value.data.messages[0]
        // if the last posted message has no replies
        if(!(lastMessage.hasOwnProperty("reply_count") && lastMessage.reply_count > 0))
            axios.get('http://localhost:8081/search', {params: {q: lastMessage.text}})
                .then(value1 =>{
                    if(value1.data && value1.data.length > 0) {
                        let v;
                        for(let i = 0; i<value1.data.length; i++)
                            if(value1.data[i].item.answers.length > 0){
                                v = value1.data[i].item
                                break
                            }
                        slack.postMessage("C01AP6EQ3U1",
                            yesAnswerMessage.replace("{A}",v.answers[0].answer).replace("{S}",v.answers[0].link),
                            lastMessage.ts)
                    }else
                        slack.postMessage("C01AP6EQ3U1", noAnswersMessage, lastMessage.ts)
                })
    }).catch(reason => console.log(reason))
}, 1000)