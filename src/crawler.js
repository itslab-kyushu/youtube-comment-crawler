const {
    CronJob
} = require("cron");
const NeDB = require("nedb");
const scraper = require("youtube-comment-scraper");
const trends = require("./trends");


// crawler takes three options. lang speficies which language the new crawler
// uses to obtain trending video IDs. id and comment are paths to output files
// to store video IDs and comments.
module.exports = function(lang, id, comment) {

    // Set up databases to store results.
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

    // getComments is a task invoked by a cron job. This task scrapes comments
    // from a video of which ID is the oldest one in the ID database.
    function getComments() {
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
                scraper.comments(id).then((res) => {
                    console.log(res);
                    db.comments.insert(res);
                    db.ids.update({
                        id: id
                    }, {
                        $set: {
                            scraped: true
                        }
                    }, {}, () => {
                        console.log(`End scraping comments in video ${id}`);
                        scraper.close();
                    })
                });
            }
        });
    }

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
            getComments();
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
