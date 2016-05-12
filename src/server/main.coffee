#!/usr/bin/env coffee
express = require "express"
bodyParser = require "body-parser"
{CronJob} = require "cron"
scraper = require "youtube-comment-scraper"
jsonfile = require "jsonfile"
cleanup = require "./cleanup"

registered_ids = []
try
  db = jsonfile.readFileSync "./yourube-comments.json"
catch
  db = []
cleanup ->
  jsonfile.writeFileSync "./yourube-comments.json", db

app = express()
app.use bodyParser.json()

app.use "/", express.static(__dirname + "/../../public")

# Add register-ids handler.
app.post "/lib/register-ids", (req, res) ->
  registered_ids = registered_ids.concat req.body
  res.status 200
    .end()

# Add registered-ids handler.
app.get "/lib/registered-ids", (req, res) ->
  res
    .status 200
    .type "json"
    .json registered_ids

app.listen 3000
console.log "Server running at http://localhost:3000/"


# Start scraping.
job = new CronJob "00 */5 * * * *", ->

  if registered_ids.length isnt 0
    scraper.comments registered_ids[0]
      .then (res) ->
        db.push res
        registered_ids.shift()

job.start()
