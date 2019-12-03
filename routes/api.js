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
      coll_articles.findOne({_url : x}, { _url: 1 }, function(err, data) { callback(null, data) });
  }));
  async.series(calls,
  function(err, results){
      res.json(results.filter( x => x ).map(x => x.url));
  });
});

router.post('/new_links',(req, res) => {
  const items = req.body.urls;
  console.log(items);
  let bulk = coll_articles.initializeUnorderedBulkOp();
  items.forEach( i => {
    bulk.find({_url : i._url}).upsert().update({$set: {"tag" : i.tag, "title" : i.title, "date" : new Date() }})
  });
  bulk.execute();
  res.json([]);
});

router.get('/list-tags', (req, res) => {
  coll_articles.distinct("tag", ( function(err, docs){
    console.log(docs);
    res.json(docs);
  }) );
});

router.get('/tag-stats', (req, res) => {
  const tag = req.query.name;
  coll_articles.aggregate([
    { $match: { tag: tag } },
    { $group: { _id: "$tag", total: { $sum: "$amount" } } }
  ]).then( function (data) {
    console.log(data);
  });
  coll_articles.findOne({tag: tag}).then( function (data) {
    if(!data){
      res.json(null);
      return;
    }
    res.json(data);
  });
});

module.exports = router;
