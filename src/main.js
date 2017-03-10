const cheerio = require("cheerio");
const NeDB = require("nedb");
const phantom = require("phantom");


const db = {};
db.ids = new NeDB({
    filename: "ids.json",
    autoload: true,
    timestampData: true
});

// findIDs parse a given html and find video IDs.
function findIDs(html) {
    const $ = cheerio.load(html);
    $(".yt-lockup-video").each((_, elem) => {
        const id = $(elem).attr("data-context-item-id");
        db.ids.find({
            id: id
        }, (err, docs) => {
            if (!docs) {
                db.ids.insert({
                    id: id
                });
                console.log(id);
            }
        })
    });
}


phantom.create().then((instance) => {

    instance.createPage().then((page) => {

        // Open the trending page, then check how many items loaded.
        // If no items are loaded, wait 1000msec and then try checking again.
        // Otherwise, read innerHTML of a tree.
        return page.open("https://www.youtube.com/feed/trending").then((status) => {

            console.log(status);
            return new Promise((resolve, reject) => {

                function checkLoading() {
                    page.evaluate(() => {
                        return document.getElementsByClassName("expanded-shelf-content-item").length;
                    }).then((res) => {
                        if (res != 0) {
                            resolve();
                        } else {
                            setTimeout(checkLoading, 1000);
                        }
                    }).catch((err) => {
                        reject(err);
                    })
                }
                checkLoading();

            });

        }).then(() => {
            return page.evaluate(() => {
                return document.getElementsByClassName("expanded-shelf")[0].innerHTML;
            });
        }).then((html) => {
            findIDs(html);
            page.close();
        });

    }).then(() => {
        instance.exit();
    }).catch((err) => {
        console.error(err);
        instance.exit();
    });

})
