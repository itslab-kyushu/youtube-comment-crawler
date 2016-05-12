Youtube Comment Crawler
=========================
Crawling Youtube comments registered via Web interface.

Prepare
---------
Install related modules via npm.

```sh
$ npm install
```

Then, build this application.

```sh
$ npm run build
```

Run
-----

```sh
$ npm start
```

Then, access http://localhost:3000/

Usage
------
Add video IDs to be scraped via the web UI.
Every 5 min, comments of one vide will be scraped.
It also scrapes channel descriptions related to the videos.

To quit this application, hit Ctrl-C.

### Result
This application produces two database files, i.e. JSON files.

* `youtube-comments.nosql` consists of comments `youtube-comment-scraper` returns,
* `channels.nosql` consists of channel descriptions.
