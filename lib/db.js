//
// db.js
//
// Copyright (c) 2016-2017 Junpei Kawamoto
//
// This software is released under the MIT License.
//
// http://opensource.org/licenses/mit-license.php
//

const NeDB = require("nedb");
const path = require("path");

const ID_DATABASE = "ids.json";
const COMMENT_DATABASE = "comments.json";

class Database {

    // Creates a database object which uses a given directory to store database
    // files.
    constructor(dir) {
        this.ids = new NeDB({
            filename: path.join(dir, ID_DATABASE),
            autoload: true,
            timestampData: true
        });
        this.comments = new NeDB({
            filename: path.join(dir, COMMENT_DATABASE),
            autoload: true,
            timestampData: true
        });
    }

    // nIDs returns the number of IDs stored in this database via a promise.
    nIDs() {
        return new Promise((resolve, rejce) => {
            this.ids.count({}, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    }

    // Store a give set of IDs. IDs already exists in the database will be skipped
    // to store.
    // This is an asynchronous function and returns a promise which will be
    // resoleved after all insert queries have done.
    storeIDs(ids) {

        const promises = ids.map((id) => {
            return new Promise((resolve, reject) => {
                this.ids.find({
                    id: id
                }, (err, docs) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (docs.length === 0) {
                        this.ids.insert({
                            id: id
                        });
                        console.log(`Insert a new video ID: ${id}`);
                    }
                    resolve();
                });
            });
        });

        return Promise.all(promises);

    }

    // Returns an ID and marks the scraped property of the ID true.
    // This function returns a promise which passes an ID.
    // If there are no IDs, the promise will passes null.
    fetchID() {
        return new Promise((resolve, reject) => {
            this.ids.find({
                scraped: {
                    $ne: true
                }
            }).sort({
                "createdAt.$$date": 1
            }).limit(1).exec((err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            })
        }).then((docs) => {
            if (docs.length === 0) {
                // There are no waiting IDs.
                return Promise.resolve(null);
            }

            const id = docs[0].id;
            return new Promise((resolve, reject) => {
                this.ids.update({
                    id: id
                }, {
                    $set: {
                        scraped: true
                    }
                }, {}, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(id);
                    }
                });
            });

        });
    }

    // Store a given comment object.
    // It returns a promise object.
    storeComments(comment) {
        return new Promise((resolve, reject) => {
            this.comments.insert(comment, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

}

module.exports = {
    Database: Database
};
