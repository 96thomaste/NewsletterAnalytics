const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const async = require('async');
const MongoClient = require("mongodb").MongoClient;
const assert = require('assert');
const mongo_url = 'mongodb://localhost:27017';
const dbName = 'nylas_db';
const client = new MongoClient(mongo_url);
let db; let coll_articles; let coll_views;
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = client.db(dbName);
  coll_articles = db.collection("articles");
  coll_views = db.collection("views");
});


/* GET users listing. */
router.post('/verify',(req, res) => {
  const items = req.body.urls;
  let calls = items.map( x => ( function(callback) {
      coll_articles.findOne({url : x}, { url: 1 }, function(err, data) { callback(null, data) });
  }));
  async.series(calls,
  function(err, results){
      res.json(results.filter( x => x ).map(x => x.url));
  });
});

router.post('/new_links',(req, res) => {
  const data = req.body; console.log(data);

  res.json([]);
});

module.exports = router;
