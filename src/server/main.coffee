#!/usr/bin/env coffee
express = require "express"
bodyParser = require "body-parser"
{CronJob} = require "cron"
scraper = require "youtube-comment-scraper"
nosql = require("nosql")


CRON_TIME = "00 */5 * * * *"
CRON_TIME = "* * * * * *"


identity = (v) ->
  v


eq = (lhs, rhs) ->
  lhs is rhs


insert_if_not_exists = (db, item, comp=eq) ->
  new Promise (resolve) ->
    db.one (doc) ->
      if comp doc, item then doc else null
    , (err, selected) ->
      if not selected?
        db.insert item
      resolve()


comments = nosql.load "./yourube-comments"
registered_ids = nosql.load "./registered_ids"


app = express()
app.use bodyParser.json()
app.use "/", express.static(__dirname + "/../../public")


# Add register-ids handler.
app.post "/lib/register-ids", (req, res) ->
  req.body.forEach (v) ->
    insert_if_not_exists registered_ids, v

  res.status 200
    .end()


# Add registered-ids handler.
app.get "/lib/registered-ids", (req, res) ->
  registered_ids.all identity, (err, selected) ->
    res
      .status 200
      .type "json"
      .json selected


app.listen 3000
console.log "Server running at http://localhost:3000/"


# Start scraping.
job = new CronJob CRON_TIME, ->

  registered_ids.one identity, (err, selected) ->
    if selected?
      scraper.comments selected
        .then (res) ->
          insert_if_not_exists comments, res, (lhs, rhs) ->
            lhs.id is rhs.id
          registered_ids.remove (v) ->
            v is selected

job.start()
