const axios = require("axios")

const base = 'https://slack.com/api/';
const decode = Buffer.from(process.env.SLACK_TOKEN, 'base64').toString('ascii').trim()
const config = {
    headers: {
        Authorization: `Bearer ${decode}`  //the token is a variable which holds the token
    }
}
const slackerGet = (api,queryParams) => {
    const conf = config;
    if(queryParams)
        conf['params']=queryParams
    return axios.get(base + api,conf)
}

const slackerPost = (api,channel,text,timestamp)=> {
    const data = {
        channel: channel,
        text: text
    }
    if(timestamp)
        data['thread_ts']=timestamp
    return axios.post(base + api, data, config)
}

/**
 * Reply or message a channel, if timestamp is undefined it'll post it otherwise it'll be a reply
 * @param channel to post to
 * @param text you want posted
 * @param timestamp (leave undefined for new message or not for reply)
 * @returns {AxiosPromise}
 */
module.exports.postMessage = (channel,text,timestamp) =>
    slackerPost('chat.postMessage',channel,text, timestamp)

/**
 * Get all conversations in a channel
 * @param channel
 * @returns {AxiosPromise}
 */
module.exports.conversationHistory = (channel) =>
    slackerGet('conversations.history',{channel: channel})

/**
 * Get all replies to a conversation in a channel
 * @param channel
 * @param timestamp of the conversation
 * @returns {AxiosPromise}
 */
module.exports.conversationsReplies = (channel, timestamp) =>
    slackerGet('conversations.replies',{channel: channel, ts: timestamp})


// module.exports.getAllMessages = (channel) =>
//     new Promise((resolve, reject) => {
//         module.exports.conversationHistory(channel)
//             .then(value =>)
//             .catch(reason =>)
//     })

