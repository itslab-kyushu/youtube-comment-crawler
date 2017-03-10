const NeDB = require("nedb");
const trends = require("./trends");

const db = {};
db.ids = new NeDB({
    filename: "ids.json",
    autoload: true,
    timestampData: true
});

trends("JP", db).then(() => {
    console.log("done");
});
