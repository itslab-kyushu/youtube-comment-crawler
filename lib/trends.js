//
// trends.js
//
// Copyright (c) 2016-2017 Junpei Kawamoto
//
// This software is released under the MIT License.
//
// http://opensource.org/licenses/mit-license.php
//
const cheerio = require("cheerio");
const phantom = require("phantom");

// Scrape tranding page of YouTube in a given language.
// This function returns a promise.
function trends(lang) {

    // findIDs parse a given html and find video IDs. This function returns a
    // promise.
    function findIDs(html) {

        const $ = cheerio.load(html);
        const promises = [];
        $(".yt-lockup-video").each((_, elem) => {

            promises.push(new Promise((resolve, reject) => {

                const id = $(elem).attr("data-context-item-id");
                db.ids.find({
                    id: id
                }, (err, docs) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return
                    }
                    if (docs.length == 0) {
                        db.ids.insert({
                            id: id
                        });
                        console.log(`Insert a new video ID: ${id}`);
                    }
                    resolve();
                });

            }));

        });
        return Promise.all(promises);

    }

    return phantom.create().then((instance) => {

        return instance.createPage().then((page) => {

            // Open the trending page, then check how many items loaded.
            // If no items are loaded, wait 1000msec and then try checking again.
            // Otherwise, read innerHTML of a tree.
            return page.open(`https://www.youtube.com/feed/trending?gl=${lang}`).then((status) => {

                if (status !== "success") {
                    return Promise.reject(`Open url returns ${status}`);
                }

                return new Promise((resolve, reject) => {

                    function checkLoading() {
                        // PhantomJS doesn't support arrow functions.
                        page.evaluate(function() {
                            return document.getElementsByClassName("expanded-shelf-content-item").length;
                        }).then((res) => {
                            if (res != 0) {
                                resolve();
                            } else {
                                setTimeout(checkLoading, 1000);
                            }
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                    checkLoading();

                });

            }).then(() => {
                // PhantomJS doesn't support arrow functions.
                return page.evaluate(function() {
                    return document.getElementsByClassName("expanded-shelf")[0].innerHTML;
                });

            }).then((html) => {
                page.close();
                instance.exit();

                const $ = cheerio.load(html);
                const res = [];
                $(".yt-lockup-video").each((_, elem) => {
                    res.push($(elem).attr("data-context-item-id"));
                });
                return res;

            }).catch((err) => {
                page.close();
                return Promise.reject(err);
            });

        }).catch((err) => {
            instance.exit();
            return Promise.reject(err);
        });

    });

}


module.exports = trends;
