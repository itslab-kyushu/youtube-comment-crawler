//
// crawler.js
//
// Copyright (c) 2016-2017 Junpei Kawamoto
//
// This software is released under the MIT License.
//
// http://opensource.org/licenses/mit-license.php
//
const {
    CronJob
} = require("cron");
const NeDB = require("nedb");
const scraper = require("youtube-comment-scraper");

const {
    Database
} = require("./db");
const trends = require("./trends");

const TIMEOUT = 24 * 60 * 60 * 1000;


// getComments is a task invoked by a cron job. This task scrapes comments
// from a video of which ID is the oldest one in the ID database.
function getComments(db) {

    return db.fetchID.then((id) => {
        if (!id) {
            // There are no unscraped IDs.
            return Promise.resolve();
        }

        console.log(`Start scraping comments in video ${id}`);

        // Scraping task.
        const scraping = scraper.comments(id).then((res) => {
            console.log(res);
            return db.storeComments(res);
        });

        // Timeout task.
        const timeout = new Promise((_, reject) => {
            setTimeout(() => {
                reject("Timeout");
            }, TIMEOUT);
        });

        return Promise.race([scraping, timeout])
            .then(() => {
                console.log(`End scraping comments in video ${id}`);
            }).catch((err) => {
                console.error(`Scraping was failed: ${err}`);
            });

    });

}


// getIDs is a task called from cron to scrape trend video IDs and store them
// to the given database.
// This function returns a promise which will be resolved after storing obtained
// IDs.
function getIDs(lang, db) {
    return trends(lang).then((ids) => {
        return db.storeIDs(ids);
    }).catch((err) => {
        console.error(err);
    });
}

// crawler takes three options. lang speficies which language the new crawler
// uses to obtain trending video IDs.
// Scraped IDs and comments are store in the given dir directory as database
// files.
function start(lang, dir) {

    // Set up databases to store results.
    const db = new Database(dir);

    // Execute getIDs every midnight.
    const getIDsJob = new CronJob({
        cronTime: "0 0 0 * * *",
        onTick() {
            getIDs();
        },
        start: true
    });

    const getCommentJob = new CronJob({
        cronTime: "0 */30 * * * *",
        onTick: () => {
            getComments(db);
        },
        start: true
    });

    // If ID database is empty, scrape the trending page.
    db.nIDs().then((count) => {
        if (count !== 0) {
            return Promise.resolve();
        }
        return getIDs(lang, db).then(() => {
            console.log("Finisied getting IDs.")
            return getComments(db);
        });
    }).catch((err) => {
        console.error(err);
    });

}

// crawl runs getComments one time, which gets one Video ID from the ids
// database, scrapes comments fromt the video, and then stores the comments to
// the comment database.
function crawl(id, comment) {
    return getComments(newDB(id, comment))
}

module.exports = {
    start: start,
    crawl: crawl
}
