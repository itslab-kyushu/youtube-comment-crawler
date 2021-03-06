# Youtube Comment Crawler
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![CircleCI](https://circleci.com/gh/itslab-kyushu/youtube-comment-crawler/tree/master.svg?style=svg)](https://circleci.com/gh/itslab-kyushu/youtube-comment-crawler/tree/master)
[![wercker status](https://app.wercker.com/status/bc8ebbcd4424e7a5eb5184ff39d99813/s/master "wercker status")](https://app.wercker.com/project/byKey/bc8ebbcd4424e7a5eb5184ff39d99813)
[![Release](https://img.shields.io/badge/release-0.2.0-brightgreen.svg)](https://github.com/itslab-kyushu/youtube-comment-crawler/releases/tag/v0.2.0)
[![Dockerhub](https://img.shields.io/badge/dockerhub-itslabq%2Fyoutube--comment--crawler-blue.svg)](https://hub.docker.com/r/itslabq/youtube-comment-crawler/)
[![MicroBadger](https://images.microbadger.com/badges/image/itslabq/youtube-comment-crawler.svg)](https://microbadger.com/images/itslabq/youtube-comment-crawler)

Scraping trending video page every day and comments posted to those videos
every 30 mins.

Crawled comments are stored in `comments.json`; each line of the file consists
of a JSON object outputted by
[youtube-comment-scraper](https://github.com/itslab-kyushu/youtube-comment-scraper).
See the project page for more information about the format.

## Run via npm
### Prepare
After cloning this repository, install related modules via npm:

```sh
$ git clone https://github.com/itslab-kyushu/youtube-comment-crawler.git
$ cd youtube-comment-crawler
$ npm install
```

### Start
To start the crawling service and store database files into `./data`, run

```sh
$ npm start --dir ./data
```

By default, it crawls English page;
to crawl pages in another language, give the language via `--lang` option.
For example, the following command starts to crawl Japanese pages:

```sh
$ npm start --dir ./data --lang JP
```

## Run as a docker container
Youtube Comment Crawler is also provided as a docker image,
[itslabq/youtube-comment-crawler](https://hub.docker.com/r/itslabq/youtube-comment-crawler/).
It stores database files in `/data` and you shouldn't give `--dir` option.

To run a container and mount `./data` so that database files are stored in
`./data`:

```sh
$ docker run -d --name crawler -v $(pwd)/data:/data:Z itslabq/youtube-comment-crawler
```

If you want to crawl pages in another language, give the language via `--lang`
option. The following example starts to crawl Japanese pages:

```sh
$ docker run -d --name crawler -v $(pwd)/data:/data:Z itslabq/youtube-comment-crawler --lang JP
```


# License
This software is released under the MIT License, see [LICENSE](LICENSE).
