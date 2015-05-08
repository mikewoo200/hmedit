var server = require('../server.js');
var etsyjs = server.etsyjs;

(function() {
    etsyjs.shop.prototype.findAllShopSections = function(cb) {
        return this.client.get('/shops/hingmade/sections/', function(err, status, body, headers) {
            if (err) {
                return cb(err);
            }
            if (status !== 200) {
                return cb(new Error('Find all shop sections error'));
            } else {
                return cb(null, body, headers);
            }
        });
    };

    etsyjs.listing.prototype.findAllListings = function(page, limit, cb) {
        return this.client.get('/shops/hingmade/listings/active/', {page: page, limit: limit, includes: 'Images(listing_image_id,url_75x75,url_fullxfull)'}, function(err, status, body, headers) {
            if (err) {
                return cb(err);
            }
            if (status !== 200) {
                return cb(new Error('Find active shop listings error'));
            } else {
                return cb(null, body, headers);
            }
        });
    };

    etsyjs.listing.prototype.findAllShopSectionListings = function(page, limit, shopSectionId, cb) {
        return this.client.get('/shops/hingmade/sections/' + shopSectionId + '/listings/active', {page: page, limit: limit, includes: 'Images(listing_image_id,url_75x75,url_fullxfull)'}, function(err, status, body, headers) {
            if (err) {
                return cb(err);
            }
            if (status !== 200) {
                return cb(new Error('Find active shop listings error'));
            } else {
                return cb(null, body, headers);
            }
        });
    };

    etsyjs.listing.prototype.update = function(listingId, content, cb) {
        return this.client.put('/listings/' + listingId, content, function(err, status, body, headers) {
            if (err) {
                return cb(err);
            }
            if (status !== 200) {
                return cb(new Error('Update listings error'));
            } else {
                return cb(null, body, headers);
            }
        });
    };

    etsyjs.listing.prototype.updateListingImage = function(listingId, content, cb) {
        return this.client.post('/listings/' + listingId + '/images/', content, function(err, status, body, headers) {
            if (err) {
                return cb(err);
            }
            if (status !== 200 && status !== 201) {
                return cb(new Error('Update listing image error'));
            } else {
                return cb(null, body, headers);
            }
        });
    };
})();
