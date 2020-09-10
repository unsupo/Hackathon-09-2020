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

module.exports.getPermalink = (channel, timestamp) =>
    slackerGet('chat.getPermalink',{channel: channel, message_ts: timestamp})

module.exports.getAllMessages = (channel) => {
    const promises = []
    const questions = []
    return new Promise((resolve, reject) => {
        module.exports.conversationHistory(channel).then(value => {
            value.data.messages.forEach(message => {
                if(message.text.endsWith("?")) {
                    promises.push(new Promise((resolve1, reject1) => {
                        const m = {
                            ts: message.ts,
                            question: message.text
                        }
                        module.exports.getPermalink(channel, message.ts).then(value1 =>{
                            if(value1.hasOwnProperty('data') && value1.data.hasOwnProperty('permalink'))
                                m['link'] = value1.data.permalink
                            if (message['reply_count'] > 0) {
                                module.exports.conversationsReplies(channel, m.ts).then(value2 => {
                                    Array.prototype.forEach.call(value2.data.messages, child => {
                                        m['answers'] = {
                                            answer: child.text,
                                            ts: child.ts
                                        }
                                        module.exports.getPermalink(channel, child.ts).then(value3 => {
                                            m['answers']['link'] = value3.data.permalink
                                            questions.push(m)
                                            resolve1(m)
                                        })
                                    })
                                })
                            }else {
                                questions.push(m)
                                resolve1(m)
                            }
                        })
                    }))
                }
            })
            Promise.all(promises).then(value1 => {
                resolve(questions)
            }).catch(reason => reject(reason))
        })
    })
}

        // module.exports.conversationHistory(channel).then(value => {
        //     value.data.messages.forEach(message => {
        //         const link = module.exports.getPermalink(channel, message.ts)
        //         const m = {
        //             user: message.user,
        //             ts: message.ts,
        //             text: message.text,
        //             link: link,
        //             reactions: [],
        //             replies: []
        //         }
        //         replyPromises.push(link)
        //         if (message.reactions)
        //             message.reactions.forEach(reaction => m['reactions'].push({
        //                 name: reaction.name,
        //                 count: reaction.count
        //             }))
        //         if (message['reply_count'] > 0) {
        //             const rp = module.exports.conversationsReplies(channel, m.ts);
        //             m['replyPromises'] = rp
        //             replyPromises.push(rp)
        //         }
        //         allMessages.push(m)
        //     })
        //     Promise.allSettled(replyPromises).then((res) => {
        //     }).catch(reason => reject(reason))
    //         new Promise(resolve1 =>
    //             allMessages.forEach(message => {
    //                 if (message.hasOwnProperty('replyPromises'))
    //                     message.replyPromises.then(res => {
    //                         const answers = []
    //                         if (res.hasOwnProperty('data') && res.data.hasOwnProperty('messages'))
    //                             try {
    //                                 Array.prototype.forEach.call(res.data.messages, reply => {
    //                                     answers.push({
    //                                         answer: reply.text,
    //                                         emoji_count: reply.hasOwnProperty('reactions') ? reply.reactions.length : 0
    //                                     })
    //                                 })
    //                             } catch (e) {
    //                                 reject(e)
    //                             }
    //                         const m = {
    //                             question: message.text,
    //                             answers: answers.slice()
    //                         }
    //                         message.link.then(v => {
    //                             m['link'] = v.data.permalink
    //                             questions.push(m)
    //                         })
    //                     })
    //                 resolve(allMessages)
    //             })).then(value1 => resolve(allMessages))
    //     }).catch(reason => reject(reason))
    // })
// }

