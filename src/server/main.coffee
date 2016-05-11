#!/usr/bin/env coffee
express = require "express"
bodyParser = require "body-parser"

app = express()
app.use bodyParser.json()


app.use "/", express.static(__dirname + "/../../public")


registered_ids = [
  "abcdefg"
  "ABCDEFG"
  "1234567"
]


app.post "/lib/register-ids", (req, res) ->
  console.log req.body
  res.status 200
    .end()


app.get "/lib/registered-ids", (req, res) ->
  res
    .status 200
    .type "json"
    .json registered_ids


app.listen 3000
console.log "Server running at http://localhost:3000/"
