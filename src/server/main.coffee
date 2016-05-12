#!/usr/bin/env coffee
express = require "express"
bodyParser = require "body-parser"
{CronJob} = require "cron"
scraper = require "youtube-comment-scraper"
nosql = require("nosql")
{identity, insert_if_not_exists, exists, pop} = require "./db-helper"

# Cron time for the scraping job.
CRON_TIME = "00 */5 * * * *"


comments = nosql.load "./youtube-comments"
channels = nosql.load "./channels"
registered_ids = nosql.load "./registered_ids"
scraped_ids = nosql.load "./scraped_ids"

# Recovery database.
#
# If there are IDs in scraped_ids related comments are not in comments,
# The IDs should be moved to registered_ids again.
scraped_ids.each (id) ->
  exists comments, id, (doc, id) ->
    doc.id is id
  .then (res) ->
    if not res
      insert_if_not_exists registered_ids, id


app = express()
app.use bodyParser.json()
app.use "/", express.static(__dirname + "/../../public")


# Add register-ids handler.
app.post "/lib/register-ids", (req, res) ->
  Promise.all req.body.map (v) ->
    insert_if_not_exists registered_ids, v
  .then ->
    res.status 200
      .end()
  .catch (reason) ->
    console.error reason
    res.status 501
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

  pop registered_ids
    .then (id) ->
      console.log "Start scraping id:#{id}."
      scraped_ids.insert id
      scraper.comments id

    .then (res) ->
      # Add scraped comments.
      insert_if_not_exists comments, res, (lhs, rhs) ->
        lhs.id is rhs.id

    .then (res) ->
      if res?
        # If there are no channel information, scrape it, too.
        exists channels, res.channel.id, (doc, key) ->
          doc.id is key

        .then (existence) ->
          if not existence
            console.log "Start scraping channel #{res.channel.id}."
            scraper.channel res.channel.id
              .then (res) ->
                insert_if_not_exists channels, res, (doc, item) ->
                  doc.id is item.id

        .catch (reason) ->
          console.error reason

    .catch ->
      

job.start()
