#!/usr/bin/env node

//
// cli.js
//
// Copyright (c) 2016-2017 Junpei Kawamoto
//
// This software is released under the MIT License.
//
// http://opensource.org/licenses/mit-license.php
//
const {
    start,
    crawl
} = require("../lib/crawler");

const argv = require("yargs")
    .option("lang", {
        describe: "Language to be used to scrape trand pages. Not used in crawl command."
    })
    .default("lang", "JP")
    .option("id", {
        describe: "Path to the ID database file"
    })
    .option("comment", {
        describe: "Path to the comment database file"
    })
    .demandOption(["id", "comment"])
    .command("*", "Start crawling", () => {}, (argv) => {
        start(argv.lang, argv.id, argv.comment);
    })
    .command("crawl", "Crawl comments form a video", () => {}, (argv) => {
        crawl(argv.id, argv.comment);
    })
    .help('h')
    .alias('h', 'help')
    .argv;
