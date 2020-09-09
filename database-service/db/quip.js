const quip = require('../quip')
const db = require('./db')

const client = new quip.Client({accessToken: process.env.QUIP_API_TOKEN });
// client.getAuthenticatedUser((err, user) => {
    // client.getFolder(user["starred_folder_id"], (err, folder) => {
    //     console.log("You have", folder["children"].length,
    //         "items in your starred folder");
    // });
// });

module.exports.newDocument = (title, content) => new Promise((resolve, reject) => {
    db.getAllQuipDocsByTitle(title).then(value => {
        if(value && value.length > 0)
            resolve(value)
        else
            client.getAuthenticatedUser((err, user) => {
                if(err)
                    reject(err)
                client.newDocument({
                    title: title,
                    content: content
                }, (err, res) => {
                    if (err)
                        reject(err)
                    else {
                        db.addQuipDoc(title, res.thread.id, res.thread.link, res.html)
                            .then(value => resolve(value))
                            .catch(reason => reject(reason))
                    }
                })
            })
    })
})