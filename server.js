/*

Debug:
------
node-inspector & node --debug server.js

*/

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var etsyjs = require('etsy-js');
var info = require('./info.js');
var client = etsyjs.client({
    key: info.key,
    secret: info.secret,
    callbackURL: 'http://localhost:3000/authorize'
});

var app = express.createServer();

exports.client = client;
exports.etsyjs = etsyjs;

require('./public/etsyjs-extend.js');

var functions = require('./public/functions');

app.use(cookieParser('secEtsy'));

app.use(session());

app.configure(function() {
    // app.use( express.cookieParser() );
    // app.use( express.session( { secret: "example secret" } ) );
    // app.use( app.router );
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
    return client.requestToken(function(err, response) {
        if (err) {
            return console.log(err);
        }
        req.session.token = response.token;
        req.session.sec = response.tokenSecret;
        return res.redirect(response.loginUrl);
    });
});

app.get('/authorize', function(req, res) {
    functions.authorize(req, res);
});

app.get('/main', function(req, res) {
    res.redirect('/main.html');
});

app.get('/findShopSections', function(req, res) {
    functions.findShopSections(req, res);
});

app.get('/findAllShopSectionListings', function(req, res) {
    functions.findAllShopSectionListings(req, res);
});

app.get('/findAllListings', function(req, res) {
    var showNum;
    // showNum = 5;
    functions.findAllListings(req, res, showNum);
});

app.get('/updateListing', function(req, res) {
    functions.updateListing(req, res);
});

app.get('/updateColorChart', function(req, res) {
    functions.updateColorChart(req, res);
});

var server = app.listen(3000, function() {
    return console.log('Listening on port %d', server.address().port);
});
