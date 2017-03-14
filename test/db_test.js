//
// db_test.js
//
// Copyright (c) 2016-2017 Junpei Kawamoto
//
// This software is released under the MIT License.
//
// http://opensource.org/licenses/mit-license.php
//
const {
    assert
} = require("chai");
const del = require("del");
const glob = require("glob");
const fs = require("fs");
const path = require("path");

const {
    Database
} = require("../lib/db");

describe("Class Database", function() {
    this.timeout(60 * 1000);

    // Create test database files.
    let dir;
    beforeEach(() => {
        dir = fs.mkdtempSync(__dirname + path.sep);
        glob(path.join(__dirname, "*.json"), (err, files) => {
            if (err) {
                assert.fail(err, null, `Cannot copy test data: ${err}`);
            }
            files.forEach((file) => {
                fs.createReadStream(file).pipe(
                    fs.createWriteStream(path.join(dir, path.basename(file))));
            });
        });
    });

    // Delete the test database files.
    afterEach(() => {
        del.sync(dir);
    });

    describe("Constructor", () => {

        it("Loads the ID database file in a given directory", (done) => {
            const db = new Database(__dirname);
            db.ids.find({}, (err, docs) => {
                if (err) {
                    assert.fail(err, null, `An error occurs: ${err}`);
                }
                assert.equal(
                    docs.length, 2, "The ID database has two documents");
                docs.forEach((doc) => {
                    assert.oneOf(
                        doc.id, ["rXY1dP3VfYw", "fHNg4pwmkJo"],
                        "Found ID is one of the expected ones");
                });
                done();
            });
        });

        it("Loads the comment database file in a given directory", (done) => {
            const db = new Database(__dirname);
            db.comments.find({}, (err, docs) => {
                if (err) {
                    assert.fail(err, null, `An error occurs: ${err}`);
                }
                assert.equal(
                    docs.length, 1, "The comment database has one document");
                docs.forEach((doc) => {
                    assert.oneOf(
                        doc.id, ["-YWm4qJvwCU"],
                        "Found ID is one of the expected one");
                });
                assert.equal(
                    docs[0].comments.length, 200, "There are 200 root comments");
                done();
            });
        });

    });

    describe("StoreIDs function", () => {

        it("Inserts a given set of IDs", () => {
            const db = new Database(dir);
            return db.storeIDs(["1", "2", "3"]).then(() => {
                db.ids.find({}, (err, docs) => {
                    if (err) {
                        assert.fail(err, null, `An error occurs: ${err}`);
                    }
                    assert.equal(
                        docs.length, 5, "The ID database has five documents");
                    docs.forEach((doc) => {
                        assert.oneOf(
                            doc.id, ["rXY1dP3VfYw", "fHNg4pwmkJo", "1", "2", "3"],
                            "Found ID is one of the expected ones");
                    });
                });
            });
        });

    });

    describe("FetchID function", () => {

        it("Returns the oldest video ID and marks it's scraped attribute true", () => {
            const db = new Database(dir);
            return db.fetchID().then((id) => {
                assert.equal(id, "rXY1dP3VfYw", "The oldest and unscraped ID is rXY1dP3VfYw");
            });
        });

        it("Returns null if there are no unscraped IDs", () => {
            const db = new Database(dir);
            return db.fetchID().then(() => {
                return db.fetchID().then((id) => {
                    assert.isNull(id, "null is returnd since there are no IDs");
                });
            });
        })

    });

    describe("StoreComments", () => {

        it("Stores a given comment", () => {
            const db = new Database(dir);
            return db.storeComments({
                "id": "1",
                "channel": {
                    "id": "2",
                    "name": "the channel name."
                },
                "comments": [{
                    "root": "root (parent) comment body.",
                    "author": "author of the root comment.",
                    "author_id": "ID of the author",
                    "like": "like score (summation of +1 for like and -1 for dislike).",
                }]
            }).then(() => {
                return new Promise((resolve, reject) => {
                    db.comments.find({
                        id: "1"
                    }, (err, docs) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        assert.equal(docs.length, 1, "There must be one matched document");
                        const doc = docs[0];
                        assert.equal(doc.channel.id, "2", "Channel ID is 2");
                        assert.equal(doc.comments.length, 1, "There is one root comment");
                        resolve();
                    });
                });
            });

        });

    });

});;
