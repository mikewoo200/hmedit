/* global require, console, module */

'use strict';

var server = require('../server.js');
var client = server.client;
var fs = require('fs');
var dust = require('dustjs-linkedin');
var url = require('url');
var _ = require('underscore');

function authorize(req, res) {
    var query, verifier;
        query = url.parse(req.url, true).query;
    verifier = query.oauth_verifier;
    return client.accessToken(req.session.token, req.session.sec, verifier, function(err, response) {
        req.session.token = response.token;
        req.session.sec = response.tokenSecret;
        return res.redirect('/main');
    });
}

function findAllListings(req, res, showNum) {
    var allResults = [],
        limit = showNum ? showNum : 100;

    function findASet(page, limit) {
        return client.auth(req.session.token, req.session.sec).listing().findAllListings(page, limit, function(err, body) {
            if (err) {
                console.log(err);
            }
            if (body) {
                for (var i = 0, len = body.results.length; i < len; i++) {
                    allResults.push(body.results[i]);
                }
                if (!showNum && body.pagination && body.pagination.next_page !== null) {
                    findASet(body.pagination.next_page, limit);
                } else {
                    var contents = fs.readFileSync('./public/main.dust').toString();
                    dust.loadSource(dust.compile(contents, 'main'));
                    dust.render('main', {data: allResults}, function(e, out) {
                        return res.send(out);
                    });
                }
            }
        });
    }
    findASet(1, limit);
}

function updateListing(req, res) {
    var listingId = req.param('listingId'),
        field = req.param('field'),
        val = req.param('val'),
        data = {};

    var disableRun = 0;
    if (disableRun) {
        setTimeout(function() {
            console.log(listingId);
            console.log(field);
            console.log(val);
            return res.send({
                statusCode: 200,
                listingId: listingId,
                field: field,
                val: val
            });
        }, 500);
    } else {
        if (listingId && field && val) {
            data[field] = val;
            return client.auth(req.session.token, req.session.sec).listing().update(listingId, data, function(err, body) {
                if (err) {
                    return res.send({
                        err: err,
                        title: body && body.title,
                        statusCode: 400
                    });
                }
                if (body) {
                    return res.send({
                        body: body,
                        listingId: listingId,
                        statusCode: 200
                    });
                }
            });
        } else {
            return res.send(listingId);
        }
    }
}

function updateColorChart(req, res) {
    var listingId = req.param('listingId'),
        imageId = req.param('imageId'),
        rank = req.param('rank');

    var disableRun = 0;
    if (disableRun) {
        setTimeout(function() {
            return res.send({
                statusCode: 200,
                listingId: listingId,
                imageId: imageId,
                rank: rank
            });
        }, 500);
    } else {
        if (listingId) {
            return client.auth(req.session.token, req.session.sec).listing().updateListingImage(listingId, {listing_image_id: imageId, rank: rank, overwrite: 1}, function(err, body) {
                if (err) {
                    console.log(err);
                    return res.send({
                        err: err,
                        statusCode: 400
                    });
                }
                if (body) {
                    return res.send({
                        body: body,
                        statusCode: 200
                    });
                }
            });
        } else {
            return res.send(listingId);
        }
    }
}

function findShopSections(req, res) {
    return client.auth(req.session.token, req.session.sec).shop().findAllShopSections(function(err, body) {
        if (err) {
            console.log(err);
            return res.send({
                err: err,
                statusCode: 400
            });
        }
        if (body) {
            return res.send({
                sections: body.results,
                statusCode: 200
            });
        }
    });
}

function findAllShopSectionListings(req, res, showNum) {
    var allResults = [],
        limit = showNum ? showNum : 100,
        shopSectionId = req.param('shopSectionId');

    function findASet(page, limit) {
        return client.auth(req.session.token, req.session.sec).listing().findAllShopSectionListings(page, limit, shopSectionId, function(err, body) {
            if (err) {
                console.log(err);
            }
            if (body) {
                for (var i = 0, len = body.results.length; i < len; i++) {
                    allResults.push(body.results[i]);
                }
                if (!limit && body.pagination && body.pagination.next_page !== null) {
                    findASet(body.pagination.next_page, limit);
                } else {
                    var contents = fs.readFileSync('./public/main.dust').toString();
                    dust.loadSource(dust.compile(contents, 'main'));
                    dust.render('main', {data: allResults}, function(e, out) {
                        return res.send(out);
                    });
                }
            }
        });
    }
    findASet(1, limit);
}

module.exports = {
    authorize: authorize,
    findShopSections: findShopSections,
    findAllShopSectionListings: findAllShopSectionListings,
    findAllListings: findAllListings,
    updateListing: updateListing,
    updateColorChart: updateColorChart
};
