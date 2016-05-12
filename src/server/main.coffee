#!/usr/bin/env coffee
express = require "express"
bodyParser = require "body-parser"
{CronJob} = require "cron"
scraper = require "youtube-comment-scraper"
nosql = require("nosql")

# Cron time for the scraping job.
CRON_TIME = "00 */5 * * * *"


# Identity mapping function.
#
# @param v [Object] a value.
# @return [Object] v itself.
identity = (v) ->
  v


# Comparing given two objects.
#
# @param lhs [Object] an object.
# @param rhs [Object] another object.
# @return [Boolean] true if lhs is rhs otherwise false.
eq = (lhs, rhs) ->
  lhs is rhs


# Insert an item to a database if the item does not exist.
#
# @param db [nosql.Database] Database.
# @param item [Object] An item checked existence.
# @param comp [Function] Cmparing function which receives a document stored in
#   the database and the argument *item*. (Default: eq)
# @return [Promise] Promise object invoked with item inserted.  If no item was
#   inserted, the Promise object will be fulfilled with nothing.
insert_if_not_exists = (db, item, comp=eq) ->
  new Promise (resolve) ->
    db.one (doc) ->
      if comp doc, item then doc else null
    , (err, selected) ->
      if not selected?
        db.insert item, ->
          resolve item
      else
        resolve()


# Check an item exists in a database.
#
# @param db [nosql.Database] Database.
# @param item [Object] An item checked existence.
# @param comp [Function] Cmparing function which receives a document stored in
#   the database and the argument *item*. (Default: eq)
# @return [Promise] Promise object will be fulfilled with true if the item
#   exists in the database otherwise false.
exists = (db, item, comp=eq) ->
  new Promise (resolve) ->
    db.one (doc) ->
      if comp doc, item then doc else null
    , (err, selected) ->
      resolve selected?


# Pop an item from a database.
#
# @param db [nosql.Database] Database.
# @return [Promise] Promise object will be fulfilled with an item. If there are
#   no items, it will be rejected.
pop = (db) ->
  new Promise (resolve, reject) ->
    db.one identity, (err, selected) ->
      if selected?
        db.remove eq.bind(undefined, selected), ->
          resolve selected
      else
        reject()


comments = nosql.load "./youtube-comments"
channels = nosql.load "./channels"
registered_ids = nosql.load "./registered_ids"
scraped_ids = nosql.load "./scraped_ids"


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

job.start()
