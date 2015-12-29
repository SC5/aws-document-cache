//
// Object caching (currently using DynamoDB)
//

var Memcached = require('memcached');
var memcached;

var dbCacheLifetime = 24 * 3600; // dbcache = 24h;
var config = {};

function init(params) {
    config = params;
    if (config.dbCacheLifetime) {
        dbCacheLifetime = config.dbCacheLifetime;
    }

    memcached = new Memcached(config.cacheServer, {
        maxExpiration: dbCacheLifetime
    });
}

function getCacheKey(type, identifier) {
    return type + "-" + identifier;
}

function getDoc(type, identifier, callback) {
    if (callback == null) {
        callback = function() {};
    }
    var cacheKey = getCacheKey(type, identifier);

    memcached.get(cacheKey, function(err, dataStr) {
        if (err) {
            return callback("Cache error " + err, null);
        } else {
            if (dataStr === undefined) {
                return callback(null,null);
            }
            
            var doc = JSON.parse(dataStr);
            var meta = doc.cacheMeta || {cacheTimeStamp : 0} ; // Fallback in case of schema changes
            var now = Date.now();
            
            if ((now - meta.cacheTimestamp) < dbCacheLifetime ) {
                doc.cacheMeta.src = "dbcache";
                doc.cacheMeta.memCacheTimeStamp = new Date().getTime();
                return callback(null,doc);
            }
            // Cache invalid or does not exist
            return callback(null,null);
        }
    }); 
}

function setDoc(type, identifier,data, callback) {
    if (callback == null) {
        callback = function() {};
    }
	data.cacheMeta = {
		'cacheTimestamp' : new Date().getTime()
	};
    var cacheKey = getCacheKey(type, identifier);
    
    memcached.set(cacheKey, JSON.stringify(data), dbCacheLifetime, function(err, data) {
        if (err) {
            return callback("Cache error: " + err, null); 
        }

        return callback(null, data);
    });
}

module.exports = exports = {
    init : init,
    getDoc : getDoc,
    setDoc : setDoc
}