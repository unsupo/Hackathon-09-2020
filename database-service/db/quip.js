
const quip = require('../lib/quip')
const db = require('./db')

const client = new quip.Client({accessToken: Buffer.from(process.env.QUIP_API_TOKEN, 'base64').toString('ascii').trim() });

module.exports.document = (title,content) =>
    new Promise((resolve, reject) => {
        db.getAllQuipDocsByTitle(title).then(value => {
            if(value && value.length > 0) {
                // document exists in db so edit it
                if(!content) // no content just return document
                    resolve(value)
                else
                    editDocumentById(value[0].doc_link,content).then(value1 => resolve(value1)).catch(reason => reject(reason))
            } else
                newDocument(title,content).then(value1 => resolve(value1)).catch(reason => reject(reason))
        })
    })

const _getThread = (id) => new Promise((resolve, reject) => {
        client.getAuthenticatedUser((err, user) => {
            if (err)
                reject(err)
            client.getThread(id, (err, res) => {
                if (err)
                    reject(err)
                else
                    db.getQuipDocById(id)
                        .then(value =>{
                            value.html = res.html
                            value.save({fields: ['html']}).then(value1 => resolve(value1))
                        }).catch(reason => reject(reason))
                    // resolve(res)
            })
        })
    })
module.exports.getThread = (id) => _getThread(id)

const editDocumentById = (id,content) => new Promise((resolve, reject) => {
        client.getAuthenticatedUser((err, user) => {
            if(err)
                reject(err)
            client.editDocument({
                'threadId': id,
                'content': content,
                // 'location': operation, // defaults to '0: APPEND'
                'format': 'markdown',
                // 'section_id': sectionId // optional only required for some locations
            }, (err, res) => {
                if (err)
                    reject(err)
                else
                    _getThread(id).then(value => resolve(value)).catch(reason => reject(reason))
            })
        })
    })


const newDocument = (title, content) => new Promise((resolve, reject) => {
    client.getAuthenticatedUser((err, user) => {
        if (err)
            reject(err)
        client.newDocument({
            title: title,
            content: content,
            format: 'markdown'
        }, (err, res) => {
            if (err)
                reject(err)
            else {
                db.addQuipDoc(title, res.thread.id, res.thread.link.replace("https://quip.com/",""), res.html)
                    .then(value => resolve(value))
                    .catch(reason => reject(reason))
            }
        })
    })
})