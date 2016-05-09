#!/usr/bin/env coffee
express = require "express"
bodyParser = require "body-parser"

app = express()
app.use bodyParser.json()


app.use "/", express.static(__dirname + "/../../public")


app.post "/lib/register-ids", (req, res) ->
  console.log req.body
  res.status 200
    .end()


app.get "/lib/registered-ids", (req, res) ->
  res
    .status 200
    .type "json"
    .json [
      key: "1"
      value: "abcdefg"
    ,
      key: "2"
      value: "ABCDEFG"
    ,
      key: "3"
      value: "1234567"
    ]



app.listen 3000
console.log "Server running at http://localhost:3000/"
