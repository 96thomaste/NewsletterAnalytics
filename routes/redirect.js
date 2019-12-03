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

router.use('/',(req, res) => {
    const destination = decodeURIComponent(req.query.destination);
    coll_articles.findOneAndUpdate({_url: destination}, { $inc: {visit_count: 1}, $currentDate: {last_seen: true} }).then( function (data) {
        if (!data) {
            res.json("Invalid URL");
            return;
        }
        coll_views.updateOne(
            { _url: destination, day: new Date().setHours(0, 0, 0, 0), tag: data.tag },
            { $inc: {visit_count: 1}, $currentDate: {last_seen: true} },
            { upsert: true } );
        res.redirect(destination);
    });
});

module.exports = router;