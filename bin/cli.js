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
    .default("lang", "EN")
    .option("dir", {
        describe: "Path to the directory to store database files"
    })
    .demandOption(["dir"])
    .command("*", "Start crawling", () => {}, (argv) => {
        start(argv.lang, argv.dir);
    })
    .command("crawl", "Crawl comments form a video", () => {}, (argv) => {
        crawl(argv.dir).catch((err) => {
            console.error(err);
        });
    })
    .help("h")
    .alias("h", "help")
    .argv;
