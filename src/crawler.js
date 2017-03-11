const {
    CronJob
} = require("cron");
const NeDB = require("nedb");
const scraper = require("youtube-comment-scraper");
const trends = require("./trends");

const TIMEOUT = 15 * 60 * 1000;

// newDB creates a database object which has ids and comments.
// This function takes id and comment arguments. Both are the paths to be loaded
// as id and comment database file, respectively.
function newDB(id, comment) {
    const db = {};
    db.ids = new NeDB({
        filename: id,
        autoload: true,
        timestampData: true
    });
    db.comments = new NeDB({
        filename: comment,
        autoload: true,
        timestampData: true
    });
    return db;
}

// getComments is a task invoked by a cron job. This task scrapes comments
// from a video of which ID is the oldest one in the ID database.
function getComments(db) {
    db.ids.find({
        scraped: {
            $exists: false
        }
    }).sort({
        "createdAt.$$date": 1
    }).limit(1).exec((err, docs) => {
        if (err) {
            console.error(err);
        }
        if (docs.length != 0) {
            const id = docs[0].id;
            console.log(`Start scraping comments in video ${id}`);

            const scraping = scraper.comments(id).then((res) => {
                console.log(res);
                return new Promise((resolve, reject) => {
                    db.comments.insert(res, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        db.ids.update({
                            id: id
                        }, {
                            $set: {
                                scraped: true
                            }
                        }, {}, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                });
            });
            const timeout = new Promise((_, reject) => {
                setTimeout(() => {
                    reject("Timeout");
                }, TIMEOUT);
            });
            Promise.race([scraping, timeout])
                .then(() => {
                    console.log(`End scraping comments in video ${id}`);
                    scraper.close();
                }).catch((err) => {
                    console.error(`Scraping was failed: ${err}`);
                    scraper.close();
                });
        }
    });
}

// crawler takes three options. lang speficies which language the new crawler
// uses to obtain trending video IDs. id and comment are paths to output files
// to store video IDs and comments.
function start(lang, id, comment) {

    // Set up databases to store results.
    const db = newDB(id, comment);

    const getIDJob = new CronJob({
        cronTime: "0 0 0 * * *",
        onTick: () => {
            trends("JP", db);
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
    db.ids.count({}, (err, count) => {
        if (err) {
            console.error(err);
        }
        if (count == 0) {
            trends("JP", db).then(() => {
                console.log("Finisied getting IDs.")
                getComments();
            });
        }
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
